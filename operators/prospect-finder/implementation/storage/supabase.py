"""
Prospect Finder — Supabase storage layer.

Writes prospect records to the `prospects` table.

IMPORTANT: no merge-duplicates upsert here — it can null out enrichment/CRM
fields omitted from the INSERT payload and overwrite manual edits. Instead:

  1. GET the batch's place_ids to find existing rows (abort the batch on GET error).
  2. Existing rows  → PATCH by numeric id, whitelisted Maps fields only, only
     filling fields that are empty on the existing row; rating/review_count as
     a pair only when the new review_count is strictly greater. Intake columns
     are recomputed from the preserved merged row and PATCHed only if changed.
     Status, crm_status, run_id, first_seen_at, analysed_at, scores, owner and
     outreach fields are never touched. No meaningful change → skip PATCH.
     Rows that meet (or would meet) the check_outreach_eligibility trigger's
     auto-READY conditions are skipped with a warning and counted as errors —
     intake refresh must never queue outreach indirectly.
  3. New place_ids  → POST a single record, Prefer: return=minimal.
     ANY 409 unique conflict (place_id, review_slug, ...) is an error.
"""

import logging
import os
import re
from typing import Any

import requests

from scraper.filters import compute_intake

logger = logging.getLogger("prospect-finder.supabase")

TABLE = "prospects"

BATCH_SIZE = 50

# place_ids are interpolated into an in.(...) filter — validate before use
# rather than interpolate arbitrary text.
PLACE_ID_RE = re.compile(r"^[A-Za-z0-9_-]+$")

# Whitelisted mutable Maps fields — the only columns a PATCH may fill, and only
# when the existing row's field is empty. rating/review_count are handled as a
# pair separately. Never status, crm_status, run_id, first_seen_at,
# analysed_at, scores, owner or outreach fields.
FILL_WHEN_EMPTY_FIELDS = [
    "name", "category", "address", "city", "postcode",
    "email", "phone", "website",
    "google_maps_url", "latitude", "longitude",
    "search_query", "search_location",
]

# Everything _patch_body can legitimately write — fill fields, the rating pair,
# recomputed flags, and intake columns.
PATCHABLE_FIELDS = FILL_WHEN_EMPTY_FIELDS + [
    "rating", "review_count",
    "website_exists", "email_exists", "qualified",
    "intake_category", "intake_priority", "intake_signals",
]

INTAKE_FIELDS = ["intake_category", "intake_priority", "intake_signals"]

# Exact lead-authored existing-row lookup. Selects every column _patch_body
# needs plus the check_outreach_eligibility trigger preconditions
# (outreach_status + email + review_slug + mockup_url/mockup_urls).
EXISTING_SELECT = (
    "id,place_id,name,category,address,city,postcode,email,phone,website,"
    "rating,review_count,google_maps_url,latitude,longitude,"
    "search_query,search_location,"
    "website_exists,email_exists,qualified,"
    "intake_category,intake_priority,intake_signals,"
    "outreach_status,review_slug,mockup_url,mockup_urls"
)


def _get_headers() -> dict[str, str]:
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    if not service_key:
        raise EnvironmentError(
            "SUPABASE_SERVICE_KEY is not set — check your .env file."
        )
    return {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }


def _get_base_url() -> str:
    url = os.getenv("SUPABASE_URL")
    if not url:
        raise EnvironmentError(
            "SUPABASE_URL is not set — check your .env file."
        )
    return url.rstrip("/")


def _is_empty(value: Any) -> bool:
    return value is None or (isinstance(value, str) and not value.strip())


def _nonnegative_number(value) -> float | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    if value < 0:
        return None
    return float(value)


def _fetch_existing(base_url: str, headers: dict[str, str], place_ids: list[str]) -> dict[str, dict]:
    """
    GET existing rows for the batch's place_ids.

    Raises RuntimeError on failure — the caller aborts the batch rather than
    risk an INSERT overwriting an existing row.
    """
    url = f"{base_url}/rest/v1/{TABLE}"
    params = {
        "select": EXISTING_SELECT,
        "place_id": f"in.({','.join(place_ids)})",
        "limit": "50",
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=15)
    except requests.exceptions.RequestException as exc:
        raise RuntimeError(f"Supabase existing-row lookup failed: {exc}") from exc

    if response.status_code == 401:
        raise PermissionError(
            "Supabase authentication failed. Check SUPABASE_SERVICE_KEY in your .env file."
        )
    if not response.ok:
        raise RuntimeError(
            f"Supabase existing-row lookup error — HTTP {response.status_code}: {response.text[:300]}"
        )

    return {row["place_id"]: row for row in response.json()}


def _merged_row(record: dict[str, Any], existing: dict[str, Any]) -> dict[str, Any]:
    """
    The preserved merged row: every existing nonempty value wins; the record
    only fills fields the existing row left empty. rating/review_count move as
    a pair from whichever side has the strictly greater review_count.
    """
    merged = dict(record)
    for field in FILL_WHEN_EMPTY_FIELDS:
        if not _is_empty(existing.get(field)):
            merged[field] = existing[field]
    existing_rc = _nonnegative_number(existing.get("review_count"))
    record_rc = _nonnegative_number(record.get("review_count"))
    if existing_rc is not None and (record_rc is None or existing_rc >= record_rc):
        merged["rating"] = existing.get("rating")
        merged["review_count"] = existing.get("review_count")
    merged["website_exists"] = not _is_empty(merged.get("website"))
    merged["email_exists"] = not _is_empty(merged.get("email"))
    merged["qualified"] = merged["website_exists"] and merged["email_exists"]
    return merged


def _meets_auto_ready_risk(existing: dict[str, Any], merged: dict[str, Any]) -> bool:
    """
    check_outreach_eligibility marks a row READY on ANY UPDATE when
    outreach_status is NULL/NOT_READY and the row has email + review_slug +
    mockup_url (or nonempty mockup_urls).
    """
    if existing.get("outreach_status") not in (None, "NOT_READY"):
        return False
    has_email = not _is_empty(merged.get("email"))
    has_review_slug = not _is_empty(existing.get("review_slug"))
    mockups = existing.get("mockup_urls")
    has_mockup = not _is_empty(existing.get("mockup_url")) or (
        isinstance(mockups, list) and len(mockups) > 0
    )
    return has_email and has_review_slug and has_mockup


def _patch_body(record: dict[str, Any], existing: dict[str, Any], merged: dict[str, Any]) -> dict[str, Any]:
    """
    Whitelisted fill-empty fields, the rating pair (only when the new
    review_count is strictly greater), recomputed flags when website/email
    were filled, and intake fields only if changed from existing values.
    """
    body: dict[str, Any] = {}
    for field in FILL_WHEN_EMPTY_FIELDS:
        if _is_empty(existing.get(field)) and not _is_empty(record.get(field)):
            body[field] = record[field]

    existing_rc = _nonnegative_number(existing.get("review_count"))
    record_rc = _nonnegative_number(record.get("review_count"))
    if record_rc is not None and (existing_rc is None or record_rc > existing_rc):
        body["rating"] = record.get("rating")
        body["review_count"] = record.get("review_count")

    if "website" in body or "email" in body:
        body["website_exists"] = merged["website_exists"]
        body["email_exists"] = merged["email_exists"]
        body["qualified"] = merged["qualified"]

    intake = compute_intake(
        merged.get("search_query") or merged.get("category"),
        merged.get("rating"),
        merged.get("review_count"),
        merged.get("email"),
        merged.get("phone"),
        merged.get("website"),
    )
    for field in INTAKE_FIELDS:
        if field in record and intake[field] != existing.get(field):
            body[field] = intake[field]
    return body


def _patch_existing(
    base_url: str,
    headers: dict[str, str],
    record: dict[str, Any],
    existing: dict[str, Any],
) -> bool | None:
    """
    PATCH an existing row. Returns True on write, None when skipped (no
    meaningful change — triggers have real side effects), False on error
    (including auto-ready-risk rows, which require human review).
    """
    merged = _merged_row(record, existing)

    # Body first: a no-op rerun on a risky row is just a skip, not an error.
    body = _patch_body(record, existing, merged)
    if not body:
        return None

    if _meets_auto_ready_risk(existing, merged):
        logger.warning(
            "Skipping PATCH for id %s (%s) — row meets check_outreach_eligibility "
            "auto-READY preconditions (email + review_slug + mockup). Human review required.",
            existing["id"], record.get("place_id"),
        )
        return False

    url = f"{base_url}/rest/v1/{TABLE}"
    params = {"id": f"eq.{existing['id']}"}

    try:
        response = requests.patch(url, json=body, headers=headers, params=params, timeout=15)
    except requests.exceptions.RequestException as exc:
        logger.error("Supabase PATCH failed for id %s: %s", existing["id"], exc)
        return False

    if response.status_code == 401:
        raise PermissionError(
            "Supabase authentication failed. Check SUPABASE_SERVICE_KEY in your .env file."
        )
    if not response.ok:
        logger.error(
            "Supabase PATCH error for id %s — HTTP %d: %s",
            existing["id"], response.status_code, response.text[:300],
        )
        return False
    return True


def _insert_new(
    base_url: str,
    headers: dict[str, str],
    record: dict[str, Any],
) -> bool:
    """
    POST a single new record. ANY 409 unique conflict (place_id, review_slug,
    or other constraint) is an error — logged and counted, never a success.
    """
    url = f"{base_url}/rest/v1/{TABLE}"
    post_headers = {**headers, "Prefer": "return=minimal"}

    try:
        response = requests.post(url, json=record, headers=post_headers, timeout=15)
    except requests.exceptions.RequestException as exc:
        logger.error("Supabase POST failed for %s: %s", record.get("place_id"), exc)
        return False

    if response.status_code == 401:
        raise PermissionError(
            "Supabase authentication failed. Check SUPABASE_SERVICE_KEY in your .env file."
        )
    if response.status_code == 409:
        logger.error(
            "Unique conflict on %s — a concurrent insert or colliding "
            "review_slug; existing row left untouched.",
            record.get("place_id"),
        )
        return False
    if not response.ok:
        logger.error(
            "Supabase POST error for %s — HTTP %d: %s",
            record.get("place_id"), response.status_code, response.text[:300],
        )
        return False
    return True


def upsert_prospects(records: list[dict[str, Any]]) -> tuple[int, int]:
    """
    Write a batch of prospect records to Supabase using the
    GET-lookup → PATCH-or-POST flow (no merge-duplicates upsert).

    Returns:
        (stored_or_updated_count, error_count)
    """
    if not records:
        return 0, 0

    base_url = _get_base_url()
    headers = _get_headers()

    success_count = 0
    error_count = 0

    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i : i + BATCH_SIZE]
        batch_no = i // BATCH_SIZE

        # Validate every place_id before interpolation into in.(...)
        place_ids = [r.get("place_id") for r in batch]
        if any(
            not isinstance(pid, str) or not PLACE_ID_RE.match(pid)
            for pid in place_ids
        ):
            logger.error(
                "Batch %d aborted — unexpected place_id value(s) fail validation (%s).",
                batch_no, place_ids,
            )
            error_count += len(batch)
            continue

        try:
            existing = _fetch_existing(base_url, headers, place_ids)
        except RuntimeError as exc:
            logger.error("Batch %d aborted — %s", batch_no, exc)
            error_count += len(batch)
            continue

        for record in batch:
            row = existing.get(record["place_id"])
            if row is None:
                if _insert_new(base_url, headers, record):
                    success_count += 1
                else:
                    error_count += 1
            else:
                result = _patch_existing(base_url, headers, record, row)
                if result is False:
                    error_count += 1
                elif result is True:
                    success_count += 1
                # None → no meaningful change, PATCH skipped

        logger.debug(
            "Batch %d: processed %d records (%d existing rows).",
            batch_no, len(batch), len(existing),
        )

    return success_count, error_count


def count_prospects() -> int:
    """Return the total number of rows in the prospects table (for logging)."""
    base_url = _get_base_url()
    service_key = os.getenv("SUPABASE_SERVICE_KEY", "")
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Prefer": "count=exact",
    }
    url = f"{base_url}/rest/v1/{TABLE}"

    try:
        response = requests.head(url, headers=headers, timeout=10)
        content_range = response.headers.get("Content-Range", "")
        # Format: "0-49/123" — we want the total after /
        if "/" in content_range:
            return int(content_range.split("/")[1])
    except Exception:
        pass
    return -1

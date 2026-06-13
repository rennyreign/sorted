"""
Prospect Finder — Supabase storage layer.

Upserts prospect records to the `prospects` table.
Idempotent: safe to re-run. Conflicts on `place_id` are handled
by updating the mutable fields and refreshing `updated_at`.
"""

import logging
import os
from typing import Any

import requests

logger = logging.getLogger("prospect-finder.supabase")

TABLE = "prospects"

# Fields we update on conflict (place_id already exists).
# We never overwrite first_seen_at, place_id, or run_id from the first insert.
UPSERT_ON_CONFLICT = "place_id"

# Fields to update when a record already exists
UPDATE_FIELDS = [
    "name", "category", "address", "city", "postcode",
    "phone", "website", "email",
    "website_exists", "email_exists", "qualified",
    "rating", "review_count", "google_maps_url",
    "latitude", "longitude",
    "search_query", "search_location",
    # updated_at is handled by the database trigger
]


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
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }


def _get_base_url() -> str:
    url = os.getenv("SUPABASE_URL")
    if not url:
        raise EnvironmentError(
            "SUPABASE_URL is not set — check your .env file."
        )
    return url.rstrip("/")


def upsert_prospects(records: list[dict[str, Any]]) -> tuple[int, int]:
    """
    Upsert a batch of prospect records to Supabase.

    Uses PostgREST upsert with `on_conflict=place_id` so re-runs
    update existing records rather than creating duplicates.

    Returns:
        (inserted_or_updated_count, error_count)
    """
    if not records:
        return 0, 0

    base_url = _get_base_url()
    headers = _get_headers()
    url = f"{base_url}/rest/v1/{TABLE}"
    params = {"on_conflict": UPSERT_ON_CONFLICT}

    # Send in batches of 50 to stay within PostgREST limits
    batch_size = 50
    success_count = 0
    error_count = 0

    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]

        try:
            response = requests.post(
                url,
                json=batch,
                headers=headers,
                params=params,
                timeout=30,
            )
        except requests.exceptions.RequestException as exc:
            logger.error("Supabase request failed for batch %d: %s", i // batch_size, exc)
            error_count += len(batch)
            continue

        if response.status_code in (200, 201):
            success_count += len(batch)
            logger.debug(
                "Batch %d: upserted %d records successfully.",
                i // batch_size, len(batch),
            )
        elif response.status_code == 401:
            raise PermissionError(
                "Supabase authentication failed. Check SUPABASE_SERVICE_KEY in your .env file."
            )
        else:
            logger.error(
                "Supabase upsert error for batch %d — HTTP %d: %s",
                i // batch_size, response.status_code, response.text[:300],
            )
            error_count += len(batch)

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

"""
New Business Finder — Supabase storage layer.

Reads the existing prospects table, deduplicates Companies House records, and
writes inserts/updates. Also persists run summaries to prospect_runs.
"""

import logging
import os
from datetime import date, datetime, timezone
from typing import Any

import requests

logger = logging.getLogger("new-business-finder.supabase")

TABLE = "prospects"
RUNS_TABLE = "prospect_runs"


def _get_headers(extra: dict[str, str] | None = None) -> dict[str, str]:
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    if not service_key:
        raise EnvironmentError(
            "SUPABASE_SERVICE_KEY is not set — check your .env file."
        )
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
    if extra:
        headers.update(extra)
    return headers


def _get_base_url() -> str:
    url = os.getenv("SUPABASE_URL")
    if not url:
        raise EnvironmentError("SUPABASE_URL is not set — check your .env file.")
    return url.rstrip("/")


def _normalise_name(name: str) -> str:
    """Match the normalisation used in filters.py for deduplication."""
    suffixes = (
        " limited",
        " ltd",
        " llp",
        " plc",
        " ltd.",
        " limited.",
    )
    lowered = name.strip().lower()
    for suffix in suffixes:
        if lowered.endswith(suffix):
            lowered = lowered[: -len(suffix)].strip()
            break
    return " ".join(lowered.split())


def fetch_existing_by_company_numbers(
    numbers: list[str],
) -> dict[str, dict[str, Any]]:
    """Return existing prospects keyed by source_company_number."""
    if not numbers:
        return {}

    base_url = _get_base_url()
    headers = _get_headers({"Prefer": "return=representation"})
    url = f"{base_url}/rest/v1/{TABLE}"

    # Supabase/PostgREST supports comma-separated values for `in`.
    params = {
        "source_company_number": f"in.({','.join(numbers)})",
        "select": "id,source,place_id,name,address,city,postcode,website,email,owner_name,source_company_number,source_incorporation_date,source_sic_codes,source_url",
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)
    except requests.exceptions.RequestException as exc:
        logger.error("Failed to fetch existing by company numbers: %s", exc)
        return {}

    if response.status_code == 401:
        raise PermissionError("Supabase authentication failed.")

    if not response.ok:
        logger.error(
            "Supabase fetch error HTTP %d: %s", response.status_code, response.text[:300]
        )
        return {}

    try:
        rows = response.json()
    except ValueError:
        return {}

    return {row["source_company_number"]: row for row in rows if row.get("source_company_number")}


def fetch_existing_by_postcodes(
    postcodes: set[str],
) -> list[dict[str, Any]]:
    """
    Fetch existing prospects that share any of the given postcodes.
    """
    if not postcodes:
        return []

    base_url = _get_base_url()
    headers = _get_headers({"Prefer": "return=representation"})
    url = f"{base_url}/rest/v1/{TABLE}"

    params = {
        "postcode": f"in.({','.join(postcodes)})",
        "select": "id,source,place_id,name,address,city,postcode,website,email,owner_name,source_company_number,source_incorporation_date,source_sic_codes,source_url",
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)
    except requests.exceptions.RequestException as exc:
        logger.error("Failed to fetch existing by postcodes: %s", exc)
        return []

    if response.status_code == 401:
        raise PermissionError("Supabase authentication failed.")

    if not response.ok:
        logger.error(
            "Supabase postcode fetch error HTTP %d: %s",
            response.status_code,
            response.text[:300],
        )
        return []

    try:
        return response.json()
    except ValueError:
        return []


def _build_update(record: dict[str, Any], existing: dict[str, Any]) -> dict[str, Any]:
    """
    Build an update payload that enriches an existing prospect with Companies House
    metadata without overwriting higher-quality Google Maps data.
    """
    updates: dict[str, Any] = {
        "source_company_number": record["source_company_number"],
        "source_incorporation_date": record["source_incorporation_date"],
        "source_sic_codes": record["source_sic_codes"],
        "source_url": record["source_url"],
    }

    # Only fill missing CRM fields with CH data.
    for src_key, dest_key in (
        ("category", "category"),
        ("address", "address"),
        ("city", "city"),
        ("postcode", "postcode"),
    ):
        if record.get(src_key) and not existing.get(dest_key):
            updates[dest_key] = record[src_key]

    return updates


def _insert_payload(record: dict[str, Any], run_id: str) -> dict[str, Any]:
    """Build a prospects insert row from a normalised Companies House record."""
    return {
        "source": "companies_house",
        "source_company_number": record["source_company_number"],
        "source_incorporation_date": record["source_incorporation_date"],
        "source_sic_codes": record["source_sic_codes"],
        "source_url": record["source_url"],
        "name": record["name"],
        "category": record.get("category"),
        "address": record.get("address"),
        "city": record.get("city"),
        "postcode": record.get("postcode"),
        "status": "prospect",
        "crm_status": "new",
        "website_exists": False,
        "email_exists": False,
        "qualified": False,
        "run_id": run_id,
    }


def store_companies_house_records(
    records: list[dict[str, Any]],
    run_id: str,
) -> dict[str, int]:
    """
    Deduplicate and write Companies House records to the prospects table.

    Returns counters:
        created: new CH prospect rows inserted
        updated: existing rows enriched/updated
        duplicate: rows that matched an existing record by company number
    """
    counters = {"created": 0, "updated": 0, "duplicate": 0, "error": 0}

    if not records:
        return counters

    base_url = _get_base_url()
    headers = _get_headers({"Prefer": "return=minimal"})

    by_number = fetch_existing_by_company_numbers(
        [r["source_company_number"] for r in records]
    )

    postcode_index: dict[str, list[dict[str, Any]]] = {}
    postcodes = {r.get("postcode") for r in records if r.get("postcode")}
    for row in fetch_existing_by_postcodes(postcodes):
        pc = row.get("postcode")
        if pc:
            postcode_index.setdefault(pc.upper(), []).append(row)

    inserts: list[dict[str, Any]] = []
    updates: list[tuple[int, dict[str, Any]]] = []

    for record in records:
        number = record["source_company_number"]

        # 1. Exact company number duplicate — always update source metadata.
        if number in by_number:
            existing = by_number[number]
            payload = _build_update(record, existing)
            updates.append((existing["id"], payload))
            counters["duplicate"] += 1
            continue

        # 2. Fuzzy name + postcode duplicate against Google Maps prospects.
        matched = False
        postcode = record.get("postcode")
        if postcode:
            normalised = _normalise_name(record["name"])
            for existing in postcode_index.get(postcode.upper(), []):
                existing_name = _normalise_name(existing.get("name") or "")
                if existing_name == normalised:
                    payload = _build_update(record, existing)
                    # Merge into the Maps record while keeping source as Maps.
                    updates.append((existing["id"], payload))
                    counters["duplicate"] += 1
                    matched = True
                    break

        if matched:
            continue

        inserts.append(_insert_payload(record, run_id))

    # Bulk insert new CH prospects.
    if inserts:
        url = f"{base_url}/rest/v1/{TABLE}"
        try:
            response = requests.post(
                url,
                json=inserts,
                headers={**headers, "Prefer": "return=minimal,resolution=ignore-duplicates"},
                timeout=30,
            )
            if response.status_code in (200, 201):
                counters["created"] += len(inserts)
                logger.info("Inserted %d new Companies House prospects.", len(inserts))
            elif response.status_code == 401:
                raise PermissionError("Supabase authentication failed.")
            else:
                logger.error(
                    "Supabase insert error HTTP %d: %s",
                    response.status_code,
                    response.text[:300],
                )
                counters["error"] += len(inserts)
        except requests.exceptions.RequestException as exc:
            logger.error("Supabase insert request failed: %s", exc)
            counters["error"] += len(inserts)

    # Apply updates one-by-one (updates are usually sparse and small).
    for pk, payload in updates:
        url = f"{base_url}/rest/v1/{TABLE}?id=eq.{pk}"
        try:
            response = requests.patch(url, json=payload, headers=headers, timeout=30)
            if response.status_code in (200, 204):
                counters["updated"] += 1
            elif response.status_code == 401:
                raise PermissionError("Supabase authentication failed.")
            else:
                logger.error(
                    "Supabase update error HTTP %d: %s",
                    response.status_code,
                    response.text[:300],
                )
                counters["error"] += 1
        except requests.exceptions.RequestException as exc:
            logger.error("Supabase update request failed: %s", exc)
            counters["error"] += 1

    logger.info(
        "Storage result: %d created, %d updated, %d duplicates, %d errors",
        counters["created"],
        counters["updated"],
        counters["duplicate"],
        counters["error"],
    )
    return counters


def insert_run_summary(
    run_id: str,
    started_at: str,
    requested_date_from: date,
    requested_date_to: date,
    requested_location: str | None,
    records_returned: int,
    records_rejected: int,
    duplicates_found: int,
    prospects_created: int,
    prospects_updated: int,
    errors: int,
    error_summary: str | None = None,
) -> None:
    """Persist a run summary row to prospect_runs."""
    base_url = _get_base_url()
    headers = _get_headers({"Prefer": "return=minimal"})
    url = f"{base_url}/rest/v1/{RUNS_TABLE}"

    payload = {
        "run_id": run_id,
        "operator": "companies_house",
        "started_at": started_at,
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "requested_date_from": requested_date_from.isoformat(),
        "requested_date_to": requested_date_to.isoformat(),
        "requested_location": requested_location,
        "records_returned": records_returned,
        "records_rejected": records_rejected,
        "duplicates_found": duplicates_found,
        "prospects_created": prospects_created,
        "prospects_updated": prospects_updated,
        "errors": errors,
        "error_summary": error_summary,
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        if response.status_code in (200, 201):
            logger.info("Run summary written to prospect_runs.")
        elif response.status_code == 401:
            raise PermissionError("Supabase authentication failed.")
        else:
            logger.error(
                "Failed to write run summary HTTP %d: %s",
                response.status_code,
                response.text[:300],
            )
    except requests.exceptions.RequestException as exc:
        logger.error("Failed to write run summary: %s", exc)

"""
Contact Enricher — Supabase storage layer.

Fetches prospects that have a website but no email yet.
Writes discovered email back to the prospect row.
"""

import logging
import os

import requests

logger = logging.getLogger("contact-enricher.supabase")

TABLE = "prospects"


def _get_headers(include_prefer: bool = False) -> dict[str, str]:
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
    if include_prefer:
        headers["Prefer"] = "return=minimal"
    return headers


def _get_base_url() -> str:
    url = os.getenv("SUPABASE_URL")
    if not url:
        raise EnvironmentError("SUPABASE_URL is not set — check your .env file.")
    return url.rstrip("/")


def fetch_unenriched(limit: int = 200) -> list[dict]:
    """
    Fetch prospects that have a website but no email address yet.

    Returns list of dicts with: place_id, name, website.
    """
    base_url = _get_base_url()
    headers = _get_headers()
    url = f"{base_url}/rest/v1/{TABLE}"

    params = {
        "select": "place_id,name,website,search_location",
        "website_exists": "eq.true",
        "email": "is.null",
        # London first, then by score descending — ensures primary city is always enriched first
        "order": "search_location.asc.nullslast,site_score.desc.nullslast",
        "limit": str(limit),
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=15)
    except requests.exceptions.RequestException as exc:
        raise RuntimeError(f"Supabase fetch failed: {exc}") from exc

    if response.status_code == 401:
        raise PermissionError(
            "Supabase authentication failed. Check SUPABASE_SERVICE_KEY."
        )

    if not response.ok:
        raise RuntimeError(
            f"Supabase fetch error — HTTP {response.status_code}: {response.text[:300]}"
        )

    data = response.json()
    logger.info("Fetched %d unenriched prospects from Supabase.", len(data))
    return data


def write_email(place_id: str, email: str) -> bool:
    """
    Write a discovered email address back to the prospect row.

    Returns True on success, False on error.
    """
    base_url = _get_base_url()
    headers = _get_headers(include_prefer=True)
    url = f"{base_url}/rest/v1/{TABLE}"

    params = {"place_id": f"eq.{place_id}"}

    try:
        response = requests.patch(
            url,
            json={"email": email},
            headers=headers,
            params=params,
            timeout=15,
        )
    except requests.exceptions.RequestException as exc:
        logger.error("Supabase write failed for %s: %s", place_id, exc)
        return False

    if response.status_code == 401:
        raise PermissionError(
            "Supabase authentication failed. Check SUPABASE_SERVICE_KEY."
        )

    if not response.ok:
        logger.error(
            "Supabase write error for %s — HTTP %d: %s",
            place_id, response.status_code, response.text[:300],
        )
        return False

    return True

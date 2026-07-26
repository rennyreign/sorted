"""
Email Enricher — Supabase storage layer.

Fetches prospects that have an owner_name (from Companies House) but
no owner_email yet. Writes discovered emails back to the prospect row.
"""

import logging
import os
from datetime import datetime, timezone

import requests

logger = logging.getLogger("email-enricher.supabase")

TABLE = "prospects"

# Social media / third-party domains where hunter.io can't find business emails
REJECT_DOMAINS = (
    "instagram.com", "facebook.com", "fb.com", "wa.me",
    "booking.com", "linktr.ee", "calendly.com",
    "just-eat.co.uk", "tryotter.com", "deliveroo.co.uk",
    "ubereats.com", "yelp.com", "tripadvisor.com",
    "uel.ac.uk", "warwick.ac.uk", "bhmm.org.uk",
    "sitelift.site", "newmapiuk.top",
)


def _get_headers() -> dict[str, str]:
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    if not service_key:
        raise EnvironmentError("SUPABASE_SERVICE_KEY is not set — check your .env file.")
    return {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }


def _get_base_url() -> str:
    url = os.getenv("SUPABASE_URL")
    if not url:
        raise EnvironmentError("SUPABASE_URL is not set — check your .env file.")
    return url.rstrip("/")


def fetch_prospects_for_enrichment(limit: int = 50) -> list[dict]:
    """
    Fetch prospects that have an owner_name (from Companies House) but
    no owner_email. Only returns prospects with a real website domain
    (not social media links).

    Returns list of dicts with: place_id, name, owner_name, website.
    """
    base_url = _get_base_url()
    headers = _get_headers()
    url = f"{base_url}/rest/v1/{TABLE}"

    params = {
        "select": "place_id,name,owner_name,website",
        "owner_name": "not.is.null",
        "owner_email": "is.null",
        "website": "not.is.null",
        "order": "owner_identified_at.asc",
        "limit": str(limit * 3),  # over-fetch since we'll filter social media client-side
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=15)
    except requests.exceptions.RequestException as exc:
        raise RuntimeError(f"Supabase fetch failed: {exc}") from exc

    if response.status_code == 401:
        raise PermissionError("Supabase authentication failed. Check SUPABASE_SERVICE_KEY.")
    if not response.ok:
        raise RuntimeError(f"Supabase fetch error — HTTP {response.status_code}: {response.text[:300]}")

    data = response.json()
    # Filter out social media / third-party domains
    from urllib.parse import urlparse
    filtered = []
    for p in data:
        website = p.get("website", "")
        parsed = urlparse(website)
        host = parsed.netloc or parsed.path
        if host.startswith("www."):
            host = host[4:]
        host = host.split(":")[0]
        if not host:
            continue
        if any(reject in host for reject in REJECT_DOMAINS):
            continue
        filtered.append(p)
        if len(filtered) >= limit:
            break

    logger.info("Fetched %d prospects for email enrichment (%d after domain filter).", len(data), len(filtered))
    return filtered


def write_owner_email(
    place_id: str,
    email: str,
    source: str,
    confidence: int | None,
    status: str | None = None,
) -> bool:
    """
    Write a discovered owner email back to the prospect row.

    Returns True on success, False on error.
    """
    base_url = _get_base_url()
    headers = _get_headers()
    headers["Prefer"] = "return=minimal"
    url = f"{base_url}/rest/v1/{TABLE}"

    params = {"place_id": f"eq.{place_id}"}

    payload = {
        "owner_email": email,
        "owner_email_source": source,
        "owner_email_confidence": confidence,
        "owner_enriched_at": datetime.now(timezone.utc).isoformat(),
    }
    if status:
        payload["owner_email_status"] = status

    try:
        response = requests.patch(url, json=payload, headers=headers, params=params, timeout=15)
    except requests.exceptions.RequestException as exc:
        logger.error("Supabase write failed for %s: %s", place_id, exc)
        return False

    if response.status_code == 401:
        raise PermissionError("Supabase authentication failed. Check SUPABASE_SERVICE_KEY.")
    if not response.ok:
        logger.error("Supabase write error for %s — HTTP %d: %s", place_id, response.status_code, response.text[:300])
        return False

    return True


def mark_enrichment_attempted(place_id: str) -> bool:
    """
    Mark a prospect as having been attempted for enrichment (even if no
    email was found), so we don't keep retrying.
    """
    base_url = _get_base_url()
    headers = _get_headers()
    headers["Prefer"] = "return=minimal"
    url = f"{base_url}/rest/v1/{TABLE}"

    params = {"place_id": f"eq.{place_id}"}

    payload = {
        "owner_enriched_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        response = requests.patch(url, json=payload, headers=headers, params=params, timeout=15)
    except requests.exceptions.RequestException as exc:
        logger.error("Supabase write failed for %s: %s", place_id, exc)
        return False

    if not response.ok:
        logger.error("Supabase write error for %s — HTTP %d", place_id, response.status_code)
        return False

    return True

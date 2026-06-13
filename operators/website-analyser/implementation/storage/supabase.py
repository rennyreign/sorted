"""
Website Analyser — Supabase storage layer.

Reads unanalysed prospects from the prospects table.
Writes analysis results back as a PATCH update by place_id.
"""

import logging
import os
from datetime import datetime, timezone
from typing import Any

import requests

logger = logging.getLogger("website-analyser.supabase")

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


def fetch_unanalysed(limit: int = 200) -> list[dict]:
    """
    Fetch prospects that have a website but no site_score yet.

    Returns list of dicts with: place_id, name, category, city, website.
    """
    base_url = _get_base_url()
    headers = _get_headers()
    url = f"{base_url}/rest/v1/{TABLE}"

    params = {
        "select": "place_id,name,category,city,website,search_location",
        "website_exists": "eq.true",
        "site_score": "is.null",
        "order": "first_seen_at.desc",
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
    logger.info("Fetched %d unanalysed prospects from Supabase.", len(data))
    return data


def write_analysis(place_id: str, analysis: dict[str, Any]) -> bool:
    """
    Write analysis results back to the prospect row identified by place_id.

    Returns True on success, False on error.
    """
    base_url = _get_base_url()
    headers = _get_headers(include_prefer=True)
    url = f"{base_url}/rest/v1/{TABLE}"

    now = datetime.now(timezone.utc).isoformat()

    update_data = {
        "site_score":               analysis.get("prospect_score"),
        "business_quality_score":   analysis.get("business_quality_score"),
        "opportunity_score":        analysis.get("opportunity_score"),
        "site_analysis":            analysis.get("site_analysis"),
        "site_weaknesses":          analysis.get("site_weaknesses", []),
        "outreach_angle":           analysis.get("outreach_angle"),
        "recommendation":           analysis.get("recommendation"),
        "revshare_potential":       analysis.get("revshare_potential"),
        "modernity_gap":            analysis.get("modernity_gap"),
        "screenshot_url":           analysis.get("screenshot_url"),
        "analysed_at":              now,
    }

    # Remove None values — don't overwrite with null
    update_data = {k: v for k, v in update_data.items() if v is not None}

    params = {"place_id": f"eq.{place_id}"}

    try:
        response = requests.patch(
            url,
            json=update_data,
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


def count_analysed() -> int:
    """Return the total number of prospects with a site_score (for logging)."""
    base_url = _get_base_url()
    service_key = os.getenv("SUPABASE_SERVICE_KEY", "")
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Prefer": "count=exact",
    }
    url = f"{base_url}/rest/v1/{TABLE}"
    params = {"site_score": "not.is.null"}

    try:
        response = requests.head(url, headers=headers, params=params, timeout=10)
        content_range = response.headers.get("Content-Range", "")
        if "/" in content_range:
            return int(content_range.split("/")[1])
    except Exception:
        pass
    return -1

"""
Modernisation Assessment — optional Supabase storage layer.

Writes assessment results back to the prospects table.
Run migration.sql in Supabase before enabling --write.
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any

import requests

logger = logging.getLogger("modernisation-assessment.storage")

TABLE = "prospects"


def _headers(prefer: bool = False) -> dict[str, str]:
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not key:
        raise EnvironmentError("SUPABASE_SERVICE_KEY is not set.")
    h = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    if prefer:
        h["Prefer"] = "return=minimal"
    return h


def _base_url() -> str:
    url = os.getenv("SUPABASE_URL")
    if not url:
        raise EnvironmentError("SUPABASE_URL is not set.")
    return url.rstrip("/")


def fetch_unanalysed(limit: int = 100) -> list[dict[str, Any]]:
    """Fetch prospects with a website but no modernisation assessment."""
    base = _base_url()
    url = f"{base}/rest/v1/{TABLE}"
    params = {
        "select": "place_id,name,category,city,website",
        "website_exists": "eq.true",
        "business_modernisation_score": "is.null",
        "order": "first_seen_at.desc",
        "limit": str(limit),
    }
    try:
        r = requests.get(url, headers=_headers(), params=params, timeout=15)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.RequestException as exc:
        raise RuntimeError(f"Supabase fetch failed: {exc}") from exc


def write_assessment(place_id: str, report: dict[str, Any]) -> bool:
    """Write a completed assessment back to the prospects table."""
    base = _base_url()
    url = f"{base}/rest/v1/{TABLE}"
    now = datetime.now(timezone.utc).isoformat()

    data = {
        "business_modernisation_score": report.get("business_modernisation_score"),
        "assessment_report": report,
        "assessed_at": now,
    }
    params = {"place_id": f"eq.{place_id}"}
    try:
        r = requests.patch(url, json=data, headers=_headers(prefer=True), params=params, timeout=15)
        r.raise_for_status()
        return True
    except requests.exceptions.RequestException as exc:
        logger.error("Supabase write failed for %s: %s", place_id, exc)
        return False

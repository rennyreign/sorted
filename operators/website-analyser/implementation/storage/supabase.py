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


def fetch_unanalysed(limit: int = 200, reanalyse: bool = False, maps_only: bool = False) -> list[dict]:
    """
    Fetch prospects that have a website. By default only returns rows with no
    prior analysis; reanalyse=True returns existing website rows for a fresh pass.
    maps_only=True restricts to Google Maps place IDs.

    Returns list of dicts with: place_id, name, category, city, website.
    """
    base_url = _get_base_url()
    headers = _get_headers()
    url = f"{base_url}/rest/v1/{TABLE}"

    params = {
        "select": "id,place_id,name,category,intake_category,intake_priority,city,website,postcode,rating,review_count,search_location,source_company_number",
        "website_exists": "eq.true",
        "order": "intake_priority.desc.nullslast,first_seen_at.desc",
        "limit": str(limit),
    }
    if not reanalyse:
        params["analysed_at"] = "is.null"
    if maps_only:
        params["place_id"] = "like.ChIJ*"

    try:
        response = requests.get(url, headers=headers, params=params, timeout=15)
        if not response.ok and "intake_" in response.text:
            logger.warning("Intake columns unavailable — falling back to first_seen_at ordering.")
            params["select"] = "id,place_id,name,category,city,website,postcode,rating,review_count,search_location,source_company_number"
            params["order"] = "first_seen_at.desc"
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
    logger.info("Fetched %d prospects from Supabase%s.", len(data), " for re-analysis" if reanalyse else "")
    return data


def fetch_ch_candidates(limit: int = 25, row_id: int | None = None) -> list[dict]:
    """Fetch matched prospects for a Companies-House-only refresh."""
    params = {
        "select": "id,place_id,name,postcode,source_company_number",
        "source_company_number": "not.is.null",
        "order": "prospect_score.desc.nullslast,id.asc",
        "limit": str(limit),
    }
    if row_id is not None:
        params["id"] = f"eq.{row_id}"
    else:
        params["qualified_lead"] = "eq.true"
        params["ch_data_updated_at"] = "is.null"
    response = requests.get(
        f"{_get_base_url()}/rest/v1/{TABLE}",
        headers=_get_headers(),
        params=params,
        timeout=15,
    )
    if response.status_code == 401:
        raise PermissionError("Supabase authentication failed. Check SUPABASE_SERVICE_KEY.")
    if not response.ok:
        raise RuntimeError(f"Supabase CH fetch error — HTTP {response.status_code}: {response.text[:300]}")
    return response.json()


_CH_REFRESH_FIELDS = (
    "source_company_number", "source_url", "source_incorporation_date", "source_sic_codes",
    "ch_status", "ch_incorporated_date", "ch_accounts_type", "ch_accounts_last_date",
    "ch_match_confidence", "ch_accounts_period_end", "ch_accounts_due_date",
    "ch_accounts_overdue", "ch_confirmation_due_date", "ch_confirmation_overdue",
    "ch_filing_url", "ch_filing_document_url", "ch_turnover", "ch_net_assets",
    "ch_cash", "ch_current_assets", "ch_liabilities", "ch_employees",
    "ch_financial_facts", "ch_data_updated_at",
)


def write_ch_enrichment(row_id: int, record: dict[str, Any]) -> bool:
    """Write only machine-sourced CH fields; never touch scores or CRM state."""
    update_data = {key: record.get(key) for key in _CH_REFRESH_FIELDS}
    for key in ("owner_name", "owner_role", "owner_source", "associated_names"):
        if record.get(key) is not None:
            update_data[key] = record[key]
    if record.get("owner_name"):
        update_data["owner_identified_at"] = datetime.now(timezone.utc).isoformat()
    response = requests.patch(
        f"{_get_base_url()}/rest/v1/{TABLE}",
        headers=_get_headers(include_prefer=True),
        params={"id": f"eq.{row_id}"},
        json=update_data,
        timeout=15,
    )
    if response.status_code == 401:
        raise PermissionError("Supabase authentication failed. Check SUPABASE_SERVICE_KEY.")
    if not response.ok:
        logger.error("Supabase CH write failed for id:%s — HTTP %d: %s", row_id, response.status_code, response.text[:300])
        return False
    return True


def write_analysis(place_id: str | None, record: dict[str, Any], row_id: int | None = None) -> bool:
    """
    Write the full analysis record back to the prospect row. Identified by
    place_id where present; falls back to the row's primary key `id`
    (Companies House-sourced prospects have no place_id).

    `record` is the merged output of vision + tech profile + Companies
    House check + the qualification gate (built in main.py).

    Returns True on success, False on error.
    """
    base_url = _get_base_url()
    headers = _get_headers(include_prefer=True)
    url = f"{base_url}/rest/v1/{TABLE}"

    now = datetime.now(timezone.utc).isoformat()

    update_data = {
        # Scores — site_score is site QUALITY (low = bad site = good prospect)
        "site_score":               record.get("site_score"),
        "business_quality_score":   record.get("business_quality_score"),
        "opportunity_score":        record.get("opportunity_score"),
        "prospect_score":           record.get("prospect_score"),
        # Copy
        "site_analysis":            record.get("site_analysis"),
        "review_summary":           record.get("review_summary"),
        "site_weaknesses":          record.get("site_weaknesses", []),
        "outreach_angle":           record.get("outreach_angle"),
        "modernity_gap":            record.get("modernity_gap"),
        # Tech profile
        "tech_stack":               record.get("tech_stack"),
        "site_platform":            record.get("site_platform"),
        "site_age_signal":          record.get("site_age_signal"),
        "site_built_estimate":      record.get("site_built_estimate"),
        # Price point / payback
        "service_price_point":      record.get("service_price_point"),
        "payback_jobs":             record.get("payback_jobs"),
        # Companies House
        "source_company_number":    record.get("source_company_number"),
        "source_url":               record.get("source_url"),
        "ch_status":                record.get("ch_status"),
        "ch_incorporated_date":     record.get("ch_incorporated_date"),
        "ch_accounts_type":         record.get("ch_accounts_type"),
        "ch_accounts_last_date":    record.get("ch_accounts_last_date"),
        "ch_match_confidence":      record.get("ch_match_confidence"),
        "ch_accounts_period_end":   record.get("ch_accounts_period_end"),
        "ch_accounts_due_date":     record.get("ch_accounts_due_date"),
        "ch_accounts_overdue":      record.get("ch_accounts_overdue"),
        "ch_confirmation_due_date": record.get("ch_confirmation_due_date"),
        "ch_confirmation_overdue":  record.get("ch_confirmation_overdue"),
        "ch_filing_url":            record.get("ch_filing_url"),
        "ch_filing_document_url":   record.get("ch_filing_document_url"),
        "ch_turnover":              record.get("ch_turnover"),
        "ch_net_assets":            record.get("ch_net_assets"),
        "ch_cash":                  record.get("ch_cash"),
        "ch_current_assets":        record.get("ch_current_assets"),
        "ch_liabilities":           record.get("ch_liabilities"),
        "ch_employees":             record.get("ch_employees"),
        "ch_financial_facts":       record.get("ch_financial_facts"),
        "ch_data_updated_at":       record.get("ch_data_updated_at"),
        "source_incorporation_date": record.get("source_incorporation_date"),
        "source_sic_codes":          record.get("source_sic_codes"),
        # Owner / associated people (from CH officers + PSCs)
        "owner_name":               record.get("owner_name"),
        "owner_role":               record.get("owner_role"),
        "owner_source":             record.get("owner_source"),
        "owner_identified_at":      now if record.get("owner_name") else None,
        "associated_names":         record.get("associated_names"),
        # Gate
        "qualified_lead":           record.get("qualified_lead"),
        "qualification_reasons":    record.get("qualification_reasons"),
        "analysed_at":              now,
    }

    # Remove None values — don't overwrite with null.
    # Exception: qualified_lead False must still be written.
    update_data = {
        k: v for k, v in update_data.items()
        if v is not None or k == "qualified_lead"
    }

    if place_id:
        params = {"place_id": f"eq.{place_id}"}
    elif row_id is not None:
        params = {"id": f"eq.{row_id}"}
    else:
        logger.error("write_analysis called with neither place_id nor row_id.")
        return False
    row_ref = place_id or f"id:{row_id}"

    try:
        response = requests.patch(
            url,
            json=update_data,
            headers=headers,
            params=params,
            timeout=15,
        )
    except requests.exceptions.RequestException as exc:
        logger.error("Supabase write failed for %s: %s", row_ref, exc)
        return False

    if response.status_code == 401:
        raise PermissionError(
            "Supabase authentication failed. Check SUPABASE_SERVICE_KEY."
        )

    if not response.ok:
        logger.error(
            "Supabase write error for %s — HTTP %d: %s",
            row_ref, response.status_code, response.text[:300],
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

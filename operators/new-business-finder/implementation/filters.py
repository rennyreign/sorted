"""
New Business Finder — record qualification and normalisation.

Maps raw Companies House company summaries to the shared prospects schema and
applies deterministic exclusions.
"""

import logging
import re
from datetime import date, datetime
from typing import Any

from config import (
    EXCLUDED_SIC_CODES,
    EXCLUDED_SIC_PREFIXES,
    SIC_CATEGORY_MAP,
)

logger = logging.getLogger("new-business-finder.filters")

# Postcode regex (standard UK outward + inward code)
_POSTCODE_RE = re.compile(
    r"\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b",
    re.IGNORECASE,
)

# Company statuses we never want regardless of the API filter.
_NON_ACTIVE_STATUSES = {
    "dissolved",
    "liquidation",
    "receivership",
    "administration",
    "voluntary-arrangement",
    "converted-closed",
    "insolvency-proceedings",
}


def _extract_postcode(address: dict[str, Any] | None, address_text: str | None) -> str | None:
    """Pull a UK postcode out of the structured address or address text."""
    if address:
        pc = address.get("postal_code")
        if pc:
            return _normalise_postcode(pc)
    if address_text:
        match = _POSTCODE_RE.search(address_text)
        if match:
            return _normalise_postcode(f"{match.group(1)} {match.group(2)}")
    return None


def _normalise_postcode(pc: str) -> str:
    """Return a consistently formatted postcode in upper case."""
    return pc.strip().upper()


def _format_address(address: dict[str, Any] | None) -> str | None:
    """Flatten the CH registered office address dict into a single string."""
    if not address:
        return None
    parts = [
        address.get("address_line_1"),
        address.get("address_line_2"),
        address.get("locality"),
        address.get("region"),
        address.get("postal_code"),
        address.get("country"),
    ]
    return ", ".join(p for p in parts if p)


def _is_excluded_sic(sic_codes: list[str]) -> bool:
    """Return True if any SIC code matches an excluded code or prefix."""
    for code in sic_codes:
        if code in EXCLUDED_SIC_CODES:
            logger.debug("Excluding SIC code %s (excluded exact match)", code)
            return True
        for prefix in EXCLUDED_SIC_PREFIXES:
            if code.startswith(prefix):
                logger.debug("Excluding SIC code %s (matches prefix %s)", code, prefix)
                return True
    return False


def _category_for_sic(sic_codes: list[str]) -> str | None:
    """Map the first known SIC code to a human category label."""
    for code in sic_codes:
        if code in SIC_CATEGORY_MAP:
            return SIC_CATEGORY_MAP[code]
    # Fallback to the code itself so the record still has some categorisation.
    return f"sic:{sic_codes[0]}" if sic_codes else None


def _normalise_name(name: str) -> str:
    """
    Strip legal suffixes and extra whitespace to allow fuzzy name matching
    against existing Google Maps prospects.
    """
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


def qualify_company(raw: dict[str, Any]) -> dict[str, Any] | None:
    """
    Apply deterministic filters to a Companies House summary record.

    Returns a normalised prospects-schema dict, or None if the record should be
    rejected.
    """
    company_number = raw.get("company_number")
    company_name = raw.get("company_name")
    status = raw.get("company_status")

    if not company_number or not company_name:
        logger.debug("Skipping record with missing company number or name")
        return None

    if status in _NON_ACTIVE_STATUSES:
        logger.debug("Skipping %s — status is %s", company_number, status)
        return None

    sic_codes = raw.get("sic_codes") or []
    if not isinstance(sic_codes, list):
        sic_codes = [sic_codes]

    if _is_excluded_sic(sic_codes):
        logger.debug("Skipping %s — excluded SIC codes %s", company_number, sic_codes)
        return None

    address = raw.get("registered_office_address") or {}
    address_text = _format_address(address)
    postcode = _extract_postcode(address, address_text)
    city = address.get("locality") or address.get("region")

    incorporation_date = None
    date_of_creation = raw.get("date_of_creation")
    if date_of_creation:
        try:
            incorporation_date = datetime.strptime(date_of_creation, "%Y-%m-%d").date()
        except ValueError:
            logger.warning(
                "Could not parse incorporation date for %s: %s",
                company_number,
                date_of_creation,
            )

    return {
        "source": "companies_house",
        "source_company_number": company_number,
        "source_incorporation_date": incorporation_date.isoformat() if incorporation_date else None,
        "source_sic_codes": sic_codes,
        "source_url": f"https://find-and-update.company-information.service.gov.uk/company/{company_number}",
        "name": company_name,
        "normalised_name": _normalise_name(company_name),
        "category": _category_for_sic(sic_codes),
        "address": address_text,
        "city": city,
        "postcode": postcode,
        "company_status": status,
        "company_type": raw.get("company_type"),
        "date_of_creation": date_of_creation,
    }


def qualify_records(
    raw_results: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], int]:
    """
    Filter and normalise a list of Companies House company summaries.

    Returns:
        (qualified_records, rejected_count)
    """
    qualified = []
    rejected = 0

    for raw in raw_results:
        record = qualify_company(raw)
        if record:
            qualified.append(record)
        else:
            rejected += 1

    logger.info(
        "Filter result: %d qualified, %d rejected from %d raw",
        len(qualified),
        rejected,
        len(raw_results),
    )
    return qualified, rejected

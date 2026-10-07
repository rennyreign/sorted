"""
Website Analyser — Companies House viability check.

For each prospect, attempts to find the matching UK company record and
pulls the signals that answer "is this a real, trading, viable business?":

  - company status (active / dissolved / dormant)
  - incorporation date (years trading)
  - SIC codes
  - accounts type from filing history (micro / small / full / dormant)
  - date of last accounts filing + whether accounts are overdue

Where the latest filing is available as iXBRL, a conservative parser extracts
only explicit numeric facts such as net assets, current assets, employee count
and turnover when it is genuinely disclosed. Missing facts stay missing: cash,
assets or micro-entity thresholds are never presented as revenue.

Docs: https://developer-specs.company-information.service.gov.uk/
Auth: HTTP Basic, API key as username, blank password.
Rate limit: ~600 requests / 5 min — we pace conservatively.
"""

import logging
import os
import re
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from difflib import SequenceMatcher
from typing import Any

import requests

logger = logging.getLogger("website-analyser.companies_house")

CH_BASE_URL = "https://api.company-information.service.gov.uk"
CH_DOCUMENT_URL = "https://document-api.company-information.service.gov.uk"
CH_TIMEOUT = 20
REQUEST_GAP_SECONDS = 0.4

_legal_suffixes = re.compile(
    r"\b(ltd|limited|l\.l\.p|llp|plc|uk|co\.uk|company|&\s*sons?|and\s*sons?)\b",
    re.IGNORECASE,
)


def _auth() -> requests.auth.HTTPBasicAuth:
    key = os.getenv("COMPANIES_HOUSE_API_KEY")
    if not key:
        raise EnvironmentError(
            "COMPANIES_HOUSE_API_KEY is not set — check your .env file."
        )
    return requests.auth.HTTPBasicAuth(key, "")


def _get(path: str, params: dict | None = None) -> dict | None:
    """GET a CH endpoint with one retry on rate limit. None on failure."""
    url = f"{CH_BASE_URL}{path}"
    time.sleep(REQUEST_GAP_SECONDS)

    for attempt in range(2):
        try:
            resp = requests.get(url, params=params, auth=_auth(), timeout=CH_TIMEOUT)
        except requests.exceptions.RequestException as exc:
            logger.error("Companies House request failed %s: %s", path, exc)
            return None

        if resp.status_code == 429:
            if attempt == 0:
                wait = int(resp.headers.get("Retry-After", 30))
                logger.warning("CH rate limit — waiting %ds", wait)
                time.sleep(wait)
                continue
            return None
        if resp.status_code == 401:
            raise PermissionError(
                "Companies House auth failed. Check COMPANIES_HOUSE_API_KEY."
            )
        if resp.status_code == 404:
            return None
        if not resp.ok:
            logger.error("CH HTTP %d for %s: %s", resp.status_code, path, resp.text[:200])
            return None
        try:
            return resp.json()
        except ValueError:
            return None
    return None


def _normalise_name(name: str) -> str:
    n = _legal_suffixes.sub("", name.lower())
    n = re.sub(r"[^a-z0-9 ]", "", n)
    return " ".join(n.split())


def _name_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, _normalise_name(a), _normalise_name(b)).ratio()


def _find_company(name: str, postcode: str | None) -> dict | None:
    """
    Search CH by name; pick the best candidate. Returns the search item
    enriched with a match_confidence field, or None.
    """
    data = _get("/search/companies", params={"q": name, "items_per_page": 10})
    items = (data or {}).get("items") or []
    if not items:
        return None

    best, best_score = None, 0.0
    for item in items:
        sim = _name_similarity(name, item.get("title") or "")
        # Postcode in the registered-office snippet bumps confidence.
        if postcode and postcode.replace(" ", "").upper() in (
            (item.get("address_snippet") or "").replace(" ", "").upper()
        ):
            sim = min(1.0, sim + 0.15)
        if sim > best_score:
            best, best_score = item, sim

    if best is None or best_score < 0.55:
        return None

    confidence = "high" if best_score >= 0.85 else "medium" if best_score >= 0.65 else "low"
    best["match_confidence"] = confidence
    best["match_score"] = round(best_score, 2)
    return best


_honorifics = re.compile(r"^(mr|mrs|ms|miss|dr|sir|dame|lord|lady)\.?\s+", re.IGNORECASE)


def _person_name(raw: str) -> str:
    """
    CH officer names arrive as 'SURNAME, Forename Middle' (usually caps),
    sometimes with an honorific. Normalise to 'Forename Surname' title
    case for display + enrichment. Corporate officers (no comma, all
    caps) are title-cased as-is.
    """
    raw = _honorifics.sub("", raw.strip())
    if "," in raw:
        surname, _, forename = raw.partition(",")
        parts = forename.split() + [surname]
        return " ".join(parts).title()
    return raw.title() if raw.isupper() else raw


def _fetch_people(company_number: str) -> list[dict]:
    """
    Fetch active officers + persons with significant control.

    Returns a list of {"name", "role"} dicts — resigned officers and
    ceased PSCs are excluded. Directors come first, then other officer
    roles, then PSCs not already listed.
    """
    people: list[dict] = []

    officers = _get(
        f"/company/{company_number}/officers",
        params={"items_per_page": 35},
    ) or {}
    for o in officers.get("items") or []:
        if o.get("resigned_on"):
            continue
        name = _person_name(o.get("name") or "")
        if name:
            people.append({
                "name": name,
                "role": (o.get("officer_role") or "officer").replace("-", " "),
            })

    pscs = _get(
        f"/company/{company_number}/persons-with-significant-control",
        params={"items_per_page": 10},
    ) or {}
    for p in pscs.get("items") or []:
        if p.get("ceased_on"):
            continue
        name = _person_name(p.get("name") or "")
        if name and not any(name.lower() == x["name"].lower() for x in people):
            people.append({"name": name, "role": "person with significant control"})

    return people


def _latest_accounts(filing_history: dict | None) -> tuple[str | None, str | None, dict | None]:
    """Extract filing date, accounts type and item for the latest accounts."""
    items = (filing_history or {}).get("items") or []
    for item in items:
        if item.get("category") == "accounts":
            desc = (item.get("description") or "").lower()
            acc_type = item.get("type") or ""
            if "micro" in desc or acc_type.startswith("AA0") or "micro" in acc_type:
                kind = "micro"
            elif "dormant" in desc:
                kind = "dormant"
            elif "small" in desc:
                kind = "small"
            elif "abridged" in desc:
                kind = "abridged"
            elif "full" in desc or "group" in desc:
                kind = "full"
            else:
                kind = acc_type or "accounts"
            return item.get("date"), kind, item
    return None, None, None


def _absolute_document_url(value: str | None) -> str | None:
    if not value:
        return None
    if value.startswith("http://") or value.startswith("https://"):
        return value
    return f"{CH_DOCUMENT_URL}{value}"


def _document_json(url: str) -> dict | None:
    time.sleep(REQUEST_GAP_SECONDS)
    try:
        response = requests.get(url, auth=_auth(), timeout=CH_TIMEOUT)
    except requests.exceptions.RequestException as exc:
        logger.warning("Companies House document metadata failed: %s", exc)
        return None
    if not response.ok:
        logger.warning("Companies House document metadata HTTP %d", response.status_code)
        return None
    try:
        return response.json()
    except ValueError:
        return None


def _document_content(metadata_url: str, content_type: str) -> bytes | None:
    time.sleep(REQUEST_GAP_SECONDS)
    try:
        response = requests.get(
            f"{metadata_url}/content",
            headers={"Accept": content_type},
            auth=_auth(),
            timeout=CH_TIMEOUT,
        )
    except requests.exceptions.RequestException as exc:
        logger.warning("Companies House document download failed: %s", exc)
        return None
    if not response.ok:
        logger.warning("Companies House document download HTTP %d", response.status_code)
        return None
    return response.content


_FACT_ALIASES = {
    "turnover": {"Turnover", "TurnoverRevenue", "Revenue"},
    "net_assets": {"NetAssetsLiabilities"},
    "cash": {"CashBankOnHand", "CashAndCashEquivalents"},
    "current_assets": {"CurrentAssets"},
    "liabilities": {"Liabilities", "TotalLiabilities"},
    "employees": {"AverageNumberEmployeesDuringPeriod"},
    "equity": {"Equity"},
    "net_current_assets": {"NetCurrentAssetsLiabilities"},
}


def _fact_number(raw: str, scale: str | None, sign: str | None) -> int | float | None:
    value = raw.strip().replace(",", "").replace("£", "")
    if not value or value in {"-", "—"}:
        return None
    negative = value.startswith("(") and value.endswith(")")
    if negative:
        value = value[1:-1]
    try:
        number = float(value)
        number *= 10 ** int(scale or "0")
        if negative or sign == "-":
            number = -number
        return int(number) if number.is_integer() else number
    except (ValueError, OverflowError):
        return None


def _context_dates(root: ET.Element) -> dict[str, str]:
    dates: dict[str, str] = {}
    for element in root.iter():
        if not element.tag.endswith("context"):
            continue
        context_id = element.attrib.get("id")
        values = [
            (child.text or "").strip()
            for child in element.iter()
            if child.tag.endswith("instant") or child.tag.endswith("endDate")
        ]
        if context_id and values:
            dates[context_id] = max(values)
    return dates


def _extract_ixbrl(content: bytes, period_end: str | None) -> dict[str, Any] | None:
    """Extract a conservative set of explicit numeric facts from iXBRL."""
    try:
        root = ET.fromstring(content)
    except ET.ParseError as exc:
        logger.warning("Companies House iXBRL parse failed: %s", exc)
        return None

    contexts = _context_dates(root)
    candidates: dict[str, list[dict[str, Any]]] = {key: [] for key in _FACT_ALIASES}
    for element in root.iter():
        if not element.tag.endswith("nonFraction"):
            continue
        qualified_name = element.attrib.get("name") or ""
        local_name = qualified_name.split(":")[-1]
        fact_key = next((key for key, aliases in _FACT_ALIASES.items() if local_name in aliases), None)
        if fact_key is None:
            continue
        number = _fact_number("".join(element.itertext()), element.attrib.get("scale"), element.attrib.get("sign"))
        if number is None:
            continue
        context_ref = element.attrib.get("contextRef") or ""
        candidates[fact_key].append({
            "value": number,
            "period_end": contexts.get(context_ref),
            "unit": element.attrib.get("unitRef"),
            "source_tag": qualified_name,
        })

    facts: dict[str, Any] = {}
    for key, rows in candidates.items():
        if not rows:
            continue
        rows.sort(key=lambda row: row.get("period_end") or "", reverse=True)
        current = next((row for row in rows if not period_end or row.get("period_end") == period_end), rows[0])
        previous = next((row for row in rows if row.get("period_end") and row.get("period_end") != current.get("period_end")), None)
        facts[key] = {
            "current": current["value"],
            "previous": previous["value"] if previous else None,
            "period_end": current.get("period_end"),
            "unit": current.get("unit"),
            "source_tag": current.get("source_tag"),
        }
    return facts or None


def _filing_facts(item: dict | None, period_end: str | None) -> tuple[str | None, dict | None]:
    metadata_url = _absolute_document_url(((item or {}).get("links") or {}).get("document_metadata"))
    if not metadata_url:
        return None, None
    metadata = _document_json(metadata_url) or {}
    resources = metadata.get("resources") or {}
    if "application/xhtml+xml" not in resources:
        return metadata_url, None
    content = _document_content(metadata_url, "application/xhtml+xml")
    return metadata_url, _extract_ixbrl(content, period_end) if content else None


def check(
    name: str,
    postcode: str | None = None,
    company_number: str | None = None,
) -> dict[str, Any]:
    """
    Run the Companies House viability check for one prospect.

    If company_number is already known (e.g. prospect originated from
    new-business-finder's CH scrape), verification skips name matching
    and goes straight to the profile + filing history.

    Always returns a dict (never raises except auth). Fields map onto the
    prospects columns added in the prospect_viability migration.
    """
    result: dict[str, Any] = {
        "ch_match_confidence": None,
        "ch_status": None,
        "ch_incorporated_date": None,
        "ch_accounts_type": None,
        "ch_accounts_last_date": None,
        "ch_accounts_period_end": None,
        "ch_accounts_due_date": None,
        "ch_accounts_overdue": None,
        "ch_confirmation_due_date": None,
        "ch_confirmation_overdue": None,
        "ch_filing_url": None,
        "ch_filing_document_url": None,
        "ch_turnover": None,
        "ch_net_assets": None,
        "ch_cash": None,
        "ch_current_assets": None,
        "ch_liabilities": None,
        "ch_employees": None,
        "ch_financial_facts": None,
        "ch_data_updated_at": None,
        "source_company_number": None,
        "source_url": None,
        "ch_verified": False,
        "owner_name": None,
        "owner_role": None,
        "owner_source": None,
        "associated_names": None,
    }

    if company_number:
        result["ch_match_confidence"] = "high"  # pre-matched upstream
        match_title = name
    else:
        match = _find_company(name, postcode)
        if not match:
            logger.info("CH: no match found for '%s'", name)
            return result
        company_number = match.get("company_number")
        match_title = match.get("title") or name
        result["ch_match_confidence"] = match.get("match_confidence")
    result["source_company_number"] = company_number
    result["source_url"] = (
        f"https://find-and-update.company-information.service.gov.uk/company/{company_number}"
    )

    profile = _get(f"/company/{company_number}") or {}
    result["ch_status"] = profile.get("company_status")
    result["ch_incorporated_date"] = profile.get("date_of_creation")
    result["source_incorporation_date"] = profile.get("date_of_creation")
    result["source_sic_codes"] = profile.get("sic_codes")
    accounts = profile.get("accounts") or {}
    last_accounts = accounts.get("last_accounts") or {}
    next_accounts = accounts.get("next_accounts") or {}
    confirmation = profile.get("confirmation_statement") or {}
    result["ch_accounts_period_end"] = last_accounts.get("period_end_on") or last_accounts.get("made_up_to")
    result["ch_accounts_due_date"] = next_accounts.get("due_on") or accounts.get("next_due")
    result["ch_accounts_overdue"] = next_accounts.get("overdue", accounts.get("overdue"))
    result["ch_confirmation_due_date"] = confirmation.get("next_due")
    result["ch_confirmation_overdue"] = confirmation.get("overdue")

    filings = _get(
        f"/company/{company_number}/filing-history",
        params={"category": "accounts", "items_per_page": 5},
    )
    last_date, acc_type, filing_item = _latest_accounts(filings)
    result["ch_accounts_last_date"] = last_date
    result["ch_accounts_type"] = last_accounts.get("type") or acc_type
    filing_self = ((filing_item or {}).get("links") or {}).get("self")
    if filing_self:
        result["ch_filing_url"] = f"https://find-and-update.company-information.service.gov.uk{filing_self}"
    metadata_url, facts = _filing_facts(filing_item, result["ch_accounts_period_end"])
    result["ch_filing_document_url"] = metadata_url
    result["ch_financial_facts"] = facts
    if facts:
        result["ch_turnover"] = (facts.get("turnover") or {}).get("current")
        result["ch_net_assets"] = (facts.get("net_assets") or {}).get("current")
        result["ch_cash"] = (facts.get("cash") or {}).get("current")
        result["ch_current_assets"] = (facts.get("current_assets") or {}).get("current")
        result["ch_liabilities"] = (facts.get("liabilities") or {}).get("current")
        employees = (facts.get("employees") or {}).get("current")
        result["ch_employees"] = round(employees) if isinstance(employees, (int, float)) else None
    result["ch_data_updated_at"] = datetime.now(timezone.utc).isoformat()

    # Officers + PSCs — the people behind the business. Best-guess owner is
    # the first active director; everyone else lands in associated_names.
    people = _fetch_people(company_number)
    owner = next(
        (p for p in people if "director" in p["role"] or "member" in p["role"]),
        people[0] if people else None,
    )
    if owner:
        result["owner_name"] = owner["name"]
        result["owner_role"] = owner["role"]
        result["owner_source"] = "companies_house"
    associated = [p for p in people if p is not owner]
    if associated:
        result["associated_names"] = associated

    # Verified = confident name match on an active company that has traded
    # long enough to have filed something (or is young but active).
    active = result["ch_status"] == "active"
    confident = result["ch_match_confidence"] in ("high", "medium")
    result["ch_verified"] = bool(active and confident)

    logger.info(
        "CH: %s → %s (%s, confidence=%s, status=%s, accounts=%s %s)",
        name, company_number, match_title,
        result["ch_match_confidence"], result["ch_status"],
        acc_type or "?", last_date or "no filings",
    )
    return result

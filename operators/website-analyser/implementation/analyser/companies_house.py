"""
Website Analyser — Companies House viability check.

For each prospect, attempts to find the matching UK company record and
pulls the signals that answer "is this a real, trading, viable business?":

  - company status (active / dissolved / dormant)
  - incorporation date (years trading)
  - SIC codes
  - accounts type from filing history (micro / small / full / dormant)
  - date of last accounts filing + whether accounts are overdue

Deliberately NOT automated: reading turnover figures out of filed accounts.
Most target businesses file micro-entity accounts that don't disclose
turnover, and parsing iXBRL/PDFs is fragile. The dashboard links straight
to the CH filing page so a human can eyeball revenue on shortlisted leads.

Docs: https://developer-specs.company-information.service.gov.uk/
Auth: HTTP Basic, API key as username, blank password.
Rate limit: ~600 requests / 5 min — we pace conservatively.
"""

import logging
import os
import re
import time
from difflib import SequenceMatcher
from typing import Any

import requests

logger = logging.getLogger("website-analyser.companies_house")

CH_BASE_URL = "https://api.company-information.service.gov.uk"
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


def _last_accounts(filing_history: dict | None) -> tuple[str | None, str | None]:
    """Extract (date, accounts_type) of the most recent accounts filing."""
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
            return item.get("date"), kind
    return None, None


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

    filings = _get(
        f"/company/{company_number}/filing-history",
        params={"category": "accounts", "items_per_page": 5},
    )
    last_date, acc_type = _last_accounts(filings)
    result["ch_accounts_last_date"] = last_date
    result["ch_accounts_type"] = acc_type

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

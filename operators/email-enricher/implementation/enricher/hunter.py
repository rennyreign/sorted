"""
Email Enricher — Hunter.io client.

Uses the Hunter.io Email Finder API to find a person's email address
given their first name, last name, and company domain.

API docs: https://hunter.io/api-documentation/email-finder
"""

import logging
import os
import time
from urllib.parse import urlparse

import requests

logger = logging.getLogger("email-enricher.hunter")

API_BASE = "https://api.hunter.io/v2"
REQUEST_TIMEOUT = 30

# Rate limit: be polite to the free plan. 2s between calls is safe.
RATE_LIMIT_DELAY = 2.0


def _get_api_key() -> str:
    key = os.getenv("HUNTER_API_KEY")
    if not key:
        raise EnvironmentError("HUNTER_API_KEY is not set — check your .env file.")
    return key


def extract_domain(website_url: str) -> str | None:
    """Extract the root domain from a website URL."""
    if not website_url:
        return None
    parsed = urlparse(website_url)
    host = parsed.netloc or parsed.path
    # Remove "www." prefix (lstrip strips chars, not prefixes — use replace)
    if host.startswith("www."):
        host = host[4:]
    # Strip port, keep domain
    host = host.split(":")[0]
    # Reject social media / third-party platforms — hunter.io can't find
    # business emails on domains the business doesn't own.
    REJECT_DOMAINS = (
        "instagram.com", "facebook.com", "fb.com", "wa.me",
        "booking.com", "linktr.ee", "calendly.com",
        "just-eat.co.uk", "tryotter.com", "deliveroo.co.uk",
        "ubereats.com", "yelp.com", "tripadvisor.com",
        "uel.ac.uk", "warwick.ac.uk", "bhmm.org.uk",
        "sitelift.site", "newmapiuk.top",
    )
    for reject in REJECT_DOMAINS:
        if reject in host:
            return None
    return host if "." in host else None


def split_name(full_name: str) -> tuple[str, str]:
    """
    Split a full name into first name and last name.
    Handles 'First Last', 'First Middle Last', 'First Last Last' patterns.
    """
    parts = full_name.strip().split()
    if len(parts) == 1:
        return parts[0], ""
    if len(parts) == 2:
        return parts[0], parts[1]
    # 3+ parts: first name = first, last name = last 2 joined
    return parts[0], " ".join(parts[-2:])


def find_email(
    first_name: str,
    last_name: str,
    domain: str,
) -> dict | None:
    """
    Call Hunter.io Email Finder API.

    Returns a dict with:
        email: str | None
        score: int (confidence 0-100)
        position: str | None
        sources: list
    Or None on error.
    """
    api_key = _get_api_key()
    url = f"{API_BASE}/email-finder"
    params = {
        "api_key": api_key,
        "domain": domain,
        "first_name": first_name,
        "last_name": last_name,
    }

    try:
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
    except requests.exceptions.RequestException as exc:
        logger.error("Hunter.io request failed for %s %s @ %s: %s", first_name, last_name, domain, exc)
        return None

    if response.status_code == 401:
        raise PermissionError("Hunter.io authentication failed. Check HUNTER_API_KEY.")
    if response.status_code == 429:
        logger.error("Hunter.io usage limit reached. Reset date: check account.")
        return None
    if response.status_code == 451:
        logger.info("Hunter.io cannot process %s %s @ %s (legal reasons)", first_name, last_name, domain)
        return None
    if not response.ok:
        logger.error("Hunter.io returned HTTP %d: %s", response.status_code, response.text[:200])
        return None

    try:
        data = response.json().get("data", {})
    except ValueError:
        logger.error("Hunter.io returned non-JSON response for %s @ %s", first_name, domain)
        return None

    result = {
        "email": data.get("email"),
        "score": data.get("score"),
        "position": data.get("position"),
        "sources": data.get("sources", []),
    }

    if result["email"]:
        logger.info(
            "Hunter.io found email for %s %s @ %s: %s (score: %s)",
            first_name, last_name, domain, result["email"], result["score"],
        )
    else:
        logger.info("Hunter.io found no email for %s %s @ %s", first_name, last_name, domain)

    return result


def domain_search(domain: str) -> list[dict]:
    """
    Call Hunter.io Domain Search API.
    Returns all publicly known emails for a domain.
    Uses 'searches' quota, not credits.
    """
    api_key = _get_api_key()
    url = f"{API_BASE}/domain-search"
    params = {
        "api_key": api_key,
        "domain": domain,
        "limit": 10,  # free plan max
    }

    try:
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
    except requests.exceptions.RequestException as exc:
        logger.error("Hunter.io domain search failed for %s: %s", domain, exc)
        return []

    if response.status_code == 429:
        logger.warning("Hunter.io search limit reached.")
        return []
    if not response.ok:
        logger.debug("Hunter.io domain search HTTP %d for %s", response.status_code, domain)
        return []

    try:
        data = response.json().get("data", {})
    except ValueError:
        return []

    emails = data.get("emails", [])
    logger.info("Domain search for %s: found %d public emails", domain, len(emails))
    return emails


def rate_limit():
    """Sleep to respect rate limits."""
    time.sleep(RATE_LIMIT_DELAY)

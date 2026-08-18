"""
New Business Finder — Companies House API client.

Wraps the public Companies House REST API advanced search endpoint.
Authentication uses HTTP Basic Auth with the API key as the username and a
blank password.

Docs: https://developer-specs.company-information.service.gov.uk/
"""

import logging
import os
import time
from datetime import date
from typing import Any

import requests

from config import CH_BASE_URL, CH_RATE_LIMIT_PER_5MIN, CH_TIMEOUT_SECONDS

logger = logging.getLogger("new-business-finder.companies_house")


def _get_api_key() -> str:
    key = os.getenv("COMPANIES_HOUSE_API_KEY")
    if not key:
        raise EnvironmentError(
            "COMPANIES_HOUSE_API_KEY is not set — check your .env file."
        )
    return key


def _ch_auth() -> requests.auth.HTTPBasicAuth:
    return requests.auth.HTTPBasicAuth(_get_api_key(), "")


def search_recent_companies(
    incorporated_from: date,
    incorporated_to: date,
    sic_codes: list[str],
    location: str | None = None,
    max_results: int = 100,
) -> list[dict[str, Any]]:
    """
    Search Companies House advanced endpoint for active companies incorporated
    in the given date range and SIC codes.

    Returns a flat list of company summary dicts (the API `items` field).
    Paginates until `max_results` is reached.
    """
    url = f"{CH_BASE_URL}/advanced-search/companies"
    page_size = min(100, max_results)

    params: dict[str, Any] = {
        "company_status": "active",
        "incorporated_from": incorporated_from.isoformat(),
        "incorporated_to": incorporated_to.isoformat(),
        "sic_codes": ",".join(sic_codes),
        "size": page_size,
        "start_index": 0,
    }
    if location:
        params["location"] = location

    results: list[dict[str, Any]] = []
    retries = 0

    while len(results) < max_results:
        logger.debug(
            "Companies House request: start_index=%d", params["start_index"]
        )
        try:
            response = requests.get(
                url,
                params=params,
                auth=_ch_auth(),
                timeout=CH_TIMEOUT_SECONDS,
            )
        except requests.exceptions.RequestException as exc:
            logger.error("Companies House request failed: %s", exc)
            break

        if response.status_code == 429:
            # Rate limit — one retry after a short back-off.
            if retries == 0:
                sleep_seconds = int(response.headers.get("Retry-After", 60))
                logger.warning(
                    "Companies House rate limit hit. Waiting %ds...", sleep_seconds
                )
                time.sleep(sleep_seconds)
                retries += 1
                continue
            logger.error("Companies House rate limit persists. Stopping.")
            break

        if response.status_code == 401:
            raise PermissionError(
                "Companies House authentication failed. Check COMPANIES_HOUSE_API_KEY."
            )

        if response.status_code == 404:
            # No companies found is returned as 404 by the API.
            logger.info("Companies House returned 404 — no results for this page.")
            break

        if not response.ok:
            logger.error(
                "Companies House returned HTTP %d: %s",
                response.status_code,
                response.text[:300],
            )
            break

        try:
            data = response.json()
        except ValueError as exc:
            logger.error("Companies House returned non-JSON response: %s", exc)
            break

        items = data.get("items") or []
        if not isinstance(items, list):
            logger.warning(
                "Unexpected Companies House response type for items: %s",
                type(items).__name__,
            )
            break

        if not items:
            break

        results.extend(items)

        # The API caps `size` at 100. Move to next page.
        if len(items) < page_size:
            break

        params["start_index"] += page_size
        retries = 0

        # Conservative pacing: 600 requests / 5 min ≈ 0.5s between requests.
        time.sleep(0.5)

    if len(results) > max_results:
        results = results[:max_results]

    logger.info(
        "Companies House returned %d raw results for %s..%s (location=%s)",
        len(results),
        incorporated_from.isoformat(),
        incorporated_to.isoformat(),
        location or "any",
    )
    return results

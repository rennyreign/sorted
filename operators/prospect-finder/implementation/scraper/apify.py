"""
Prospect Finder — Apify Google Maps Scraper client.

Calls the Apify `compass/crawler-google-places` actor synchronously
and returns a list of raw business records.

Apify docs: https://apify.com/compass/crawler-google-places
"""

import logging
import os
import time

import requests

logger = logging.getLogger("prospect-finder.apify")

ACTOR_ID = "compass~crawler-google-places"
APIFY_BASE_URL = "https://api.apify.com/v2"

# Synchronous run timeout — Apify will run the actor and stream results back.
# For 40 results this typically completes in 30–90 seconds.
REQUEST_TIMEOUT_SECONDS = 300


def _build_actor_input(
    search_queries: list[str],
    location: str,
    max_results: int,
) -> dict:
    """Build the input payload for the Apify Google Maps actor."""
    return {
        "searchStringsArray": search_queries,
        "locationQuery": location,
        "maxCrawledPlacesPerSearch": max_results,
        "language": "en",
        "maxImages": 0,           # no images — keep output lean
        "exportPlaceUrls": True,
        "additionalInfo": False,   # skip opening hours etc — not needed
        "scrapeDirectories": False,
        "deeperCityScrape": False,
    }


def search_google_maps(
    category: str,
    location: str,
    max_results: int = 40,
) -> list[dict]:
    """
    Run the Apify Google Maps Scraper for a single category + location.

    Returns a list of raw business dicts as returned by Apify.
    Returns an empty list on any error (logs the reason).
    """
    api_token = os.getenv("APIFY_API_TOKEN")
    if not api_token:
        raise EnvironmentError("APIFY_API_TOKEN is not set — check your .env file.")

    actor_input = _build_actor_input(
        search_queries=[category],
        location=location,
        max_results=max_results,
    )

    url = f"{APIFY_BASE_URL}/acts/{ACTOR_ID}/run-sync-get-dataset-items"
    params = {"token": api_token}

    logger.info("Apify query: '%s' in '%s' (max %d results)", category, location, max_results)

    try:
        response = requests.post(
            url,
            json=actor_input,
            params=params,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.exceptions.Timeout:
        logger.error(
            "Apify request timed out after %ds for '%s' in '%s'",
            REQUEST_TIMEOUT_SECONDS, category, location,
        )
        return []
    except requests.exceptions.ConnectionError as exc:
        logger.error("Apify connection error for '%s' in '%s': %s", category, location, exc)
        return []

    if response.status_code == 429:
        retry_after = int(response.headers.get("Retry-After", 60))
        logger.warning(
            "Apify rate limit hit. Waiting %ds before retrying '%s' in '%s'...",
            retry_after, category, location,
        )
        time.sleep(retry_after)
        # Single retry
        try:
            response = requests.post(
                url,
                json=actor_input,
                params=params,
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
        except requests.exceptions.RequestException as exc:
            logger.error("Apify retry failed for '%s' in '%s': %s", category, location, exc)
            return []

    if response.status_code == 401:
        raise PermissionError(
            "Apify authentication failed. Check APIFY_API_TOKEN in your .env file."
        )

    if not response.ok:
        logger.error(
            "Apify returned HTTP %d for '%s' in '%s': %s",
            response.status_code, category, location, response.text[:200],
        )
        return []

    try:
        results = response.json()
    except ValueError as exc:
        logger.error(
            "Apify returned non-JSON response for '%s' in '%s': %s",
            category, location, exc,
        )
        return []

    if not isinstance(results, list):
        logger.warning(
            "Apify returned unexpected type (%s) for '%s' in '%s' — expected list.",
            type(results).__name__, category, location,
        )
        return []

    logger.info(
        "Apify returned %d raw results for '%s' in '%s'",
        len(results), category, location,
    )
    return results

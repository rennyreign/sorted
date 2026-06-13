"""
Prospect Finder — record qualification filters.

Takes raw Apify Google Maps results and returns only records
that pass qualification: must have a place_id, and must have
at least a website OR an email address.
"""

import logging

logger = logging.getLogger("prospect-finder.filters")


def _extract_email(raw: dict) -> str | None:
    """
    Apify may return email in different fields depending on actor version.
    Check all known locations.
    """
    # Direct field
    email = raw.get("email") or raw.get("emails")
    if isinstance(email, list):
        email = email[0] if email else None
    if email:
        return email.strip().lower()

    # Sometimes nested inside contactInfo
    contact = raw.get("contactInfo") or {}
    email = contact.get("email")
    if email:
        return email.strip().lower()

    return None


# Google Maps generates fallback URLs when a business has no real website.
# These are not actual business websites — treat them as no website.
_GOOGLE_MAPS_FALLBACK_DOMAINS = (
    "google.com/maps",
    "maps.google",
    "goo.gl/maps",
)


def _is_real_website(url: str) -> bool:
    """Return False if the URL is a Google Maps placeholder, not a real business website."""
    url_lower = url.lower()
    return not any(domain in url_lower for domain in _GOOGLE_MAPS_FALLBACK_DOMAINS)


def _extract_website(raw: dict) -> str | None:
    """
    Extract website URL from raw Apify record.
    Returns None if the URL is a Google Maps fallback (not a real business site).
    """
    website = raw.get("website")
    if website and _is_real_website(website):
        return website.strip()
    return None


def _extract_postcode(address: str | None) -> str | None:
    """Attempt to pull a UK postcode out of an address string."""
    if not address:
        return None
    import re
    # Standard UK postcode pattern
    match = re.search(
        r"\b([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})\b",
        address.upper(),
    )
    return match.group(1).upper() if match else None


def qualify_records(
    raw_results: list[dict],
    category: str,
    location: str,
    run_id: str,
) -> tuple[list[dict], int]:
    """
    Filter and map raw Apify results to the prospects schema.

    Returns:
        (qualified_records, skipped_count)

    A record qualifies if:
    - place_id is present
    - website OR email is present
    """
    qualified = []
    skipped = 0

    for raw in raw_results:
        place_id = raw.get("placeId") or raw.get("place_id")
        if not place_id:
            logger.debug("Skipping record with no place_id: %s", raw.get("title", "unknown"))
            skipped += 1
            continue

        website = _extract_website(raw)
        email = _extract_email(raw)

        if not website and not email:
            logger.debug(
                "Skipping '%s' — no website or email found.",
                raw.get("title", place_id),
            )
            skipped += 1
            continue

        address = raw.get("address") or raw.get("addressParts", {}).get("formattedAddress")
        postcode = _extract_postcode(address)

        # City: try address parts first, fall back to location query
        city = None
        address_parts = raw.get("addressParts") or {}
        city = address_parts.get("city") or address_parts.get("locality") or location

        # Coordinates
        lat = lon = None
        location_data = raw.get("location") or {}
        if isinstance(location_data, dict):
            lat = location_data.get("lat")
            lon = location_data.get("lng")

        record = {
            "place_id":        place_id,
            "name":            raw.get("title") or raw.get("name") or "Unknown",
            "category":        raw.get("categoryName") or raw.get("category") or category,
            "address":         address,
            "city":            city,
            "postcode":        postcode,
            "phone":           raw.get("phone") or raw.get("phoneUnformatted"),
            "website":         website,
            "email":           email,
            "website_exists":  website is not None,
            "email_exists":    email is not None,
            "qualified":       website is not None and email is not None,
            "rating":          raw.get("totalScore") or raw.get("rating"),
            "review_count":    raw.get("reviewsCount") or raw.get("reviewCount") or raw.get("userRatingsTotal"),
            "google_maps_url": raw.get("url") or raw.get("placeUrl") or raw.get("google_maps_url"),
            "latitude":        lat,
            "longitude":       lon,
            "search_query":    category,
            "search_location": location,
            "run_id":          run_id,
            "status":          "prospect",
        }

        qualified.append(record)

    logger.info(
        "Filter result for '%s' in '%s': %d qualified, %d skipped",
        category, location, len(qualified), skipped,
    )
    return qualified, skipped

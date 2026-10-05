"""
Prospect Finder — record qualification filters.

Takes raw Apify Google Maps results and returns only records
that pass qualification: must have a place_id, and must have
at least a website OR an email address.
"""

import logging

from config import CATEGORIES

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


# ---------------------------------------------------------------------------
# Intake signals — cheap Google-Maps-only sorting hint.
# NOT site_score / opportunity_score / qualified_lead — never a website verdict.
# ---------------------------------------------------------------------------

# Fields a duplicate listing may fill when the first listing left them empty.
# Provenance fields (run_id/search_query/search_location/category) and
# first nonempty intake_category are never taken from a later duplicate.
_MERGE_EMPTY_FIELDS = (
    "email", "phone", "website", "address",
    "google_maps_url", "latitude", "longitude", "postcode", "city",
)


def _is_empty(value) -> bool:
    return value is None or (isinstance(value, str) and not value.strip())


def controlled_intake_category(category: str | None) -> str:
    """
    Controlled intake category from the configured search query —
    NOT inferred from an arbitrary Maps label. Ad-hoc queries outside
    config.CATEGORIES map to 'other'.
    """
    norm = (category or "").strip().lower()
    return norm if norm in CATEGORIES else "other"


def _nonnegative_number(value) -> float | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    if value < 0:
        return None
    return float(value)


def _rating_review_points(rating, review_count) -> int:
    # A supplied but negative/non-numeric rating or review_count → 0.
    # The 1-point tier requires rating genuinely MISSING (None), not invalid.
    if rating is not None and _nonnegative_number(rating) is None:
        return 0
    r = _nonnegative_number(rating)
    c = _nonnegative_number(review_count)
    if c is None:
        return 0
    if r is not None:
        if r >= 4.5 and c >= 100:
            return 4
        if r >= 4.0 and c >= 20:
            return 3
        if r >= 4.0 and c >= 5:
            return 2
        return 0
    if c >= 20:
        return 1
    return 0


def compute_intake(
    category: str | None,
    rating,
    review_count,
    email,
    phone,
    website,
) -> dict:
    """
    Compute intake_category / intake_priority / intake_signals exactly per spec.
    website must already be placeholder-free (Maps fallback URLs excluded).
    """
    intake_category = controlled_intake_category(category)
    signals = {
        "version": 1,
        "rating_reviews_points": _rating_review_points(rating, review_count),
        "category_points": 3 if intake_category in CATEGORIES else 0,
        "contact_points": 2 if (not _is_empty(email) or not _is_empty(phone)) else 0,
        "website_points": 1 if not _is_empty(website) else 0,
        "basis": "google_maps_only",
    }
    return {
        "intake_category": intake_category,
        "intake_priority": (
            signals["rating_reviews_points"]
            + signals["category_points"]
            + signals["contact_points"]
            + signals["website_points"]
        ),
        "intake_signals": signals,
    }


def merge_records(base: dict, other: dict) -> dict:
    """
    Merge a duplicate place_id listing into the first-seen record.
    Fills empty contact/website/address fields, takes rating/review_count as a
    pair from the listing with the greatest review_count, preserves the first
    record's provenance and first nonempty intake_category, then recomputes
    flags and the intake score.
    """
    for field in _MERGE_EMPTY_FIELDS:
        if _is_empty(base.get(field)) and not _is_empty(other.get(field)):
            base[field] = other[field]

    base_rc = _nonnegative_number(base.get("review_count")) or 0
    other_rc = _nonnegative_number(other.get("review_count")) or 0
    if other_rc > base_rc:
        base["rating"] = other.get("rating")
        base["review_count"] = other.get("review_count")

    first_intake_category = base.get("intake_category")
    base["website_exists"] = not _is_empty(base.get("website"))
    base["email_exists"] = not _is_empty(base.get("email"))
    base["qualified"] = base["website_exists"] and base["email_exists"]
    base.update(
        compute_intake(
            base.get("search_query") or base.get("category"),
            base.get("rating"),
            base.get("review_count"),
            base.get("email"),
            base.get("phone"),
            base.get("website"),
        )
    )
    if not _is_empty(first_intake_category):
        base["intake_category"] = first_intake_category
    return base


def dedup_records(records: list[dict]) -> list[dict]:
    """
    Drop exact repeated place_id within/across query batches, merging
    complementary fields. Different place_ids are always kept — same
    normalized name+postcode may be a branch/concession, not a duplicate.
    """
    merged: dict[str, dict] = {}
    order: list[str] = []
    for record in records:
        pid = record.get("place_id")
        if pid in merged:
            merged[pid] = merge_records(merged[pid], record)
        else:
            merged[pid] = record
            order.append(pid)
    return [merged[pid] for pid in order]


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
        # Intake evidence derives from the controlled search category,
        # never the raw Maps category label.
        record.update(
            compute_intake(
                category=category,
                rating=record["rating"],
                review_count=record["review_count"],
                email=email,
                phone=record["phone"],
                website=website,
            )
        )

        qualified.append(record)

    deduped = dedup_records(qualified)

    logger.info(
        "Filter result for '%s' in '%s': %d qualified (%d after in-batch dedup), %d skipped",
        category, location, len(qualified), len(deduped), skipped,
    )
    return deduped, skipped

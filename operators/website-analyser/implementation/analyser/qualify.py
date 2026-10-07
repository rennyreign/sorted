"""
Website Analyser — Scoring and qualification gate.

This module is the SINGLE source of truth for all score arithmetic.
The vision model proposes dimensions and business signals; every derived
number is computed here so the model can never arithmetically contradict
the doctrine.

Formula (doctrine/scoring-for-modernization.md):
  opportunity_score  = dimensions normalised to 0-10  (high = bad site = good prospect)
  site_score         = 10 - opportunity_score          (site quality, shown to prospect)
  prospect_score     = opportunity x 0.6 + business x 0.4
  payback_jobs       = ceil(3000 / service_price_point)

qualified_lead = poor website AND viable business AND reasonable payback.
"""

import logging
import math
import os
from typing import Any

logger = logging.getLogger("website-analyser.qualify")

WEBSITE_PRICE_GBP = 3000

# Gate thresholds — override via env if needed
MIN_OPPORTUNITY = float(os.getenv("QUALIFY_MIN_OPPORTUNITY", "7"))
MAX_PAYBACK_JOBS = int(os.getenv("QUALIFY_MAX_PAYBACK_JOBS", "25"))
MAPS_FALLBACK_MIN_RATING = float(os.getenv("QUALIFY_MAPS_MIN_RATING", "4.0"))
MAPS_FALLBACK_MIN_REVIEWS = int(os.getenv("QUALIFY_MAPS_MIN_REVIEWS", "20"))

_DIMENSIONS = (
    "visual_modernity",
    "mobile_experience",
    "desire_creation",
    "content_structure",
    "trust_and_credibility",
)

# Fallback GBP price points by category — used only when the model returned
# none (e.g. site-down records where no site content was analysable).
# Conservative midpoints for a single typical job/booking.
_CATEGORY_PRICE_FALLBACK = {
    "builder": 40000, "general contractor": 40000, "extension": 40000,
    "loft conversion": 35000, "kitchen": 8000, "bathroom": 6000,
    "roofer": 5000, "roofing": 5000, "window": 4000, "door": 4000,
    "landscap": 3000, "driveway": 4000, "electric": 2000, "plumb": 2000,
    "heating": 3000, "gas": 2000, "painter": 1500, "decorat": 1500,
    "estate agent": 1500, "real estate": 1500, "cleaning": 300,
    "removal": 800, "gym": 40, "fitness": 40, "yoga": 25, "pilates": 25,
    "salon": 60, "barber": 30, "beauty": 60, "nail": 40, "spa": 80,
    "restaurant": 30, "cafe": 15, "cater": 2000, "accountant": 1200,
    "solicitor": 1500, "dental": 200, "physio": 60, "chiro": 50,
    "vet": 100, "garage": 300, "mechanic": 300, "motor": 300,
}


def _category_price_fallback(category: str | None) -> float | None:
    if not category:
        return None
    c = category.lower()
    for key, price in _CATEGORY_PRICE_FALLBACK.items():
        if key in c:
            return float(price)
    return None


def compute_opportunity_score(analysis: dict) -> int | None:
    """
    Dimensions (5 x 0-2) measure site QUALITY — 0 is the worst.
    Opportunity is the inverse: a site scoring all zeros is the maximum
    opportunity (biggest gap to modern standards).

    opportunity_score = 10 - sum(dims)   → high = big gap = good prospect
    """
    dims = analysis.get("opportunity_dimensions") or {}
    values = [dims.get(k) for k in _DIMENSIONS]
    if not all(isinstance(v, (int, float)) for v in values):
        return None
    # parked/error page convention from the prompt
    if all(v == -1 for v in values):
        return -1
    return 10 - int(round(sum(values)))


def compute_payback_jobs(price_point: float | int | None) -> int | None:
    if not price_point or price_point <= 0:
        return None
    return math.ceil(WEBSITE_PRICE_GBP / float(price_point))


def qualify(
    analysis: dict,
    tech: dict,
    ch: dict,
    prospect: dict,
) -> dict[str, Any]:
    """
    Combine model output, tech profile, Companies House result, and the
    prospect's Maps metadata into final scores + the qualified_lead gate.

    Returns a dict of fields ready to write to the prospects row.
    """
    opp = compute_opportunity_score(analysis)
    biz = analysis.get("business_quality_score")

    # site_score = the site's actual quality = sum of dimensions = 10 - opp
    site_score = None if opp is None or opp < 0 else max(0, 10 - opp)
    prospect_score = (
        round(opp * 0.6 + float(biz) * 0.4, 1)
        if isinstance(opp, (int, float)) and opp >= 0 and isinstance(biz, (int, float))
        else None
    )

    price_point = analysis.get("service_price_point")
    price_source = "model"
    if not price_point or price_point <= 0:
        intake_cat = prospect.get("intake_category")
        price_point = _category_price_fallback(
            intake_cat if intake_cat and intake_cat != "other" else prospect.get("category")
        )
        price_source = "category_fallback" if price_point else "none"
    payback_jobs = compute_payback_jobs(price_point)

    # --- gate -----------------------------------------------------------
    # Conditional qualification, not a score. A lead is qualified when
    # Companies House proves a real, active company AND the website is not a
    # demonstrably-modern build. Site condition is recorded as an opportunity
    # flag for ordering; the human reviews every site before shortlisting.
    reasons: list[str] = []

    ch_verified = bool(ch.get("ch_verified"))
    if ch_verified:
        reasons.append(f"Companies House verified ({ch.get('ch_match_confidence')} confidence)")
    else:
        reasons.append("no confident, active Companies House match")

    modern_custom = bool(tech.get("is_modern_custom"))
    site_down = opp == -1 or not tech.get("fetch_ok")
    built = (tech.get("site_built_estimate") or "").lower()
    platform = (tech.get("site_platform") or "").lower()
    dated_site = built.startswith("pre-") or built.endswith("or earlier")
    template_site = platform in (
        "wix", "weebly", "jimdo", "site123", "strikingly", "godaddy",
        "squarespace", "wordpress",
    )

    if site_down:
        opportunity = "site-down"
        reasons.append("site unreachable or parked — treated as site-down opportunity")
    elif dated_site:
        opportunity = "dated"
        reasons.append(f"dated build ({tech.get('site_built_estimate')})")
    elif template_site:
        opportunity = "template"
        reasons.append(f"template-builder platform '{tech.get('site_platform')}'")
    elif modern_custom:
        opportunity = "modern"
        reasons.append(f"platform '{tech.get('site_platform')}' looks like a modern custom build")
    else:
        opportunity = "unreviewed"
        reasons.append("no strong site signal — flagged for manual review")

    payback_ok = payback_jobs is not None and payback_jobs <= MAX_PAYBACK_JOBS
    if payback_jobs is None:
        reasons.append("payback unknown — no price point estimated")
    else:
        src = " (category estimate)" if price_source == "category_fallback" else ""
        reasons.append(
            f"payback ~{payback_jobs} job{'s' if payback_jobs != 1 else ''}{src}"
        )

    qualified = bool(ch_verified and opportunity != "modern")

    return {
        "site_score": site_score,
        "opportunity_score": opp,
        "business_quality_score": biz,
        "prospect_score": prospect_score,
        "service_price_point": price_point,
        "payback_jobs": payback_jobs,
        "qualified_lead": qualified,
        "qualification_reasons": reasons,
    }

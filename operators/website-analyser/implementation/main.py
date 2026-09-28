"""
Website Analyser — Main Entry Point

Orchestrates the analysis pipeline:
  fetch unanalysed prospects → screenshot → vision analysis → store

Designed to run via CLI or cron. No human presence required during execution.

Usage:
    python operator.py                          # analyse all unanalysed prospects
    python operator.py --dry-run                # screenshot only, no DB writes
    python operator.py --url https://example.com [--name "Acme" --category "barber shop"]
    python operator.py --limit 20               # cap at 20 prospects per run
"""

import argparse
import json
import logging
import os
import sys
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

from analyser.companies_house import check as check_companies_house
from analyser.qualify import qualify
from analyser.screenshot import capture as capture_screenshot
from analyser.tech import profile as profile_tech
from analyser.vision import analyse as analyse_vision
from storage.supabase import count_analysed, fetch_unanalysed, write_analysis

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("website-analyser")

OPERATOR_NAME = "website-analyser"
OPERATOR_VERSION = "1.0.0"


# ---------------------------------------------------------------------------
# Single analysis (used by --url mode and batch loop)
# ---------------------------------------------------------------------------


def analyse_one(
    url: str,
    name: str = "Unknown",
    category: str = "local business",
    location: str = "UK",
    place_id: str | None = None,
    prospect: dict | None = None,
    dry_run: bool = False,
    skip_ch: bool = False,
) -> dict | None:
    """
    Run the full viability pipeline for one website:
      tech profile → desktop+mobile screenshots → vision analysis
      → Companies House check → qualification gate → store

    Returns the merged record dict, or None on failure.
    """
    logger.info("Analysing: %s (%s — %s)", url, name, category)
    prospect = prospect or {}

    # 1. Technology profile — platform, stack, build-age signals
    tech = profile_tech(url)
    if not tech.get("fetch_ok"):
        logger.warning("No HTML fetched for %s — tech profile empty, continuing.", url)

    # 2. Screenshots — desktop first, mobile for evidence-based mobile score
    try:
        desktop_bytes = capture_screenshot(url)
    except Exception as exc:
        logger.error("Desktop screenshot failed for %s: %s", url, exc)
        # If the site itself is also unreachable, this is a site-down
        # opportunity — still write a record so it becomes a lead instead
        # of being retried forever.
        if tech.get("site_down"):
            return _site_down_record(url, name, tech, prospect, place_id, dry_run)
        return None
    try:
        mobile_bytes = capture_screenshot(url, mobile=True)
    except Exception as exc:
        logger.warning("Mobile screenshot failed for %s (%s) — scoring desktop only.", url, exc)
        mobile_bytes = None

    # 3. Vision analysis — model proposes dimensions and signals
    try:
        analysis = analyse_vision(
            screenshot_bytes=desktop_bytes,
            mobile_bytes=mobile_bytes,
            business_name=name,
            category=category,
            location=location,
            website_url=url,
            site_platform=tech.get("site_platform"),
            site_age_signals=tech.get("site_age_signal"),
        )
    except Exception as exc:
        logger.error("Vision analysis failed for %s: %s", url, exc)
        return None

    # 4. Companies House viability — skipped gracefully if no API key
    if skip_ch:
        ch = {"ch_verified": False}
    else:
        try:
            ch = check_companies_house(
                name=name,
                postcode=prospect.get("postcode"),
                company_number=prospect.get("source_company_number"),
            )
        except EnvironmentError as exc:
            logger.warning("Companies House check unavailable: %s", exc)
            ch = {"ch_verified": False}

    # 5. Qualification gate — all arithmetic happens here
    scores = qualify(analysis=analysis, tech=tech, ch=ch, prospect=prospect)

    record = {
        **analysis,
        **scores,
        "tech_stack": tech.get("tech_stack"),
        "site_platform": tech.get("site_platform"),
        "site_age_signal": tech.get("site_age_signal"),
        "site_built_estimate": tech.get("site_built_estimate"),
        "source_company_number": ch.get("source_company_number"),
        "source_url": ch.get("source_url"),
        "ch_status": ch.get("ch_status"),
        "ch_incorporated_date": ch.get("ch_incorporated_date"),
        "ch_accounts_type": ch.get("ch_accounts_type"),
        "ch_accounts_last_date": ch.get("ch_accounts_last_date"),
        "ch_match_confidence": ch.get("ch_match_confidence"),
    }

    logger.info(
        "Result: %s — site %s/10, opp %s/10, biz %s/10, prospect %s | "
        "platform=%s built=%s | payback=%s jobs | qualified=%s",
        name,
        record.get("site_score"), record.get("opportunity_score"),
        record.get("business_quality_score"), record.get("prospect_score"),
        record.get("site_platform"), record.get("site_built_estimate"),
        record.get("payback_jobs"), record.get("qualified_lead"),
    )

    # 6. Store (unless dry-run). Rows without a place_id (Companies
    # House-sourced prospects) are matched by primary key instead.
    row_id = prospect.get("id")
    if not dry_run and (place_id or row_id):
        success = write_analysis(place_id=place_id, record=record, row_id=row_id)
        if not success:
            logger.error("Failed to store analysis for %s (%s)", name, place_id or row_id)
    elif dry_run:
        logger.info("[DRY RUN] Would store analysis for %s", name)

    return record


def _site_down_record(
    url: str,
    name: str,
    tech: dict,
    prospect: dict,
    place_id: str | None,
    dry_run: bool,
) -> dict:
    """Build and store a minimal record for an unreachable site."""
    analysis = {
        "opportunity_dimensions": {k: -1 for k in (
            "visual_modernity", "mobile_experience", "desire_creation",
            "content_structure", "trust_and_credibility")},
        "business_quality_score": None,
        "service_price_point": None,
        "site_analysis": f"The website at {url} is unreachable — it returns an error or does not respond. The business has no working web presence.",
        "review_summary": "Your website isn't currently reachable — customers searching for you hit a dead end instead of finding your business. A working site that shows your services and makes it easy to get in touch would turn that lost traffic into enquiries.",
        "outreach_angle": "We noticed your website isn't loading at all — we can have a working site live quickly.",
        "site_weaknesses": ["Website unreachable or returning an error"],
    }
    try:
        ch = check_companies_house(
            name=name,
            postcode=prospect.get("postcode"),
            company_number=prospect.get("source_company_number"),
        )
    except EnvironmentError:
        ch = {"ch_verified": False}

    scores = qualify(analysis=analysis, tech=tech, ch=ch, prospect=prospect)
    record = {**analysis, **scores,
              "site_platform": tech.get("site_platform"),
              "source_company_number": ch.get("source_company_number"),
              "source_url": ch.get("source_url"),
              "ch_status": ch.get("ch_status"),
              "ch_incorporated_date": ch.get("ch_incorporated_date"),
              "ch_accounts_type": ch.get("ch_accounts_type"),
              "ch_accounts_last_date": ch.get("ch_accounts_last_date"),
              "ch_match_confidence": ch.get("ch_match_confidence")}

    logger.info("Site-down record: %s — qualified=%s", name, record.get("qualified_lead"))

    row_id = prospect.get("id")
    if not dry_run and (place_id or row_id):
        write_analysis(place_id=place_id, record=record, row_id=row_id)
    return record


# ---------------------------------------------------------------------------
# Batch run
# ---------------------------------------------------------------------------


def run(dry_run: bool = False, limit: int = 200, skip_ch: bool = False) -> None:
    run_id = str(uuid.uuid4())[:8]
    started_at = datetime.now(timezone.utc)

    logger.info("=" * 60)
    logger.info("%s v%s — RUN %s", OPERATOR_NAME, OPERATOR_VERSION, run_id)
    logger.info("Started: %s", started_at.strftime("%Y-%m-%d %H:%M:%S UTC"))
    if dry_run:
        logger.info("DRY RUN — no database writes will occur")
    logger.info("=" * 60)

    # Fetch unanalysed prospects
    try:
        prospects = fetch_unanalysed(limit=limit)
    except Exception as exc:
        logger.critical("Failed to fetch prospects: %s", exc)
        sys.exit(1)

    if not prospects:
        logger.info("No unanalysed prospects found — nothing to do.")
        return

    logger.info("Analysing %d prospects.", len(prospects))

    total_success = 0
    total_failed = 0
    total_skipped = 0
    total_qualified = 0

    for prospect in prospects:
        url = prospect.get("website")
        place_id = prospect.get("place_id")
        name = prospect.get("name") or "Unknown"
        category = prospect.get("category") or "local business"
        location = prospect.get("city") or prospect.get("search_location") or "UK"

        if not url:
            logger.debug("Skipping %s — no website URL.", name)
            total_skipped += 1
            continue

        result = analyse_one(
            url=url,
            name=name,
            category=category,
            location=location,
            place_id=place_id,
            prospect=prospect,
            dry_run=dry_run,
            skip_ch=skip_ch,
        )

        if result is not None:
            total_success += 1
            if result.get("qualified_lead"):
                total_qualified += 1
        else:
            total_failed += 1

    # ---------------------------------------------------------------------------
    # Summary
    # ---------------------------------------------------------------------------

    duration = (datetime.now(timezone.utc) - started_at).total_seconds()

    logger.info("=" * 60)
    logger.info("RUN COMPLETE — %s", run_id)
    logger.info("  Prospects analysed: %d", total_success)
    logger.info("  Qualified leads:    %d", total_qualified)
    logger.info("  Failed:             %d", total_failed)
    logger.info("  Skipped:            %d", total_skipped)
    logger.info("  Duration:           %.1fs", duration)
    logger.info("  Avg per prospect:   %.1fs", duration / max(total_success, 1))

    if not dry_run:
        total_in_db = count_analysed()
        if total_in_db >= 0:
            logger.info("  Total analysed in DB: %d", total_in_db)

    logger.info("=" * 60)

    if total_failed > 0 and total_success == 0:
        sys.exit(1)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Website Analyser — Sorted acquisition analysis operator",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Screenshot and analyse but do not write to the database",
    )
    parser.add_argument(
        "--url",
        type=str,
        default=None,
        help="Analyse a single URL and print the result (ad-hoc mode)",
    )
    parser.add_argument(
        "--name",
        type=str,
        default="Unknown",
        help="Business name (used with --url)",
    )
    parser.add_argument(
        "--category",
        type=str,
        default="local business",
        help="Business category (used with --url)",
    )
    parser.add_argument(
        "--location",
        type=str,
        default="UK",
        help="Business location (used with --url)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=200,
        help="Maximum number of prospects to analyse per run (default: 200)",
    )
    parser.add_argument(
        "--no-ch",
        action="store_true",
        help="Skip the Companies House viability check",
    )
    args = parser.parse_args()

    try:
        if args.url:
            # Ad-hoc single URL mode — print result to stdout
            result = analyse_one(
                url=args.url,
                name=args.name,
                category=args.category,
                location=args.location,
                place_id=None,
                dry_run=True,  # single URL mode never writes to DB
            )
            if result:
                print(json.dumps(result, indent=2, ensure_ascii=False))
            else:
                logger.error("Analysis failed for %s", args.url)
                sys.exit(1)
        else:
            run(dry_run=args.dry_run, limit=args.limit, skip_ch=args.no_ch)

    except PermissionError as exc:
        logger.critical("AUTH ERROR: %s", exc)
        sys.exit(1)
    except EnvironmentError as exc:
        logger.critical("CONFIG ERROR: %s", exc)
        sys.exit(1)
    except KeyboardInterrupt:
        logger.info("Interrupted by user.")
        sys.exit(0)


if __name__ == "__main__":
    main()

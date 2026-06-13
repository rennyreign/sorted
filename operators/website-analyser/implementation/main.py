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

from analyser.screenshot import capture as capture_screenshot
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
    dry_run: bool = False,
) -> dict | None:
    """
    Analyse a single website URL. Returns the analysis dict or None on failure.
    """
    logger.info("Analysing: %s (%s — %s)", url, name, category)

    # 1. Screenshot
    try:
        screenshot_bytes = capture_screenshot(url)
    except Exception as exc:
        logger.error("Screenshot failed for %s: %s", url, exc)
        return None

    # 2. Vision analysis
    try:
        analysis = analyse_vision(
            screenshot_bytes=screenshot_bytes,
            business_name=name,
            category=category,
            location=location,
            website_url=url,
        )
    except Exception as exc:
        logger.error("Vision analysis failed for %s: %s", url, exc)
        return None

    # 3. Store (unless dry-run or no place_id)
    if not dry_run and place_id:
        success = write_analysis(place_id=place_id, analysis=analysis)
        if success:
            logger.info(
                "Stored: %s — prospect score %s/10 (biz: %s, opp: %s) | %s",
                name,
                analysis.get("prospect_score"),
                analysis.get("business_quality_score"),
                analysis.get("opportunity_score"),
                analysis.get("recommendation"),
            )
        else:
            logger.error("Failed to store analysis for %s (%s)", name, place_id)
    elif dry_run:
        logger.info("[DRY RUN] Would store analysis for %s — score %s/10", name, analysis.get("site_score"))

    return analysis


# ---------------------------------------------------------------------------
# Batch run
# ---------------------------------------------------------------------------


def run(dry_run: bool = False, limit: int = 200) -> None:
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
            dry_run=dry_run,
        )

        if result is not None:
            total_success += 1
        else:
            total_failed += 1

    # ---------------------------------------------------------------------------
    # Summary
    # ---------------------------------------------------------------------------

    duration = (datetime.now(timezone.utc) - started_at).total_seconds()

    logger.info("=" * 60)
    logger.info("RUN COMPLETE — %s", run_id)
    logger.info("  Prospects analysed: %d", total_success)
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
            run(dry_run=args.dry_run, limit=args.limit)

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

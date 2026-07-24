"""
Prospect Finder — Main Entry Point

Orchestrates the full acquisition pipeline:
  configure → search → filter → store

Designed to run via CLI or cron. No human presence required during execution.

Usage:
    python operator.py
    python operator.py --dry-run                                    # search and filter, no DB writes
    python operator.py --query "barber"                             # single category, location from config
    python operator.py --query "restaurant" --location "Bristol"    # single category, custom location
"""

import argparse
import logging
import os
import sys
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

from config import MAX_RESULTS_PER_QUERY, OPERATOR_NAME, OPERATOR_VERSION, SEARCH_QUERIES
from scraper.apify import search_google_maps
from scraper.filters import qualify_records
from storage.supabase import count_prospects, upsert_prospects

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("prospect-finder")


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------


def run(dry_run: bool = False, single_query: str | None = None, location_override: str | None = None) -> None:
    run_id = str(uuid.uuid4())[:8]
    started_at = datetime.now(timezone.utc)

    logger.info("=" * 60)
    logger.info("%s v%s — RUN %s", OPERATOR_NAME, OPERATOR_VERSION, run_id)
    logger.info("Started: %s", started_at.strftime("%Y-%m-%d %H:%M:%S UTC"))
    if dry_run:
        logger.info("DRY RUN — no database writes will occur")
    logger.info("=" * 60)

    # Determine which queries to run
    queries = SEARCH_QUERIES
    if single_query:
        queries = [
            q for q in SEARCH_QUERIES
            if single_query.lower() in q["category"].lower()
        ]
        # If --location is given and no config entry matches the category, build one on the fly
        if not queries:
            if location_override:
                queries = [{"category": single_query, "location": location_override}]
                logger.info(
                    "No config entry for '%s' — running ad-hoc query in '%s'",
                    single_query, location_override,
                )
            else:
                logger.error(
                    "No configured query matches '%s'. Check SEARCH_QUERIES in config.py.",
                    single_query,
                )
                sys.exit(1)
        # Apply location override to matched queries
        if location_override:
            queries = [{"category": q["category"], "location": location_override} for q in queries]
            logger.info(
                "Location override: running '%s' in '%s'",
                single_query, location_override,
            )
        else:
            logger.info("Single-query mode: running %d matching queries for '%s'", len(queries), single_query)

    # Totals for final summary
    total_raw = 0
    total_qualified = 0
    total_skipped = 0
    total_stored = 0
    total_errors = 0

    for query in queries:
        category = query["category"]
        location = query["location"]

        # 1. Fetch from Apify
        raw_results = search_google_maps(
            category=category,
            location=location,
            max_results=MAX_RESULTS_PER_QUERY,
        )
        total_raw += len(raw_results)

        if not raw_results:
            logger.warning("No results returned for '%s' in '%s' — skipping.", category, location)
            continue

        # 2. Filter and qualify
        qualified, skipped = qualify_records(
            raw_results=raw_results,
            category=category,
            location=location,
            run_id=run_id,
        )
        total_qualified += len(qualified)
        total_skipped += skipped

        if not qualified:
            logger.info("No qualifying records for '%s' in '%s'.", category, location)
            continue

        # 3. Store
        if dry_run:
            logger.info(
                "[DRY RUN] Would write %d records for '%s' in '%s'.",
                len(qualified), category, location,
            )
            total_stored += len(qualified)
        else:
            stored, errors = upsert_prospects(qualified)
            total_stored += stored
            total_errors += errors
            logger.info(
                "Stored %d records for '%s' in '%s' (%d errors).",
                stored, category, location, errors,
            )

    # ---------------------------------------------------------------------------
    # Summary
    # ---------------------------------------------------------------------------

    duration = (datetime.now(timezone.utc) - started_at).total_seconds()

    logger.info("=" * 60)
    logger.info("RUN COMPLETE — %s", run_id)
    logger.info("  Queries run:       %d", len(queries))
    logger.info("  Raw results:       %d", total_raw)
    logger.info("  Qualified:         %d", total_qualified)
    logger.info("  Skipped:           %d", total_skipped)
    logger.info("  Stored/updated:    %d", total_stored)
    if total_errors:
        logger.warning("  Storage errors:    %d", total_errors)
    logger.info("  Duration:          %.1fs", duration)

    if not dry_run:
        total_in_db = count_prospects()
        if total_in_db >= 0:
            logger.info("  Total prospects in DB: %d", total_in_db)

    logger.info("=" * 60)

    # Systemic failure: scraper returned 0 raw results across all queries.
    # This almost always indicates a scraper-level issue (rate limit, auth,
    # network, platform-feature-disabled). Without this check the run exits
    # 0 and GitHub Actions reports green — masking the problem for days.
    if total_raw == 0 and len(queries) > 0:
        logger.critical(
            "SYSTEMIC FAILURE: 0 raw results across all %d queries. "
            "Scraper is likely down (rate limit, auth, or platform issue). "
            "Check Apify account status and API token.",
            len(queries),
        )
        sys.exit(1)

    if total_errors > 0:
        sys.exit(1)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Prospect Finder — Sorted acquisition operator",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run without writing to the database",
    )
    parser.add_argument(
        "--query",
        type=str,
        default=None,
        help="Run only queries matching this category name (partial match)",
    )
    parser.add_argument(
        "--location",
        type=str,
        default=None,
        help="Override the location for this run (e.g. 'Bristol, UK'). Works with --query.",
    )
    args = parser.parse_args()

    try:
        run(dry_run=args.dry_run, single_query=args.query, location_override=args.location)
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

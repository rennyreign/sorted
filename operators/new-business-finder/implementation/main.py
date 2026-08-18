"""
New Business Finder — Main Entry Point

Searches Companies House for recently incorporated UK companies, filters and
deduplicates them, and writes suitable records into the shared Prospect Finder
CRM (`prospects` table).

Usage:
    python main.py --dry-run
    python main.py --days-back 7 --max-results 100
    python main.py --from-date 2026-07-01 --to-date 2026-07-31 --location "Coventry"
"""

import argparse
import logging
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from dotenv import load_dotenv

load_dotenv()

from config import DEFAULT_DAYS_BACK, DEFAULT_MAX_RESULTS, OPERATOR_NAME, OPERATOR_VERSION, TARGET_SIC_CODES
from companies_house import search_recent_companies
from filters import qualify_records
from storage.supabase import insert_run_summary, store_companies_house_records

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("new-business-finder")


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------


def run(
    days_back: int | None = None,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    location: str | None = None,
    max_results: int = DEFAULT_MAX_RESULTS,
    dry_run: bool = False,
) -> dict[str, Any]:
    run_id = str(uuid.uuid4())[:8]
    started_at = datetime.now(timezone.utc)
    started_at_iso = started_at.isoformat()

    # Resolve date range
    if from_date and to_date:
        date_from = from_date.date()
        date_to = to_date.date()
    elif from_date:
        date_from = from_date.date()
        date_to = datetime.now(timezone.utc).date()
    elif days_back is not None:
        date_to = datetime.now(timezone.utc).date()
        date_from = date_to - timedelta(days=days_back)
    else:
        date_to = datetime.now(timezone.utc).date()
        date_from = date_to - timedelta(days=DEFAULT_DAYS_BACK)

    logger.info("=" * 60)
    logger.info("%s v%s — RUN %s", OPERATOR_NAME, OPERATOR_VERSION, run_id)
    logger.info("Started: %s", started_at.strftime("%Y-%m-%d %H:%M:%S UTC"))
    logger.info("Date range: %s to %s", date_from.isoformat(), date_to.isoformat())
    if location:
        logger.info("Location filter: %s", location)
    logger.info("Max results: %d", max_results)
    logger.info("Target SIC codes: %d", len(TARGET_SIC_CODES))
    if dry_run:
        logger.info("DRY RUN — no database writes will occur")
    logger.info("=" * 60)

    # 1. Fetch from Companies House
    try:
        raw_results = search_recent_companies(
            incorporated_from=date_from,
            incorporated_to=date_to,
            sic_codes=TARGET_SIC_CODES,
            location=location,
            max_results=max_results,
        )
    except (PermissionError, EnvironmentError) as exc:
        logger.critical("%s", exc)
        sys.exit(1)

    # 2. Filter and normalise
    qualified, rejected = qualify_records(raw_results)

    # 3. Store (unless dry run)
    counters = {"created": 0, "updated": 0, "duplicate": 0, "error": 0}
    if dry_run:
        logger.info("[DRY RUN] Would store %d records.", len(qualified))
        counters = {"created": len(qualified), "updated": 0, "duplicate": 0, "error": 0}
    elif qualified:
        counters = store_companies_house_records(qualified, run_id)

    # 4. Persist run summary
    duration = (datetime.now(timezone.utc) - started_at).total_seconds()
    logger.info("=" * 60)
    logger.info("RUN COMPLETE — %s", run_id)
    logger.info("  Raw results:       %d", len(raw_results))
    logger.info("  Rejected:          %d", rejected)
    logger.info("  Duplicates:        %d", counters["duplicate"])
    logger.info("  Created:           %d", counters["created"])
    logger.info("  Updated:           %d", counters["updated"])
    if counters["error"]:
        logger.warning("  Errors:            %d", counters["error"])
    logger.info("  Duration:          %.1fs", duration)
    logger.info("=" * 60)

    if not dry_run:
        insert_run_summary(
            run_id=run_id,
            started_at=started_at_iso,
            requested_date_from=date_from,
            requested_date_to=date_to,
            requested_location=location,
            records_returned=len(raw_results),
            records_rejected=rejected,
            duplicates_found=counters["duplicate"],
            prospects_created=counters["created"],
            prospects_updated=counters["updated"],
            errors=counters["error"],
            error_summary=None,
        )

    return {
        "run_id": run_id,
        "raw_results": len(raw_results),
        "rejected": rejected,
        "duplicates": counters["duplicate"],
        "created": counters["created"],
        "updated": counters["updated"],
        "errors": counters["error"],
        "duration_seconds": duration,
    }


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def parse_date(value: str) -> datetime:
    try:
        return datetime.strptime(value, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError as exc:
        raise argparse.ArgumentTypeError(f"Invalid date '{value}'. Use YYYY-MM-DD.") from exc


def main() -> None:
    parser = argparse.ArgumentParser(
        description="New Business Finder — Sorted Companies House acquisition operator",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run without writing to the database",
    )
    parser.add_argument(
        "--days-back",
        type=int,
        default=None,
        help=f"Number of days back from today (default: {DEFAULT_DAYS_BACK})",
    )
    parser.add_argument(
        "--from-date",
        type=parse_date,
        default=None,
        help="Incorporation start date (YYYY-MM-DD). Overrides --days-back.",
    )
    parser.add_argument(
        "--to-date",
        type=parse_date,
        default=None,
        help="Incorporation end date (YYYY-MM-DD). Defaults to today.",
    )
    parser.add_argument(
        "--location",
        type=str,
        default=None,
        help="Optional location filter (e.g. 'Coventry', 'Warks', 'CV1')",
    )
    parser.add_argument(
        "--max-results",
        type=int,
        default=DEFAULT_MAX_RESULTS,
        help=f"Maximum number of Companies House results to retrieve (default: {DEFAULT_MAX_RESULTS})",
    )
    args = parser.parse_args()

    try:
        run(
            days_back=args.days_back,
            from_date=args.from_date,
            to_date=args.to_date,
            location=args.location,
            max_results=args.max_results,
            dry_run=args.dry_run,
        )
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

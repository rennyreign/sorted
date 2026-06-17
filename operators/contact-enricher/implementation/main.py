"""
Contact Enricher — Main Entry Point

Visits each prospect's website and extracts contact email addresses,
writing them back to the CRM.

Usage:
    python main.py                              # enrich all prospects missing an email
    python main.py --limit 20                   # cap at 20 prospects per run
    python main.py --dry-run                    # scrape but do not write to DB
    python main.py --url https://example.com    # ad-hoc single URL test
"""

import argparse
import logging
import os
import sys
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

from enricher.scraper import scrape
from storage.supabase import fetch_unenriched, write_email

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("contact-enricher")

OPERATOR_NAME = "contact-enricher"
OPERATOR_VERSION = "1.0.0"


# ---------------------------------------------------------------------------
# Single enrichment
# ---------------------------------------------------------------------------


def enrich_one(
    url: str,
    name: str = "Unknown",
    place_id: str | None = None,
    dry_run: bool = False,
) -> str | None:
    """
    Scrape a single URL for a contact email.
    Returns the email found, or None.
    """
    logger.info("Enriching: %s (%s)", url, name)

    email = scrape(url)

    if not email:
        logger.info("No email found for %s", name)
        return None

    logger.info("Found email for %s: %s", name, email)

    if not dry_run and place_id:
        success = write_email(place_id=place_id, email=email)
        if success:
            logger.info("Saved email for %s → %s", name, email)
        else:
            logger.error("Failed to save email for %s", name)
    elif dry_run:
        logger.info("[DRY RUN] Would save: %s → %s", name, email)

    return email


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

    try:
        prospects = fetch_unenriched(limit=limit)
    except Exception as exc:
        logger.critical("Failed to fetch prospects: %s", exc)
        sys.exit(1)

    if not prospects:
        logger.info("No prospects without emails found — nothing to do.")
        return

    logger.info("Enriching %d prospects.", len(prospects))

    total_found = 0
    total_not_found = 0
    total_failed = 0

    for prospect in prospects:
        url = prospect.get("website")
        place_id = prospect.get("place_id")
        name = prospect.get("name") or "Unknown"

        if not url:
            logger.debug("Skipping %s — no website URL.", name)
            total_failed += 1
            continue

        try:
            email = enrich_one(
                url=url,
                name=name,
                place_id=place_id,
                dry_run=dry_run,
            )
            if email:
                total_found += 1
            else:
                total_not_found += 1
        except Exception as exc:
            logger.error("Unexpected error enriching %s: %s", name, exc)
            total_failed += 1

    # ---------------------------------------------------------------------------
    # Summary
    # ---------------------------------------------------------------------------

    duration = (datetime.now(timezone.utc) - started_at).total_seconds()

    logger.info("=" * 60)
    logger.info("RUN COMPLETE — %s", run_id)
    logger.info("  Emails found:       %d", total_found)
    logger.info("  No email found:     %d", total_not_found)
    logger.info("  Errors/skipped:     %d", total_failed)
    logger.info("  Hit rate:           %.0f%%", 100 * total_found / max(total_found + total_not_found, 1))
    logger.info("  Duration:           %.1fs", duration)
    logger.info("  Avg per prospect:   %.1fs", duration / max(total_found + total_not_found, 1))
    logger.info("=" * 60)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Contact Enricher — scrape email addresses from prospect websites",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Scrape but do not write to the database",
    )
    parser.add_argument(
        "--url",
        type=str,
        default=None,
        help="Enrich a single URL and print the result (ad-hoc mode)",
    )
    parser.add_argument(
        "--name",
        type=str,
        default="Unknown",
        help="Business name (used with --url)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=200,
        help="Maximum number of prospects to enrich per run (default: 200)",
    )
    args = parser.parse_args()

    try:
        if args.url:
            email = enrich_one(
                url=args.url,
                name=args.name,
                place_id=None,
                dry_run=True,
            )
            if email:
                print(f"Email found: {email}")
            else:
                print("No email found.")
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

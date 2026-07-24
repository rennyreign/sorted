"""
Email Enricher — Main Entry Point

Uses Hunter.io to find email addresses for prospects that already have
an owner_name (from Companies House) but no owner_email yet.

Pipeline:
  fetch prospects → extract domain → hunter.io email finder → write to DB

Usage:
    python main.py                    # enrich up to 50 prospects (default)
    python main.py --limit 33         # cap at 33 credits
    python main.py --dry-run          # search but do not write to DB
    python main.py --domain-search    # also run free domain searches first
"""

import argparse
import logging
import os
import sys
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

from enricher.hunter import domain_search, extract_domain, find_email, rate_limit, split_name
from storage.supabase import fetch_prospects_for_enrichment, mark_enrichment_attempted, write_owner_email

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("email-enricher")

OPERATOR_NAME = "email-enricher"
OPERATOR_VERSION = "1.0.0"


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

def run(
    dry_run: bool = False,
    limit: int = 50,
    use_domain_search: bool = False,
) -> None:
    run_id = str(uuid.uuid4())[:8]
    started_at = datetime.now(timezone.utc)

    logger.info("=" * 60)
    logger.info("%s v%s — RUN %s", OPERATOR_NAME, OPERATOR_VERSION, run_id)
    logger.info("Started: %s", started_at.strftime("%Y-%m-%d %H:%M:%S UTC"))
    if dry_run:
        logger.info("DRY RUN — no database writes will occur")
    logger.info("Credit limit: %d", limit)
    logger.info("=" * 60)

    # Fetch prospects with owner_name but no owner_email
    try:
        prospects = fetch_prospects_for_enrichment(limit=limit * 2)
    except Exception as exc:
        logger.critical("Failed to fetch prospects: %s", exc)
        sys.exit(1)

    if not prospects:
        logger.info("No prospects ready for email enrichment — nothing to do.")
        return

    logger.info("Enriching up to %d prospects (%d available).", limit, len(prospects))

    total_found = 0
    total_not_found = 0
    total_skipped = 0
    credits_used = 0

    for prospect in prospects:
        if credits_used >= limit:
            logger.info("Credit limit (%d) reached — stopping.", limit)
            break

        place_id = prospect.get("place_id")
        name = prospect.get("name", "Unknown")
        owner_name = prospect.get("owner_name", "")
        website = prospect.get("website", "")

        if not owner_name or not website:
            total_skipped += 1
            continue

        domain = extract_domain(website)
        if not domain:
            logger.debug("Skipping %s — no usable domain from %s", name, website)
            total_skipped += 1
            continue

        first_name, last_name = split_name(owner_name)
        logger.info(
            "Enriching: %s — %s %s @ %s",
            name, first_name, last_name, domain,
        )

        # Optional: domain search first (uses searches quota, not credits)
        if use_domain_search:
            domain_emails = domain_search(domain)
            rate_limit()
            # Strategy: try to match owner name first, then fall back to
            # highest-confidence email or generic emails (info@, hello@, etc.)
            best_match = None
            best_confidence = 0
            best_generic = None
            best_generic_confidence = 0
            for de in domain_emails:
                de_email = de.get("value", "")
                de_first = (de.get("first_name") or "").lower()
                de_last = (de.get("last_name") or "").lower()
                de_confidence = de.get("confidence", 0)
                de_type = de.get("type", "")

                # Check for owner name match
                if first_name.lower() in de_first and last_name.lower() in de_last:
                    if de_confidence > best_confidence:
                        best_match = de
                        best_confidence = de_confidence
                # Track best generic email as fallback
                if de_type == "generic" or de_email.startswith(("info@", "hello@", "enquiries@", "enquiry@", "contact@", "admin@", "office@", "team@")):
                    if de_confidence > best_generic_confidence:
                        best_generic = de
                        best_generic_confidence = de_confidence
                # Also track highest-confidence personal email as fallback
                if de_type == "personal" and not best_match:
                    if de_confidence > best_generic_confidence:
                        best_generic = de
                        best_generic_confidence = de_confidence

            chosen = best_match or best_generic
            if chosen:
                de_email = chosen.get("value", "")
                de_confidence = chosen.get("confidence", 0)
                source = "hunter_domain_search" if best_match else "hunter_domain_search"
                logger.info("Domain search hit: %s (confidence: %s)%s", de_email, de_confidence, " [name match]" if best_match else " [best available]")
                if not dry_run:
                    write_owner_email(
                        place_id=place_id,
                        email=de_email,
                        source=source,
                        confidence=de_confidence,
                        status=chosen.get("verification", {}).get("status") if isinstance(chosen.get("verification"), dict) else None,
                    )
                total_found += 1
                continue

        # Email Finder — hunter.io only charges credits when an email is found
        result = find_email(first_name, last_name, domain)
        rate_limit()

        if result and result.get("email"):
            credits_used += 1  # credit consumed only on successful find
            if not dry_run:
                success = write_owner_email(
                    place_id=place_id,
                    email=result["email"],
                    source="hunter_email_finder",
                    confidence=result.get("score"),
                    status=None,  # hunter.io email finder doesn't verify
                )
                if success:
                    logger.info("Saved owner email for %s → %s", name, result["email"])
                else:
                    logger.error("Failed to save owner email for %s", name)
            else:
                logger.info("[DRY RUN] Would save: %s → %s", name, result["email"])
            total_found += 1
        else:
            if not dry_run:
                mark_enrichment_attempted(place_id)
            total_not_found += 1

    # ---------------------------------------------------------------------------
    # Summary
    # ---------------------------------------------------------------------------

    duration = (datetime.now(timezone.utc) - started_at).total_seconds()

    logger.info("=" * 60)
    logger.info("RUN COMPLETE — %s", run_id)
    logger.info("  Emails found:       %d", total_found)
    logger.info("  No email found:     %d", total_not_found)
    logger.info("  Skipped (no domain): %d", total_skipped)
    logger.info("  Credits used:       %d / %d", credits_used, limit)
    logger.info("  Hit rate:           %.0f%%", 100 * total_found / max(total_found + total_not_found, 1))
    logger.info("  Duration:           %.1fs", duration)
    logger.info("=" * 60)

    if credits_used == 0 and total_skipped == len(prospects):
        logger.warning("No credits used — all prospects were skipped (no usable domains).")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Email Enricher — find owner emails via Hunter.io",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Search but do not write to the database",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=50,
        help="Maximum credits to use per run (default: 50)",
    )
    parser.add_argument(
        "--domain-search",
        action="store_true",
        help="Also run free domain searches before email finder",
    )
    args = parser.parse_args()

    try:
        run(
            dry_run=args.dry_run,
            limit=args.limit,
            use_domain_search=args.domain_search,
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

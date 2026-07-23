#!/usr/bin/env python3
"""
Sorted Email Enricher — Direct owner email discovery via Hunter.io.

Takes prospects with an identified owner name (or just a website domain),
uses Hunter.io to find direct email addresses, and writes them back to the CRM.

Two modes:
  1. Domain Search — finds all emails at a domain (no owner name needed)
  2. Email Finder — given owner name + domain, finds their specific email

Prefers Email Finder when owner_name is available (more precise).
Falls back to Domain Search when only the domain is known.

Also runs email verification on found emails to set confidence.

Usage:
    python main.py                          # enrich all prospects missing owner_email
    python main.py --limit 20               # cap at 20 prospects per run
    python main.py --dry-run                # call Hunter but don't write to DB
    python main.py --domain example.com     # ad-hoc single domain test
    python main.py --verify-only            # only verify existing owner_emails
"""

import argparse
import logging
import os
import sys
import time
from datetime import datetime, timezone
from urllib.parse import urlparse

import requests
from dotenv import load_dotenv

load_dotenv()

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("email-enricher")

# ─── Config ───────────────────────────────────────────────────────────────────

HUNTER_API_KEY = os.environ.get("HUNTER_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

HUNTER_BASE = "https://api.hunter.io/v2"
REQUEST_TIMEOUT = 30
RATE_LIMIT_DELAY = 1.0  # seconds between Hunter API calls

# Owner titles to look for in domain search results
OWNER_TITLES = [
    "owner", "founder", "director", "proprietor", "partner",
    "managing director", "ceo", "principal", "head",
]

# ─── Supabase helpers ─────────────────────────────────────────────────────────

def supabase_headers():
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

def supabase_get(path, params=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    r = requests.get(url, headers=supabase_headers(), params=params, timeout=30)
    r.raise_for_status()
    return r.json()

def supabase_patch(path, body, params=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    r = requests.patch(url, headers=supabase_headers(), json=body, params=params, timeout=30)
    r.raise_for_status()
    return r.json()

# ─── Hunter.io API ────────────────────────────────────────────────────────────

def hunter_domain_search(domain):
    """
    Search for all emails at a domain.
    Returns list of email records: {value, type, confidence, first_name, last_name, position, sources}
    """
    try:
        r = requests.get(
            f"{HUNTER_BASE}/domain-search",
            params={"domain": domain, "api_key": HUNTER_API_KEY, "limit": 10},
            timeout=REQUEST_TIMEOUT,
        )
        if r.status_code == 429:
            log.warning("Hunter rate limit hit — waiting 5s")
            time.sleep(5)
            return hunter_domain_search(domain)
        r.raise_for_status()
        data = r.json().get("data", {})
        return data.get("emails", [])
    except Exception as e:
        log.error(f"Domain search failed for {domain}: {e}")
        return []

def hunter_email_finder(first_name, last_name, domain):
    """
    Find a specific person's email by name + domain.
    Returns {email, score, position, verification} or None.
    """
    try:
        r = requests.get(
            f"{HUNTER_BASE}/email-finder",
            params={
                "domain": domain,
                "first_name": first_name,
                "last_name": last_name,
                "api_key": HUNTER_API_KEY,
            },
            timeout=REQUEST_TIMEOUT,
        )
        if r.status_code == 429:
            log.warning("Hunter rate limit hit — waiting 5s")
            time.sleep(5)
            return hunter_email_finder(first_name, last_name, domain)
        r.raise_for_status()
        return r.json().get("data")
    except Exception as e:
        log.error(f"Email finder failed for {first_name} {last_name} @ {domain}: {e}")
        return None

def hunter_email_verifier(email):
    """
    Verify an email address.
    Returns {status, score, result} or None.
    """
    try:
        r = requests.get(
            f"{HUNTER_BASE}/email-verifier",
            params={"email": email, "api_key": HUNTER_API_KEY},
            timeout=REQUEST_TIMEOUT,
        )
        if r.status_code == 429:
            log.warning("Hunter rate limit hit — waiting 5s")
            time.sleep(5)
            return hunter_email_verifier(email)
        r.raise_for_status()
        return r.json().get("data")
    except Exception as e:
        log.error(f"Email verifier failed for {email}: {e}")
        return None

# ─── Email selection logic ────────────────────────────────────────────────────

def is_owner_title(position):
    """Check if a job title looks like a business owner."""
    if not position:
        return False
    pos_lower = position.lower()
    return any(title in pos_lower for title in OWNER_TITLES)

def select_best_email_from_domain_search(emails, owner_name=None):
    """
    From domain search results, pick the best email.
    Prefers: owner name match > owner title > highest confidence personal email.
    """
    if not emails:
        return None, None, None

    owner_first = None
    owner_last = None
    if owner_name:
        parts = owner_name.strip().split()
        if len(parts) >= 2:
            owner_first = parts[0].lower()
            owner_last = parts[-1].lower()

    # 1. Match by owner name
    if owner_first and owner_last:
        for e in emails:
            first = (e.get("first_name") or "").lower()
            last = (e.get("last_name") or "").lower()
            if first == owner_first and last == owner_last:
                return e["value"], e.get("confidence", 0), e.get("position")

    # 2. Match by owner title
    for e in emails:
        if is_owner_title(e.get("position")) and e.get("type") != "generic":
            return e["value"], e.get("confidence", 0), e.get("position")

    # 3. Highest confidence personal (non-generic) email
    personal = [e for e in emails if e.get("type") != "generic"]
    if personal:
        best = max(personal, key=lambda e: e.get("confidence", 0))
        return best["value"], best.get("confidence", 0), best.get("position")

    # 4. Last resort: best generic email (info@, hello@)
    if emails:
        best = max(emails, key=lambda e: e.get("confidence", 0))
        return best["value"], best.get("confidence", 0), best.get("position")

    return None, None, None

# Social media / platform domains that shouldn't be used for email enrichment
SOCIAL_DOMAINS = {
    "instagram.com", "facebook.com", "twitter.com", "x.com",
    "linkedin.com", "tiktok.com", "youtube.com", "pinterest.com",
    "booksy.com", "treatwell.com", "vagaro.com", "fresha.com",
    "linktr.ee", "beacons.ai", "canva.com", "wix.com",
    "squarespace.com", "weebly.com", "wordpress.com",
}

def extract_domain(website_url):
    """Extract the bare domain from a URL. Returns None for social media / platform domains."""
    if not website_url:
        return None
    parsed = urlparse(website_url)
    domain = parsed.netloc.lstrip("www.")
    if not domain:
        # Maybe it was just a domain, not a URL
        domain = website_url.lstrip("www.")
    if "." not in domain:
        return None
    # Skip social media and booking platform domains (including subdomains)
    domain_lower = domain.lower()
    for social in SOCIAL_DOMAINS:
        if domain_lower == social or domain_lower.endswith("." + social):
            return None
    return domain

def split_name(full_name):
    """Split a full name into first and last name."""
    if not full_name:
        return None, None
    parts = full_name.strip().split()
    if len(parts) < 2:
        return parts[0], None
    return parts[0], parts[-1]

# ─── Core enrichment logic ────────────────────────────────────────────────────

def enrich_one(prospect, dry_run=False):
    """
    Enrich a single prospect with an owner email via Hunter.io.
    Returns the email found, or None.
    """
    pid = prospect["id"]
    name = prospect.get("name", "Unknown")
    website = prospect.get("website")
    owner_name = prospect.get("owner_name")

    domain = extract_domain(website)
    if not domain:
        log.info(f"Prospect {pid} ({name}) — no valid domain from website '{website}'")
        return None

    log.info(f"Enriching prospect {pid} ({name}) — domain: {domain}")

    email = None
    confidence = None
    source = None
    position = None

    # ── Strategy 1: Email Finder (if we have an owner name) ──
    if owner_name:
        first, last = split_name(owner_name)
        if first and last:
            time.sleep(RATE_LIMIT_DELAY)
            result = hunter_email_finder(first, last, domain)
            if result and result.get("email"):
                email = result["email"]
                confidence = result.get("score", 0)
                source = "hunter_email_finder"
                position = result.get("position")
                log.info(f"  Email Finder: {email} (confidence: {confidence}%)")

    # ── Strategy 2: Domain Search (fallback or no owner name) ──
    if not email:
        time.sleep(RATE_LIMIT_DELAY)
        emails = hunter_domain_search(domain)
        if emails:
            email, confidence, position = select_best_email_from_domain_search(emails, owner_name)
            if email:
                source = "hunter_domain_search"
                log.info(f"  Domain Search: {email} (confidence: {confidence}%, position: {position})")

    if not email:
        log.info(f"  No email found for {name} via Hunter")
        return None

    # ── Verify the email ──
    time.sleep(RATE_LIMIT_DELAY)
    verification = hunter_email_verifier(email)
    email_status = "unverified"
    if verification:
        status = verification.get("status")
        if status == "valid":
            email_status = "valid"
        elif status in ("risky", "accept_all"):
            email_status = "risky"
        elif status == "invalid":
            email_status = "invalid"
        log.info(f"  Verification: {email_status} (score: {verification.get('score', 0)})")

    # ── Write to CRM ──
    now_iso = datetime.now(timezone.utc).isoformat()
    update_body = {
        "owner_email": email,
        "owner_email_source": source,
        "owner_email_confidence": confidence,
        "owner_email_status": email_status,
        "owner_email_verified_at": now_iso,
        "owner_enriched_at": now_iso,
    }

    # Update owner_role if we found a position and don't already have one
    if position and not prospect.get("owner_role"):
        update_body["owner_role"] = position

    if not dry_run:
        supabase_patch("prospects", update_body, params={"id": f"eq.{pid}"})
        log.info(f"  Saved to CRM: {email} ({email_status})")
    else:
        log.info(f"  [DRY RUN] Would save: {email} ({email_status})")

    return email

def verify_one(prospect, dry_run=False):
    """Verify an existing owner_email without re-enriching."""
    pid = prospect["id"]
    email = prospect.get("owner_email")
    if not email:
        return None

    log.info(f"Verifying owner_email for prospect {pid}: {email}")
    time.sleep(RATE_LIMIT_DELAY)
    verification = hunter_email_verifier(email)

    email_status = "unverified"
    if verification:
        status = verification.get("status")
        if status == "valid":
            email_status = "valid"
        elif status in ("risky", "accept_all"):
            email_status = "risky"
        elif status == "invalid":
            email_status = "invalid"

    now_iso = datetime.now(timezone.utc).isoformat()
    if not dry_run:
        supabase_patch("prospects", {
            "owner_email_status": email_status,
            "owner_email_verified_at": now_iso,
        }, params={"id": f"eq.{pid}"})
        log.info(f"  Verified: {email_status}")
    else:
        log.info(f"  [DRY RUN] Verified: {email_status}")

    return email_status

# ─── Batch runners ────────────────────────────────────────────────────────────

def fetch_prospects_for_enrichment(limit=50):
    """Fetch prospects that have a website but no owner_email, prioritised by score."""
    return supabase_get("prospects", params={
        "website": "not.is.null",
        "owner_email": "is.null",
        "or": "(outreach_status.is.null,outreach_status.in.(NOT_READY,READY))",
        "order": "site_score.asc.nullslast,opportunity_score.desc.nullslast",
        "limit": limit,
        "select": "id,name,website,owner_name,owner_role,site_score,opportunity_score",
    })

def fetch_prospects_for_verification(limit=50):
    """Fetch prospects with owner_email that hasn't been verified."""
    return supabase_get("prospects", params={
        "owner_email": "not.is.null",
        "owner_email_status": "in.(unverified,null)",
        "order": "owner_enriched_at.desc",
        "limit": limit,
        "select": "id,name,owner_email",
    })

def run_enrichment(dry_run=False, limit=50):
    log.info(f"=== Email Enricher — enrichment run (limit: {limit}) ===")
    if dry_run:
        log.info("DRY RUN — no database writes")

    try:
        prospects = fetch_prospects_for_enrichment(limit=limit)
    except Exception as e:
        log.error(f"Failed to fetch prospects: {e}")
        sys.exit(1)

    if not prospects:
        log.info("No prospects needing enrichment — nothing to do")
        return

    log.info(f"Enriching {len(prospects)} prospects")

    found = 0
    not_found = 0
    for p in prospects:
        try:
            result = enrich_one(p, dry_run=dry_run)
            if result:
                found += 1
            else:
                not_found += 1
        except Exception as e:
            log.error(f"Error enriching prospect {p.get('id')}: {e}")

    log.info(f"Done — found: {found}, not found: {not_found}")

def run_verification(dry_run=False, limit=50):
    log.info(f"=== Email Enricher — verification run (limit: {limit}) ===")
    if dry_run:
        log.info("DRY RUN — no database writes")

    try:
        prospects = fetch_prospects_for_verification(limit=limit)
    except Exception as e:
        log.error(f"Failed to fetch prospects: {e}")
        sys.exit(1)

    if not prospects:
        log.info("No prospects needing verification — nothing to do")
        return

    log.info(f"Verifying {len(prospects)} prospects")

    for p in prospects:
        try:
            verify_one(p, dry_run=dry_run)
        except Exception as e:
            log.error(f"Error verifying prospect {p.get('id')}: {e}")

    log.info("Verification complete")

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Sorted Email Enricher (Hunter.io)")
    parser.add_argument("--dry-run", action="store_true", help="Call Hunter but don't write to DB")
    parser.add_argument("--limit", type=int, default=50, help="Max prospects per run")
    parser.add_argument("--domain", type=str, help="Ad-hoc: enrich a single domain")
    parser.add_argument("--verify-only", action="store_true", help="Only verify existing owner_emails")
    args = parser.parse_args()

    if not HUNTER_API_KEY:
        log.error("HUNTER_API_KEY is not set")
        sys.exit(1)
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        log.error("SUPABASE_URL or SUPABASE_SERVICE_KEY is not set")
        sys.exit(1)

    if args.domain:
        # Ad-hoc single domain test
        result = enrich_one({
            "id": 0,
            "name": f"Test ({args.domain})",
            "website": f"https://{args.domain}",
            "owner_name": None,
        }, dry_run=True)
        if result:
            print(f"Found email: {result}")
        else:
            print("No email found")
        return

    if args.verify_only:
        run_verification(dry_run=args.dry_run, limit=args.limit)
    else:
        run_enrichment(dry_run=args.dry_run, limit=args.limit)

if __name__ == "__main__":
    main()

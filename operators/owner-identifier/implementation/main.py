#!/usr/bin/env python3
"""
Sorted Owner Identifier — Find the business owner for a prospect.

Uses two data sources to identify who owns or runs a business:
  1. Companies House API (free UK public registry) — search by company name,
     retrieve directors/officers
  2. Website scrape — About/Team/Staff pages for owner names and roles

Cross-references both sources to pick the best owner candidate.

Usage:
    python main.py                          # identify owners for all prospects missing one
    python main.py --limit 20               # cap at 20 prospects per run
    python main.py --dry-run                # scrape but don't write to DB
    python main.py --name "Test Business"   # ad-hoc single business name test
"""

import argparse
import logging
import os
import re
import sys
import time
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("owner-identifier")

# ─── Config ───────────────────────────────────────────────────────────────────

COMPANIES_HOUSE_API_KEY = os.environ.get("COMPANIES_HOUSE_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

CH_BASE = "https://api.company-information.service.gov.uk"
REQUEST_TIMEOUT = 15
RATE_LIMIT_DELAY = 0.5

# Pages to scrape for owner/team info
ABOUT_PATHS = [
    "/about", "/about-us", "/about_us",
    "/team", "/our-team", "/staff",
    "/meet-the-team", "/our-staff",
    "/our-story", "/story",
]

# Title keywords that indicate a business owner/leader
OWNER_TITLE_KEYWORDS = [
    "owner", "founder", "director", "proprietor", "partner",
    "managing director", "ceo", "chief executive", "principal",
    "co-founder", "business owner", "the boss",
]

# Regex to find person names in text (simplified — looks for "First Last" patterns)
NAME_RE = re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b")

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

# ─── Companies House API ──────────────────────────────────────────────────────

def ch_search_company(business_name):
    """
    Search Companies House by business name.
    Returns the best matching company record, or None.
    """
    if not COMPANIES_HOUSE_API_KEY:
        return None

    try:
        r = requests.get(
            f"{CH_BASE}/search/companies",
            params={"q": business_name, "items_per_page": 5},
            auth=(COMPANIES_HOUSE_API_KEY, ""),
            timeout=REQUEST_TIMEOUT,
        )
        if not r.ok:
            log.debug(f"CH search failed for '{business_name}': {r.status_code}")
            return None

        items = r.json().get("items", [])
        if not items:
            return None

        # Find best match by name similarity
        name_lower = business_name.lower().strip()
        for item in items:
            item_name = (item.get("title") or "").lower().strip()
            # Exact or near-exact match
            if item_name == name_lower or name_lower in item_name or item_name in name_lower:
                return item

        # Return top result if it's a reasonable match
        return items[0] if items else None

    except Exception as e:
        log.debug(f"CH search error for '{business_name}': {e}")
        return None

def ch_get_officers(company_number):
    """
    Get the officers (directors) for a company by company number.
    Returns list of {name, officer_role, appointed_on, resigned_on}.
    """
    if not company_number or not COMPANIES_HOUSE_API_KEY:
        return []

    try:
        r = requests.get(
            f"{CH_BASE}/company/{company_number}/officers",
            params={"items_per_page": 20},
            auth=(COMPANIES_HOUSE_API_KEY, ""),
            timeout=REQUEST_TIMEOUT,
        )
        if not r.ok:
            return []

        items = r.json().get("items", [])
        officers = []
        for item in items:
            # Skip resigned officers
            if item.get("resigned_on"):
                continue
            officers.append({
                "name": item.get("name", ""),
                "officer_role": item.get("officer_role", ""),
                "appointed_on": item.get("appointed_on", ""),
            })
        return officers

    except Exception as e:
        log.debug(f"CH officers error for company {company_number}: {e}")
        return []

def ch_clean_name(name):
    """
    Clean a Companies House officer name.
    CH names are often "SURNAME, Firstname Middle" format.
    """
    if not name:
        return None

    # Handle "SURNAME, Firstname" format
    if "," in name:
        parts = name.split(",", 1)
        surname = parts[0].strip().title()
        firstnames = parts[1].strip().title() if len(parts) > 1 else ""
        if firstnames:
            return f"{firstnames} {surname}"
        return surname

    return name.strip().title()

def ch_is_director_role(role):
    """Check if an officer role is a director/owner/partner type."""
    if not role:
        return False
    role_lower = role.lower()
    return any(k in role_lower for k in [
        "director", "managing-officer", "nominee-director",
        "llp-designated-member", "llp-member", "partner",
        "general-partner", "limited-partner",
    ])

# ─── Website scraper ──────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; SortedOwnerIdentifier/1.0; "
        "+https://sortmydigital.site)"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.9",
}

def fetch_page(url):
    """Fetch a URL and return HTML text, or None."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        if resp.ok and "text/html" in resp.headers.get("Content-Type", ""):
            return resp.text
    except Exception as e:
        log.debug(f"Fetch failed for {url}: {e}")
    return None

def extract_owner_from_page(html, base_url):
    """
    Parse an About/Team page and extract owner names + roles.
    Returns list of {name, role, source_url}.
    """
    results = []
    try:
        soup = BeautifulSoup(html, "html.parser")

        # Strategy 1: Look for elements with owner-related text
        for el in soup.find_all(["h1", "h2", "h3", "h4", "p", "span", "div", "li", "strong", "b"]):
            text = el.get_text(strip=True)
            if not text or len(text) > 200:
                continue

            text_lower = text.lower()
            # Check if this element mentions an owner title
            for keyword in OWNER_TITLE_KEYWORDS:
                if keyword in text_lower:
                    # Try to extract a name from this element or nearby
                    names = NAME_RE.findall(text)
                    for name in names:
                        # Filter out common false positives
                        if name.lower() not in ("Contact Us", "About Us", "Find Us", "Get In Touch"):
                            results.append({
                                "name": name,
                                "role": keyword.title(),
                                "source_url": base_url,
                            })
                    if names:
                        break  # Found names for this keyword, move to next element

        # Strategy 2: Look for team member cards (common patterns)
        for card in soup.find_all(["div", "article", "section"], class_=re.compile(r"team|staff|member|person|profile", re.I)):
            name_el = card.find(["h3", "h4", "h2", "strong", "b", "span"], class_=re.compile(r"name|title", re.I))
            role_el = card.find(["p", "span", "div"], class_=re.compile(r"role|position|title|job", re.I))

            name = name_el.get_text(strip=True) if name_el else None
            role = role_el.get_text(strip=True) if role_el else None

            if name and NAME_RE.match(name):
                results.append({
                    "name": name,
                    "role": role,
                    "source_url": base_url,
                })

    except Exception as e:
        log.debug(f"Parse error for {base_url}: {e}")

    return results

def scrape_website_for_owner(website_url):
    """
    Visit a prospect's website and look for owner names on About/Team pages.
    Returns list of {name, role, source_url} candidates.
    """
    if not website_url:
        return []

    parsed = urlparse(website_url)
    base = f"{parsed.scheme}://{parsed.netloc}"

    all_candidates = []

    # Try homepage first
    html = fetch_page(website_url)
    if html:
        candidates = extract_owner_from_page(html, website_url)
        all_candidates.extend(candidates)

    # Try about/team pages
    for path in ABOUT_PATHS:
        url = urljoin(base, path)
        html = fetch_page(url)
        if html:
            candidates = extract_owner_from_page(html, url)
            all_candidates.extend(candidates)
            if candidates:
                break  # Found something, no need to check more pages

    return all_candidates

# ─── Owner selection logic ────────────────────────────────────────────────────

def select_best_owner(ch_officers, website_candidates):
    """
    Pick the best owner candidate from Companies House officers and website scrape results.
    Returns {name, role, source} or None.
    """
    # Prefer Companies House directors (most authoritative)
    if ch_officers:
        directors = [o for o in ch_officers if ch_is_director_role(o["officer_role"])]
        if directors:
            # Pick the first appointed (longest-serving) director
            directors.sort(key=lambda o: o.get("appointed_on") or "9999")
            best = directors[0]
            clean_name = ch_clean_name(best["name"])
            if clean_name:
                return {
                    "name": clean_name,
                    "role": "Director",
                    "source": "companies_house",
                }

    # Fall back to website candidates
    if website_candidates:
        # Prefer candidates with owner-like titles
        for keyword in OWNER_TITLE_KEYWORDS:
            for c in website_candidates:
                if c.get("role") and keyword in c["role"].lower():
                    return {
                        "name": c["name"],
                        "role": c["role"],
                        "source": "website",
                    }

        # Otherwise just take the first candidate
        first = website_candidates[0]
        return {
            "name": first["name"],
            "role": first.get("role") or "Owner",
            "source": "website",
        }

    return None

# ─── Core identification logic ────────────────────────────────────────────────

def identify_one(prospect, dry_run=False):
    """
    Identify the owner for a single prospect.
    Returns the owner name found, or None.
    """
    pid = prospect["id"]
    name = prospect.get("name", "Unknown")
    website = prospect.get("website")

    log.info(f"Identifying owner for prospect {pid} ({name})")

    # ── Companies House ──
    ch_company = ch_search_company(name)
    ch_officers = []
    if ch_company:
        company_number = ch_company.get("company_number")
        log.info(f"  Companies House match: {ch_company.get('title')} (#{company_number})")
        time.sleep(RATE_LIMIT_DELAY)
        ch_officers = ch_get_officers(company_number)
        if ch_officers:
            log.info(f"  Found {len(ch_officers)} active officers")
    else:
        log.info(f"  No Companies House match for '{name}'")

    # ── Website scrape ──
    website_candidates = []
    if website:
        time.sleep(RATE_LIMIT_DELAY)
        website_candidates = scrape_website_for_owner(website)
        if website_candidates:
            log.info(f"  Website scrape found {len(website_candidates)} candidates")
        else:
            log.info(f"  Website scrape found no owner candidates")

    # ── Select best owner ──
    owner = select_best_owner(ch_officers, website_candidates)

    if not owner:
        log.info(f"  No owner identified for {name}")
        return None

    log.info(f"  Owner: {owner['name']} ({owner['role']}) via {owner['source']}")

    # ── Write to CRM ──
    now_iso = datetime.now(timezone.utc).isoformat()
    update_body = {
        "owner_name": owner["name"],
        "owner_role": owner["role"],
        "owner_source": owner["source"],
        "owner_identified_at": now_iso,
    }

    if not dry_run:
        supabase_patch("prospects", update_body, params={"id": f"eq.{pid}"})
        log.info(f"  Saved to CRM")
    else:
        log.info(f"  [DRY RUN] Would save")

    return owner["name"]

# ─── Batch runner ─────────────────────────────────────────────────────────────

def fetch_prospects_for_identification(limit=50):
    """Fetch prospects that don't have an owner identified yet."""
    return supabase_get("prospects", params={
        "owner_name": "is.null",
        "website": "not.is.null",
        "or": "(outreach_status.is.null,outreach_status.in.(NOT_READY,READY))",
        "order": "site_score.asc.nullslast,opportunity_score.desc.nullslast",
        "limit": limit,
        "select": "id,name,website,site_score,opportunity_score",
    })

def run(dry_run=False, limit=50):
    log.info(f"=== Owner Identifier — run (limit: {limit}) ===")
    if dry_run:
        log.info("DRY RUN — no database writes")

    try:
        prospects = fetch_prospects_for_identification(limit=limit)
    except Exception as e:
        log.error(f"Failed to fetch prospects: {e}")
        sys.exit(1)

    if not prospects:
        log.info("No prospects needing owner identification — nothing to do")
        return

    log.info(f"Identifying owners for {len(prospects)} prospects")

    identified = 0
    not_found = 0
    for p in prospects:
        try:
            result = identify_one(p, dry_run=dry_run)
            if result:
                identified += 1
            else:
                not_found += 1
            time.sleep(RATE_LIMIT_DELAY)
        except Exception as e:
            log.error(f"Error identifying owner for prospect {p.get('id')}: {e}")

    log.info(f"Done — identified: {identified}, not found: {not_found}")

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Sorted Owner Identifier")
    parser.add_argument("--dry-run", action="store_true", help="Scrape but don't write to DB")
    parser.add_argument("--limit", type=int, default=50, help="Max prospects per run")
    parser.add_argument("--name", type=str, help="Ad-hoc: search for a single business name")
    args = parser.parse_args()

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        log.error("SUPABASE_URL or SUPABASE_SERVICE_KEY is not set")
        sys.exit(1)

    if args.name:
        # Ad-hoc single business test
        result = identify_one({
            "id": 0,
            "name": args.name,
            "website": None,
        }, dry_run=True)
        if result:
            print(f"Owner: {result}")
        else:
            print("No owner found")
        return

    run(dry_run=args.dry_run, limit=args.limit)

if __name__ == "__main__":
    main()

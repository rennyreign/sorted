"""
Contact Enricher — Web scraper.

Visits a prospect's website and extracts email addresses from:
  1. The homepage
  2. /contact, /contact-us, /about, /about-us pages
  3. Any mailto: links anywhere on the pages visited

Returns the best candidate email found, or None.
"""

import logging
import re
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger("contact-enricher.scraper")

# Common contact page paths to try after the homepage
CONTACT_PATHS = [
    "/contact",
    "/contact-us",
    "/contact_us",
    "/contactus",
    "/about",
    "/about-us",
    "/about_us",
    "/get-in-touch",
    "/reach-us",
    "/find-us",
]

# Patterns to reject — system/noreply addresses that aren't real contact emails
REJECT_PATTERNS = re.compile(
    r"(noreply|no-reply|donotreply|do-not-reply|wordpress|wix|squarespace"
    r"|example\.com|mysite\.com|domain\.com|test\.com|sentry|support@sentry"
    r"|@googletagmanager|@schema\.org|@w3\.org|placeholder|your@email"
    r"|user@|admin@example|email@|name@|mail@domain"
    r"|webador\.com|weebly\.com|jimdo\.com|site123\.com"
    r"|\.(jpg|jpeg|png|gif|webp|svg|ico)$)",
    re.IGNORECASE,
)

# Regex to find email addresses in raw HTML/text
EMAIL_RE = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
    re.IGNORECASE,
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; SortedContactEnricher/1.0; "
        "+https://sortmydigital.site)"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.9",
}

REQUEST_TIMEOUT = 12  # seconds per page


def _fetch_page(url: str) -> str | None:
    """Fetch a URL and return the HTML body as text, or None on failure."""
    try:
        resp = requests.get(
            url,
            headers=HEADERS,
            timeout=REQUEST_TIMEOUT,
            allow_redirects=True,
        )
        if resp.ok and "text/html" in resp.headers.get("Content-Type", ""):
            return resp.text
    except Exception as exc:
        logger.debug("Fetch failed for %s: %s", url, exc)
    return None


def _extract_emails(html: str) -> list[str]:
    """Pull all plausible email addresses out of raw HTML."""
    # Also decode common obfuscations: [at] and (at)
    decoded = html.replace("[at]", "@").replace("(at)", "@")
    candidates = EMAIL_RE.findall(decoded)
    # Also pick up mailto: hrefs via BeautifulSoup
    try:
        soup = BeautifulSoup(html, "html.parser")
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if href.startswith("mailto:"):
                addr = href[7:].split("?")[0].strip()
                if addr:
                    candidates.append(addr)
    except Exception:
        pass
    # Deduplicate, lowercase, reject junk
    seen = set()
    result = []
    for addr in candidates:
        addr = addr.lower().strip(".,;")
        if addr in seen:
            continue
        seen.add(addr)
        if REJECT_PATTERNS.search(addr):
            continue
        result.append(addr)
    return result


def _score_email(email: str, domain: str) -> int:
    """
    Score an email so we can pick the best one.
    Higher = more likely to be a real business contact.
    """
    score = 0
    local, _, addr_domain = email.partition("@")
    # Prefer addresses on the business's own domain
    if domain and (addr_domain == domain or addr_domain.endswith("." + domain)):
        score += 10
    # Prefer common contact/info prefixes
    for prefix in ("info", "hello", "contact", "enquiries", "enquiry", "hi", "team"):
        if local.startswith(prefix):
            score += 5
            break
    # Penalise generic free email providers slightly (still valid, just not ideal)
    for provider in ("gmail.com", "hotmail.com", "outlook.com", "yahoo.co.uk", "yahoo.com", "icloud.com"):
        if addr_domain == provider:
            score -= 1
            break
    return score


def scrape(website_url: str) -> str | None:
    """
    Visit the website and return the best contact email found, or None.
    """
    parsed = urlparse(website_url)
    domain = parsed.netloc.lstrip("www.")
    base = f"{parsed.scheme}://{parsed.netloc}"

    all_emails: list[str] = []

    # 1. Homepage
    html = _fetch_page(website_url)
    if html:
        found = _extract_emails(html)
        logger.debug("Homepage %s — found emails: %s", website_url, found)
        all_emails.extend(found)

    # 2. Contact / about pages
    for path in CONTACT_PATHS:
        url = urljoin(base, path)
        html = _fetch_page(url)
        if html:
            found = _extract_emails(html)
            if found:
                logger.debug("Contact page %s — found emails: %s", url, found)
                all_emails.extend(found)
                # Stop once we've found something on a contact page
                break

    if not all_emails:
        logger.info("No emails found for %s", website_url)
        return None

    # Pick the highest-scoring unique email
    unique = list(dict.fromkeys(all_emails))  # preserve order, deduplicate
    best = max(unique, key=lambda e: _score_email(e, domain))
    logger.info("Best email for %s: %s (from %d candidates)", website_url, best, len(unique))
    return best

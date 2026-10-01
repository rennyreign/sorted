"""
Website Analyser — Technology profiler.

Fetches the prospect homepage (HTML + headers) and identifies the platform
and technologies in use. Two layers:

  1. Signature rules — always run, zero dependencies. Covers the platforms
     that account for ~95% of UK local business sites, plus age signals
     (generator meta, jQuery version, copyright year).
  2. python-Wappalyzer — optional enrichment using the open-source
     fingerprint database. Free, no API key. If the package is not
     installed the signature layer alone still runs.

The output answers two acquisition questions:
  - site_platform: what was this built on? (wix / wordpress / squarespace ...)
    A hand-built modern site is a weak prospect; a Wix site from 2017 is ideal.
  - site_built_estimate / site_age_signal: roughly how old is this build?
"""

import logging
import re
from typing import Any

import requests

logger = logging.getLogger("website-analyser.tech")

FETCH_TIMEOUT = 20
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/126.0 Safari/537.36"
)

# ---------------------------------------------------------------------------
# Signature layer — platform fingerprints that matter for Sorted prospects
# ---------------------------------------------------------------------------

_PLATFORM_SIGNATURES: list[tuple[str, str]] = [
    # (platform, regex matched against HTML, case-insensitive)
    ("wix",        r"wixstatic\.com|X-Wix|wix\.com/|_wix_browser_sess"),
    ("squarespace", r"squarespace\.com|static1\.squarespace|Squarespace\."),
    ("shopify",    r"cdn\.shopify\.com|Shopify\.theme|myshopify\.com"),
    ("webflow",    r"webflow\.js|data-wf-|\.webflow\.io|Webflow"),
    ("wordpress",  r"wp-content/|wp-includes/|wp-json"),
    ("godaddy",    r"godaddy\.com|GoDaddy|wsimg\.com"),
    ("weebly",     r"weebly\.com|Weebly"),
    ("duda",       r"dudamobile\.com|dudaone\.com|d-?duda"),
    ("joomla",     r"/media/system/js/|content=[\"']Joomla"),
    ("drupal",     r"Drupal\.settings|/sites/default/files/"),
    ("wix-studio", r"wixstudio"),
    ("ionos",      r"ionos\.co|1&1 IONOS|1and1"),
    ("site123",    r"site123\.com|SITE123"),
    ("strikingly", r"strikingly\.com"),
    ("jimdo",      r"jimdo\.com|jimstatic\.com"),
    ("nextjs",     r"__NEXT_DATA__|/_next/static"),
    ("framer",     r"framer\.com|framerusercontent"),
    ("carrd",      r"carrd\.co"),
]

_TECH_SIGNATURES: list[tuple[str, str]] = [
    ("react",      r"react(?:\.production)?\.min\.js|data-reactroot|__NEXT_DATA__"),
    ("vue",        r"vue(?:\.runtime)?(?:\.min)?\.js|data-v-[a-f0-9]{8}"),
    ("jquery",     r"jquery[-.]?(\d+\.\d+[\.\d]*)?(?:\.min)?\.js"),
    ("bootstrap",  r"bootstrap(?:\.bundle)?(?:\.min)?\.(?:js|css)"),
    ("tailwind",   r"tailwind(?:\.min)?\.css|tailwindcss"),
    ("google-analytics", r"googletagmanager\.com|google-analytics\.com|gtag\("),
    ("facebook-pixel",   r"connect\.facebook\.net|fbevents\.js"),
    ("elementor",  r"elementor"),
    ("divi",       r"et-builder|divi"),
    ("font-awesome", r"font-awesome|fontawesome"),
]

_GENERATOR_RE = re.compile(
    r'<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"\']+)["\']',
    re.IGNORECASE,
)
_COPYRIGHT_RE = re.compile(
    r"(?:©|&copy;|&#169;|copyright)\s*(?:\(c\)\s*)?(\d{4})(?:\s*[-–—]\s*(\d{4}))?",
    re.IGNORECASE,
)
_JQUERY_VERSION_RE = re.compile(r"jquery[-.]?(\d+\.\d+(?:\.\d+)?)", re.IGNORECASE)


def _fetch(url: str) -> tuple[str, dict[str, str], str | None]:
    """
    Fetch homepage HTML and headers. Returns (html, headers_lowered, ssl_issue).

    Local business sites routinely have broken/mismatched certs — retry with
    verify=False on SSL errors and flag it as an age/quality signal.
    """
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    req_headers = {"User-Agent": USER_AGENT, "Accept-Language": "en-GB,en;q=0.9"}
    ssl_issue = None
    try:
        resp = requests.get(url, headers=req_headers, timeout=FETCH_TIMEOUT, allow_redirects=True)
    except requests.exceptions.SSLError as exc:
        ssl_issue = str(exc)[:200]
        logger.info("SSL issue on %s — retrying unverified.", url)
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        resp = requests.get(url, headers=req_headers, timeout=FETCH_TIMEOUT, allow_redirects=True, verify=False)
    resp.raise_for_status()
    headers = {k.lower(): v for k, v in resp.headers.items()}
    return resp.text, headers, ssl_issue


def _detect_platform(html: str) -> str:
    for platform, pattern in _PLATFORM_SIGNATURES:
        if re.search(pattern, html, re.IGNORECASE):
            return platform
    return "custom-or-unknown"


def _detect_tech(html: str) -> list[str]:
    found = []
    for name, pattern in _TECH_SIGNATURES:
        if re.search(pattern, html, re.IGNORECASE):
            found.append(name)
    return found


def _age_signals(html: str, headers: dict[str, str]) -> dict[str, Any]:
    """Best-effort signals for how old the build is."""
    signals: dict[str, Any] = {}

    gen = _GENERATOR_RE.search(html)
    if gen:
        signals["generator"] = gen.group(1).strip()

    # Copyright year — footer build/refresh proxy. Take the latest year found.
    years = []
    for m in _COPYRIGHT_RE.finditer(html):
        for g in m.groups():
            if g and 1990 <= int(g) <= 2100:
                years.append(int(g))
    if years:
        signals["copyright_year"] = max(years)

    # jQuery major version — jQuery 1.x shipped ~pre-2016 sites, 2.x ~2013-2016.
    jq = _JQUERY_VERSION_RE.search(html)
    if jq:
        signals["jquery_version"] = jq.group(1)

    if headers.get("x-powered-by"):
        signals["powered_by"] = headers["x-powered-by"]
    if headers.get("server"):
        signals["server"] = headers["server"]

    return signals


def _estimate_age(signals: dict[str, Any], platform: str) -> str | None:
    """
    Rough build-era estimate from the signals. Returns a short label like
    'pre-2016', '2017-2020', '2021+' or None if there's not enough evidence.
    """
    jq = signals.get("jquery_version")
    if jq and jq.startswith(("1.", "2.")):
        return "pre-2016"

    gen = (signals.get("generator") or "").lower()
    if "wordpress" in gen:
        m = re.search(r"(\d+)\.", gen)
        if m and int(m.group(1)) <= 4:
            return "pre-2019"

    year = signals.get("copyright_year")
    if year:
        from datetime import date
        age = date.today().year - int(year)
        if age >= 4:
            return f"{year} or earlier"
        return str(year)

    if platform in ("wix", "weebly", "jimdo", "site123", "strikingly", "godaddy"):
        return "template site — age unknown"

    return None


def _wappalyzer_detect(url: str, html: str, headers: dict[str, str]) -> dict[str, list[str]]:
    """
    Optional enrichment via python-Wappalyzer (open-source fingerprint DB,
    no API key, no per-call cost). Returns {} if the package isn't installed.
    """
    try:
        from Wappalyzer import Wappalyzer, WebPage  # type: ignore
    except ImportError:
        return {}

    try:
        webpage = WebPage(url=url, html=html, headers=headers)
        wappalyzer = Wappalyzer.latest()
        detected = wappalyzer.analyze_with_versions_and_categories(webpage)
        # Slim it down: name -> categories, drop version noise
        return {
            name: sorted(set(meta.get("categories", [])))
            for name, meta in detected.items()
        }
    except Exception as exc:
        logger.debug("Wappalyzer enrichment failed for %s: %s", url, exc)
        return {}


def profile(url: str) -> dict[str, Any]:
    """
    Fetch and profile a website's technology stack.

    Returns a dict with:
      fetch_ok            — did we get HTML back
      site_platform       — wix | wordpress | squarespace | ... | custom-or-unknown
      tech_stack          — jsonb blob: {signatures: [...], wappalyzer: {...}, headers: {...}}
      site_age_signal     — raw signals dict (copyright year, generator, jquery ver)
      site_built_estimate — short human label e.g. 'pre-2016', '2019 or earlier'
      is_modern_custom    — True if it looks like a recent custom build (weak prospect)
    """
    try:
        html, headers, ssl_issue = _fetch(url)
    except Exception as exc:
        logger.warning("Tech profile fetch failed for %s: %s", url, exc)
        return {
            "fetch_ok": False,
            "site_platform": None,
            "tech_stack": None,
            "site_age_signal": None,
            "site_built_estimate": None,
            "is_modern_custom": False,
            "site_down": True,
        }

    platform = _detect_platform(html)
    tech = _detect_tech(html)
    signals = _age_signals(html, headers)
    wapp = _wappalyzer_detect(url, html, headers)

    tech_stack = {
        "signatures": tech,
        "wappalyzer": wapp,
        "server": signals.get("server"),
        "powered_by": signals.get("powered_by"),
        "ssl_issue": ssl_issue,
    }

    built_est = _estimate_age(signals, platform)

    # A hand-built modern stack is a weak prospect — someone already invested.
    is_modern_custom = platform in ("nextjs", "framer") or (
        platform == "custom-or-unknown" and "tailwind" in tech
    )

    logger.info(
        "Tech profile: %s → platform=%s, tech=%s, built=%s",
        url, platform, tech, built_est,
    )

    return {
        "fetch_ok": True,
        "site_platform": platform,
        "tech_stack": tech_stack,
        "site_age_signal": signals or None,
        "site_built_estimate": built_est,
        "is_modern_custom": is_modern_custom,
        "site_down": False,
    }

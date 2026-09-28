"""
Website Analyser — Screenshot capture.

Primary: Screenshotone API (fast, reliable, no local browser needed).
Fallback: playwright headless (slower, requires install, no API cost).

Returns raw image bytes (PNG) or raises RuntimeError if capture fails.
"""

import logging
import os
import time
import urllib.parse

import requests

logger = logging.getLogger("website-analyser.screenshot")

SCREENSHOTONE_BASE = "https://api.screenshotone.com/take"
VIEWPORT_WIDTH = 1280
VIEWPORT_HEIGHT = 900
MOBILE_VIEWPORT_WIDTH = 390
MOBILE_VIEWPORT_HEIGHT = 844
CAPTURE_TIMEOUT = 30


def capture(url: str, mobile: bool = False) -> bytes:
    """
    Capture an above-the-fold screenshot of the given URL.

    mobile=True captures at 390px width so the vision model scores the
    actual mobile experience instead of guessing from a desktop layout.

    Returns PNG bytes. Raises RuntimeError if all capture methods fail.
    """
    api_key = os.getenv("SCREENSHOT_API_KEY")

    if api_key:
        try:
            return _capture_screenshotone(url, api_key, mobile=mobile)
        except Exception as exc:
            logger.warning("Screenshotone failed (%s) — trying playwright fallback.", exc)

    try:
        return _capture_playwright(url, mobile=mobile)
    except Exception as exc:
        raise RuntimeError(f"All screenshot methods failed for {url}: {exc}") from exc


def _capture_screenshotone(url: str, api_key: str, mobile: bool = False) -> bytes:
    """Capture via Screenshotone REST API."""
    params = {
        "access_key": api_key,
        "url": url,
        "viewport_width": MOBILE_VIEWPORT_WIDTH if mobile else VIEWPORT_WIDTH,
        "viewport_height": MOBILE_VIEWPORT_HEIGHT if mobile else VIEWPORT_HEIGHT,
        "full_page": "false",               # above-the-fold — what a visitor first sees
        "format": "png",
        "image_quality": 80,
        # Blocking — cleaner screenshots with no overlays
        "block_ads": "true",
        "block_cookie_banners": "true",
        "block_banners_by_heuristics": "true",  # catch banners block_cookie_banners misses
        "block_chats": "true",
        "block_trackers": "true",           # don't pollute their analytics
        # Request — appear as a UK visitor (relevant for local UK businesses)
        "ip_country_code": "gb",
        # Wait — networkidle0 ensures JS-rendered content is visible
        "wait_until": "networkidle0",
        "timeout": CAPTURE_TIMEOUT,
        "delay": 2,                         # 2s extra — let animations settle
    }

    logger.debug("Screenshotone: capturing %s", url)
    response = requests.get(
        SCREENSHOTONE_BASE,
        params=params,
        timeout=CAPTURE_TIMEOUT + 10,
    )

    if response.status_code == 401:
        raise PermissionError("Screenshotone: invalid API key.")

    if response.status_code == 422:
        raise ValueError(f"Screenshotone: invalid URL or params: {response.text[:200]}")

    if not response.ok:
        raise RuntimeError(
            f"Screenshotone: HTTP {response.status_code} — {response.text[:200]}"
        )

    content_type = response.headers.get("Content-Type", "")
    if "image" not in content_type:
        raise RuntimeError(
            f"Screenshotone: unexpected content type '{content_type}'"
        )

    logger.debug("Screenshotone: captured %d bytes for %s", len(response.content), url)
    return response.content


def _capture_playwright(url: str, mobile: bool = False) -> bytes:
    """Fallback: headless Chromium via playwright."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise RuntimeError(
            "playwright not installed. Run: pip install playwright && playwright install chromium"
        )

    logger.info("Playwright: capturing %s (slower than Screenshotone)", url)
    viewport = {
        "width": MOBILE_VIEWPORT_WIDTH if mobile else VIEWPORT_WIDTH,
        "height": MOBILE_VIEWPORT_HEIGHT if mobile else VIEWPORT_HEIGHT,
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_page(viewport=viewport, is_mobile=mobile, ignore_https_errors=True)
            # domcontentloaded is far more tolerant than networkidle for slow
            # legacy sites — a 30s networkidle timeout fails on any page with
            # long-polling, chat widgets, or slow third-party assets.
            page.goto(url, wait_until="domcontentloaded", timeout=CAPTURE_TIMEOUT * 1000)
            time.sleep(3)
            png_bytes = page.screenshot(type="png", full_page=False)
            logger.debug("Playwright: captured %d bytes for %s", len(png_bytes), url)
            return png_bytes
        finally:
            browser.close()

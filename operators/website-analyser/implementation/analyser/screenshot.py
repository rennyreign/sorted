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
CAPTURE_TIMEOUT = 30


def capture(url: str) -> bytes:
    """
    Capture a full-page screenshot of the given URL.

    Returns PNG bytes. Raises RuntimeError if all capture methods fail.
    """
    api_key = os.getenv("SCREENSHOT_API_KEY")

    if api_key:
        try:
            return _capture_screenshotone(url, api_key)
        except Exception as exc:
            logger.warning("Screenshotone failed (%s) — trying playwright fallback.", exc)

    try:
        return _capture_playwright(url)
    except Exception as exc:
        raise RuntimeError(f"All screenshot methods failed for {url}: {exc}") from exc


def _capture_screenshotone(url: str, api_key: str) -> bytes:
    """Capture via Screenshotone REST API."""
    params = {
        "access_key": api_key,
        "url": url,
        "viewport_width": VIEWPORT_WIDTH,
        "viewport_height": VIEWPORT_HEIGHT,
        "full_page": "false",      # above-the-fold view — what a visitor first sees
        "format": "png",
        "image_quality": 80,
        "block_ads": "true",
        "block_cookie_banners": "true",
        "block_chats": "true",
        "timeout": CAPTURE_TIMEOUT,
        "delay": 2,                # 2s delay — let JS render
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


def _capture_playwright(url: str) -> bytes:
    """Fallback: headless Chromium via playwright."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise RuntimeError(
            "playwright not installed. Run: pip install playwright && playwright install chromium"
        )

    logger.info("Playwright: capturing %s (slower than Screenshotone)", url)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_page(viewport={"width": VIEWPORT_WIDTH, "height": VIEWPORT_HEIGHT})
            page.goto(url, wait_until="networkidle", timeout=CAPTURE_TIMEOUT * 1000)
            time.sleep(2)
            png_bytes = page.screenshot(type="png", full_page=False)
            logger.debug("Playwright: captured %d bytes for %s", len(png_bytes), url)
            return png_bytes
        finally:
            browser.close()

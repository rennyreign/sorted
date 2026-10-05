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


def capture(url: str, mobile: bool = False, full_page: bool = False) -> bytes:
    """
    Capture a screenshot of the given URL.

    mobile=True captures at 390px width so the vision model scores the
    actual mobile experience instead of guessing from a desktop layout.

    full_page=True captures the entire scrollable page (top to bottom)
    instead of just above-the-fold — needed so the vision model can see
    testimonials, services and accreditations that live below the hero.
    Height is capped at ~6000px where supported to bound runaway pages.

    Returns PNG bytes. Raises RuntimeError if all capture methods fail.
    """
    api_key = os.getenv("SCREENSHOT_API_KEY")

    if api_key:
        try:
            return _capture_screenshotone(url, api_key, mobile=mobile, full_page=full_page)
        except Exception as exc:
            logger.warning("Screenshotone failed (%s) — trying playwright fallback.", exc)

    try:
        return _capture_playwright(url, mobile=mobile, full_page=full_page)
    except Exception as exc:
        raise RuntimeError(f"All screenshot methods failed for {url}: {exc}") from exc


def _capture_screenshotone(url: str, api_key: str, mobile: bool = False, full_page: bool = False) -> bytes:
    """Capture via Screenshotone REST API."""
    params = {
        "access_key": api_key,
        "url": url,
        "viewport_width": MOBILE_VIEWPORT_WIDTH if mobile else VIEWPORT_WIDTH,
        "viewport_height": MOBILE_VIEWPORT_HEIGHT if mobile else VIEWPORT_HEIGHT,
        "full_page": "true" if full_page else "false",
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
    if full_page:
        params["full_page_max_height"] = "6000"  # bound runaway pages

    logger.debug("Screenshotone: capturing %s (full_page=%s)", url, full_page)
    response = _screenshotone_request(params)

    # Some API plans/versions reject full_page_max_height — retry once without it.
    if full_page and not response.ok and response.status_code in (400, 422):
        logger.warning(
            "Screenshotone rejected full_page_max_height (HTTP %s) — retrying without cap.",
            response.status_code,
        )
        params.pop("full_page_max_height", None)
        response = _screenshotone_request(params)

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


def _screenshotone_request(params: dict) -> requests.Response:
    return requests.get(
        SCREENSHOTONE_BASE,
        params=params,
        timeout=CAPTURE_TIMEOUT + 10,
    )


def _capture_playwright(url: str, mobile: bool = False, full_page: bool = False) -> bytes:
    """Fallback: headless Chromium via playwright."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise RuntimeError(
            "playwright not installed. Run: pip install playwright && playwright install chromium"
        )

    logger.info("Playwright: capturing %s (full_page=%s; slower than Screenshotone)", url, full_page)
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
            png_bytes = _playwright_shot(page, full_page=full_page)
            logger.debug("Playwright: captured %d bytes for %s", len(png_bytes), url)
            return png_bytes
        finally:
            browser.close()


def _playwright_shot(page, full_page: bool) -> bytes:
    """Take the screenshot, capping full-page height where possible."""
    if not full_page:
        return page.screenshot(type="png", full_page=False)

    try:
        scroll_height = page.evaluate("document.body.scrollHeight") or 0
    except Exception:
        scroll_height = 0

    # Pillow is not guaranteed in the venv — without it we can't stitch
    # segments, so fall back to a single uncapped full-page shot.
    try:
        import io
        from PIL import Image
    except ImportError:
        logger.warning(
            "Pillow not installed — taking uncapped full_page screenshot "
            "(no height cap or segment stitching)."
        )
        return page.screenshot(type="png", full_page=True)

    vh = page.viewport_size["height"]

    if scroll_height <= 6000:
        return page.screenshot(type="png", full_page=True)

    # Page taller than cap — stitch up to 3 viewport-height segments
    # (y=0, vh, 2*vh) vertically with PIL.
    logger.info(
        "Playwright: page height %dpx exceeds 6000px cap — stitching 3 segments.", scroll_height
    )
    segments = []
    for i in range(3):
        page.evaluate(f"window.scrollTo(0, {i * vh})")
        time.sleep(1)
        segments.append(Image.open(io.BytesIO(page.screenshot(type="png"))))
    page.evaluate("window.scrollTo(0, 0)")

    width = segments[0].width
    stitched = Image.new("RGB", (width, vh * len(segments)))
    for i, seg in enumerate(segments):
        stitched.paste(seg, (0, i * vh))
    buf = io.BytesIO()
    stitched.save(buf, format="PNG")
    return buf.getvalue()

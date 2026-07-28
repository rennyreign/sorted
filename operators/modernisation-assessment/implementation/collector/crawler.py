"""
Modernisation Assessment — Evidence Collector

A single crawl produces one shared JSON evidence object. Every downstream
operator reads from this state; nothing is crawled twice.

The collector is primarily deterministic. Optional screenshot capture uses
ScreenshotOne or Playwright if credentials / packages are present.
"""

from __future__ import annotations

import json
import logging
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger("modernisation-assessment.collector")

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/128.0.0.0 Safari/537.36"
)

TECH_PATTERNS = {
    "google_analytics": [r"googlesitekit", r"google-analytics", r"gtag/js", r"gtag\("],
    "google_tag_manager": [r"googletagmanager", r"gtm-"],
    "facebook_pixel": [r"connect\.facebook\.net", r"fbq\("],
    "hotjar": [r"static\.hotjar\.com", r"hj\("],
    "clarity": [r"clarity\.ms"],
    "plausible": [r"plausible\.io"],
    "mixpanel": [r"mixpanel"],
    "amplitude": [r"amplitude"],
    "calendly": [r"calendly\.com"],
    "cal_com": [r"cal\.com", r"cal\.so"],
    "fresha": [r"fresha\.com"],
    "acuity": [r"acuityscheduling\.com"],
    "hubspot": [r"js\.hubspot\.com", r"hs-scripts"],
    "mailchimp": [r"chimpstatic\.com", r"mailchimp"],
    "zoho": [r"zoho"],
    "salesforce": [r"salesforce"],
    "zapier": [r"zapier"],
    "make": [r"make\.com", r"integromat"],
    "trustpilot": [r"trustpilot"],
    "google_reviews": [r"google.*review", r"g\.page", r"search\.google"],
    "nextjs": [r"__NEXT_DATA__", r"_next"],
    "react": [r"react", r"data-reactroot"],
    "vue": [r"vue\.js", r"__VUE__"],
    "svelte": [r"svelte"],
    "gatsby": [r"gatsby"],
    "nuxt": [r"__NUXT__", r"nuxt"],
    "astro": [r"astro"],
    "jquery": [r"jquery"],
    "bootstrap": [r"bootstrap"],
    "tailwind": [r"tailwind"],
    "wordpress": [r"wp-content", r"wp-includes", r"/wp-json/", r"wordpress"],
    "squarespace": [r"squarespace", r"static\.squarespace\.com"],
    "wix": [r"wix\.com", r"static\.wixstatic\.com"],
    "shopify": [r"cdn\.shopify\.com", r"myshopify\.com"],
    "webflow": [r"webflow"],
    "framer": [r"framer"],
    "joomla": [r"joomla"],
    "drupal": [r"drupal"],
    "weebly": [r"weebly"],
    "godaddy": [r"godaddy"],
    "ionos": [r"ionos"],
}

CMS_FLEXIBLE = {"wordpress", "squarespace", "wix", "shopify", "webflow", "framer", "drupal", "joomla"}
MODERN_FRAMEWORK = {"nextjs", "react", "vue", "svelte", "gatsby", "nuxt", "astro"}


class EvidenceCollector:
    def __init__(
        self,
        url: str,
        capture_screenshots: bool = False,
        max_html_bytes: int = 1_000_000,
        max_links_to_check: int = 20,
        link_check_timeout: int = 8,
    ):
        self.start_url = url
        self.capture_screenshots = capture_screenshots
        self.max_html_bytes = max_html_bytes
        self.max_links_to_check = max_links_to_check
        self.link_check_timeout = link_check_timeout
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})

    def collect(self) -> dict[str, Any]:
        started_at = datetime.now(timezone.utc).isoformat()
        t0 = time.time()

        response = self._fetch(self.start_url)
        if response is None:
            return self._failed(started_at, "Could not fetch the URL")

        final_url = response.url
        parsed = urlparse(final_url)
        base_domain = parsed.netloc.replace("www.", "")
        origin = f"{parsed.scheme}://{parsed.netloc}"

        html = response.text[: self.max_html_bytes]
        content_size = len(response.content)
        response_time = response.elapsed.total_seconds() if response.elapsed else time.time() - t0

        soup = BeautifulSoup(html, "html.parser")

        metadata = self._extract_metadata(soup, response)
        headings = self._extract_headings(soup)
        links = self._extract_links(soup, final_url, base_domain)
        forms = self._extract_forms(soup)
        images = self._extract_images(soup, final_url, base_domain)
        structured_data = self._extract_structured_data(soup)
        text = soup.get_text(separator=" ", strip=True)
        html_head = html[:4096]
        text_head = text[:2048]

        broken_links = self._check_broken_links(links["internal"][: self.max_links_to_check])

        robots_txt = self._fetch_robots_txt(origin)
        sitemap_info = self._detect_sitemap(origin, robots_txt)

        mixed_content = self._detect_mixed_content(html, final_url)
        security_headers = self._security_headers(response.headers)
        technologies, cms = self._detect_technologies(soup, response, html)

        screenshots: dict[str, Any] = {"desktop": None, "mobile": None}
        if self.capture_screenshots:
            screenshots = self._capture_screenshots(final_url)

        page_metrics = {
            "status_code": response.status_code,
            "response_time_seconds": round(response_time, 3),
            "content_size_bytes": content_size,
            "content_size_kb": round(content_size / 1024, 1),
            "text_to_html_ratio": round(len(text) / max(len(html), 1), 4),
            "https": parsed.scheme == "https",
            "http_version": self._http_version(response),
            "compression": response.headers.get("Content-Encoding", "").lower() in {"gzip", "br", "deflate"},
        }

        evidence = {
            "url": final_url,
            "domain": base_domain,
            "origin": origin,
            "started_at": started_at,
            "collected_at": datetime.now(timezone.utc).isoformat(),
            "operator_version": "1.0.0",
            "page_metrics": page_metrics,
            "metadata": metadata,
            "headings": headings,
            "links": links,
            "forms": forms,
            "images": images,
            "structured_data": structured_data,
            "text": text[:5000],
            "broken_links": broken_links,
            "robots_txt": robots_txt,
            "sitemap": sitemap_info,
            "mixed_content": mixed_content,
            "security_headers": security_headers,
            "technologies": technologies,
            "cms": cms,
            "html_head": html_head,
            "text_head": text_head,
            "screenshots": screenshots,
        }

        return evidence

    def _fetch(self, url: str) -> requests.Response | None:
        try:
            resp = self.session.get(url, timeout=30, allow_redirects=True, stream=True)
            # Limit bytes to avoid huge downloads.
            content = b""
            for chunk in resp.iter_content(chunk_size=8192):
                content += chunk
                if len(content) > self.max_html_bytes:
                    break
            resp._content = content
            resp.close()
            return resp
        except Exception as exc:
            logger.error("Fetch failed for %s: %s", url, exc)
            return None

    def _failed(self, started_at: str, reason: str) -> dict[str, Any]:
        return {
            "url": self.start_url,
            "started_at": started_at,
            "collected_at": datetime.now(timezone.utc).isoformat(),
            "operator_version": "1.0.0",
            "error": reason,
            "page_metrics": {"status_code": 0, "https": self.start_url.startswith("https://")},
            "metadata": {},
            "headings": [],
            "links": {"internal": [], "external": [], "counts": {"total": 0, "internal": 0, "external": 0}},
            "forms": [],
            "images": [],
            "structured_data": [],
            "text": "",
            "broken_links": [],
            "robots_txt": None,
            "sitemap": {},
            "mixed_content": [],
            "security_headers": {},
            "technologies": [],
            "cms": None,
            "screenshots": {"desktop": None, "mobile": None},
        }

    def _extract_metadata(self, soup: BeautifulSoup, response: requests.Response) -> dict[str, Any]:
        title_tag = soup.find("title")
        title = title_tag.get_text(strip=True) if title_tag else ""

        meta_desc = soup.find("meta", attrs={"name": "description"})
        description = meta_desc.get("content", "").strip() if meta_desc else ""

        viewport = soup.find("meta", attrs={"name": "viewport"})
        generator = soup.find("meta", attrs={"name": "generator"})
        robots = soup.find("meta", attrs={"name": "robots"})
        canonical = soup.find("link", attrs={"rel": "canonical"})

        og = {}
        for tag in soup.find_all("meta", property=lambda p: p and p.startswith("og:")):
            og[tag.get("property", "")] = tag.get("content", "")

        html_tag = soup.find("html")
        lang = html_tag.get("lang", "") if html_tag else ""

        return {
            "title": title,
            "title_length": len(title),
            "description": description,
            "description_length": len(description),
            "viewport": viewport.get("content", "") if viewport else "",
            "generator": generator.get("content", "").strip() if generator else "",
            "robots_meta": robots.get("content", "").lower() if robots else "",
            "canonical": canonical.get("href", "").strip() if canonical else "",
            "og_tags": og,
            "lang": lang,
            "charset": self._detect_charset(response, soup),
            "theme_color": (soup.find("meta", attrs={"name": "theme-color"}) or {}).get("content", ""),
        }

    def _detect_charset(self, response: requests.Response, soup: BeautifulSoup) -> str:
        content_type = response.headers.get("Content-Type", "")
        m = re.search(r"charset=([\w-]+)", content_type, re.IGNORECASE)
        if m:
            return m.group(1)
        meta = soup.find("meta", attrs={"charset": True})
        if meta:
            return meta.get("charset", "")
        return ""

    def _extract_headings(self, soup: BeautifulSoup) -> list[dict[str, Any]]:
        headings = []
        for level in range(1, 7):
            for tag in soup.find_all(f"h{level}"):
                text = tag.get_text(strip=True)
                if text:
                    headings.append({"level": level, "text": text[:200]})
        return headings

    def _extract_links(self, soup: BeautifulSoup, base_url: str, base_domain: str) -> dict[str, Any]:
        internal: list[str] = []
        external: list[str] = []

        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if href.startswith(("#", "javascript:", "mailto:", "tel:", "data:")):
                continue
            absolute = urljoin(base_url, href)
            parsed = urlparse(absolute)
            if not parsed.netloc or parsed.scheme not in {"http", "https"}:
                continue
            clean = absolute.split("#")[0]
            domain = parsed.netloc.replace("www.", "")
            if domain == base_domain or domain.endswith(f".{base_domain}"):
                if clean not in internal:
                    internal.append(clean)
            else:
                if clean not in external:
                    external.append(clean)

        return {
            "internal": internal,
            "external": external,
            "counts": {
                "total": len(internal) + len(external),
                "internal": len(internal),
                "external": len(external),
            },
        }

    def _extract_forms(self, soup: BeautifulSoup) -> list[dict[str, Any]]:
        forms = []
        for form in soup.find_all("form"):
            fields = []
            for inp in form.find_all(["input", "textarea", "select"]):
                name = inp.get("name", "") or inp.get("id", "")
                type_ = inp.get("type", inp.name)
                fields.append({"name": name, "type": type_})
            action = form.get("action", "").strip() or "self"
            method = (form.get("method", "get") or "get").lower()
            text = form.get_text(" ", strip=True).lower()
            forms.append(
                {
                    "action": action,
                    "method": method,
                    "fields": fields,
                    "field_count": len(fields),
                    "looks_booking": any(k in text for k in ("book", "appointment", "schedule", "date", "time")),
                    "looks_contact": any(k in text for k in ("contact", "message", "send", "enquiry", "quote")),
                }
            )
        return forms

    def _extract_images(self, soup: BeautifulSoup, base_url: str, base_domain: str) -> dict[str, Any]:
        images = []
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if src:
                src = urljoin(base_url, src)
            else:
                src = ""
            filename = os.path.basename(urlparse(src).path) if src else ""
            images.append(
                {
                    "src": src,
                    "alt": img.get("alt", "").strip(),
                    "width": img.get("width"),
                    "height": img.get("height"),
                    "filename": filename,
                    "is_stock": self._is_stock_photo(filename, img.get("alt", "")),
                }
            )

        with_alt = sum(1 for i in images if i["alt"])
        total = len(images) or 1
        return {
            "items": images[:50],
            "count": len(images),
            "with_alt": with_alt,
            "alt_coverage": round(with_alt / total * 100, 1),
            "stock_photo_count": sum(1 for i in images if i["is_stock"]),
        }

    def _is_stock_photo(self, filename: str, alt: str) -> bool:
        stock_terms = ("stock", "shutterstock", "depositphotos", "getty", "istock", "placeholder", "dummy", "avatar")
        combined = (filename + " " + alt).lower()
        return any(term in combined for term in stock_terms)

    def _extract_structured_data(self, soup: BeautifulSoup) -> list[dict[str, Any]]:
        structured = []
        for script in soup.find_all("script", type="application/ld+json"):
            text = script.string
            if not text:
                continue
            try:
                data = json.loads(text)
                if isinstance(data, dict):
                    structured.append({"type": data.get("@type", "Unknown"), "data": data})
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict):
                            structured.append({"type": item.get("@type", "Unknown"), "data": item})
            except Exception:
                continue
        return structured

    def _check_broken_links(self, urls: list[str]) -> dict[str, Any]:
        broken: list[str] = []
        checked = 0

        def check_one(u: str) -> tuple[str, int | None]:
            try:
                r = self.session.head(u, timeout=self.link_check_timeout, allow_redirects=True)
                return u, r.status_code
            except Exception:
                try:
                    r = self.session.get(u, timeout=self.link_check_timeout, stream=True)
                    return u, r.status_code
                except Exception:
                    return u, None

        with ThreadPoolExecutor(max_workers=8) as executor:
            future_to_url = {executor.submit(check_one, u): u for u in urls}
            for future in as_completed(future_to_url):
                url, status = future.result()
                checked += 1
                if status is None or status >= 400:
                    broken.append(url)

        return {"checked": checked, "broken": broken, "broken_count": len(broken)}

    def _fetch_robots_txt(self, origin: str) -> dict[str, Any] | None:
        try:
            r = self.session.get(f"{origin}/robots.txt", timeout=10)
            text = r.text[:5000]
            rp = RobotFileParser()
            rp.parse(text.splitlines())
            disallows_root = not rp.can_fetch("*", "/")
            return {
                "status_code": r.status_code,
                "content": text,
                "disallows_root": disallows_root,
                "exists": r.status_code < 400,
            }
        except Exception:
            return None

    def _detect_sitemap(self, origin: str, robots_txt: dict | None) -> dict[str, Any]:
        sitemaps: list[str] = []
        if robots_txt and robots_txt.get("content"):
            for line in robots_txt["content"].splitlines():
                m = re.match(r"^\s*[Ss]itemap:\s*(.+)$", line)
                if m:
                    sitemaps.append(m.group(1).strip())

        candidates = [f"{origin}/sitemap.xml", f"{origin}/sitemap_index.xml"]
        for c in candidates:
            try:
                r = self.session.get(c, timeout=8)
                if r.status_code < 400 and "xml" in r.headers.get("Content-Type", ""):
                    sitemaps.append(c)
                    break
            except Exception:
                continue

        return {"referenced": bool(sitemaps), "urls": sitemaps[:5]}

    def _detect_mixed_content(self, html: str, final_url: str) -> list[str]:
        if not final_url.startswith("https://"):
            return []
        mixed = []
        for pattern in (r"src=[\"']http://", r"href=[\"']http://", r"url\([\"']?http://"):
            mixed.extend(re.findall(pattern, html))
        return list(set(mixed))[:20]

    def _security_headers(self, headers: requests.structures.CaseInsensitiveDict) -> dict[str, Any]:
        h = {k.lower(): v for k, v in headers.items()}
        return {
            "strict_transport_security": "strict-transport-security" in h,
            "content_security_policy": "content-security-policy" in h,
            "x_frame_options": "x-frame-options" in h,
            "x_content_type_options": "x-content-type-options" in h,
            "referrer_policy": "referrer-policy" in h,
            "permissions_policy": "permissions-policy" in h,
        }

    def _detect_technologies(
        self, soup: BeautifulSoup, response: requests.Response, html: str
    ) -> tuple[list[str], str | None]:
        haystack = html.lower()
        scripts = " ".join(s.get("src", "") for s in soup.find_all("script", src=True)).lower()
        combined = haystack + " " + scripts + " " + (response.headers.get("X-Powered-By", "")).lower()
        generator = (soup.find("meta", attrs={"name": "generator"}) or {}).get("content", "").lower()
        combined += " " + generator

        detected: set[str] = set()
        for name, patterns in TECH_PATTERNS.items():
            for pat in patterns:
                if re.search(pat, combined):
                    detected.add(name)
                    break

        cms = None
        for cand in CMS_FLEXIBLE:
            if cand in detected:
                cms = cand
                break

        return sorted(detected), cms

    def _http_version(self, response: requests.Response) -> str:
        try:
            version = response.raw.version
            if version == 20:
                return "HTTP/2"
            if version == 11:
                return "HTTP/1.1"
            return f"{version}"
        except Exception:
            return "unknown"

    def _capture_screenshots(self, url: str) -> dict[str, Any]:
        result: dict[str, Any] = {"desktop": None, "mobile": None}
        api_key = os.getenv("SCREENSHOT_API_KEY")

        if api_key:
            try:
                result["desktop"] = self._screenshotone(url, api_key, 1280, 900)
                result["mobile"] = self._screenshotone(url, api_key, 390, 844)
                return result
            except Exception as exc:
                logger.warning("ScreenshotOne failed: %s", exc)

        try:
            result["desktop"] = self._playwright_screenshot(url, 1280, 900)
            result["mobile"] = self._playwright_screenshot(url, 390, 844)
        except Exception as exc:
            logger.warning("Playwright screenshot failed: %s", exc)

        return result

    def _screenshotone(self, url: str, api_key: str, width: int, height: int) -> dict[str, Any] | None:
        try:
            r = requests.get(
                "https://api.screenshotone.com/take",
                params={
                    "access_key": api_key,
                    "url": url,
                    "viewport_width": width,
                    "viewport_height": height,
                    "full_page": "false",
                    "format": "png",
                    "block_ads": "true",
                    "block_cookie_banners": "true",
                    "block_banners_by_heuristics": "true",
                    "block_chats": "true",
                    "wait_until": "networkidle0",
                    "timeout": 30,
                    "delay": 2,
                },
                timeout=45,
            )
            if r.ok and "image" in r.headers.get("Content-Type", ""):
                return {"provider": "screenshotone", "width": width, "height": height, "bytes": len(r.content)}
            return None
        except Exception:
            return None

    def _playwright_screenshot(self, url: str, width: int, height: int) -> dict[str, Any] | None:
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            return None

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            try:
                page = browser.new_page(viewport={"width": width, "height": height})
                page.goto(url, wait_until="networkidle", timeout=30000)
                time.sleep(2)
                png = page.screenshot(type="png", full_page=False)
                return {"provider": "playwright", "width": width, "height": height, "bytes": len(png)}
            finally:
                browser.close()

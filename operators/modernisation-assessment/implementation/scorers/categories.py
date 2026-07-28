"""
Modernisation Assessment — Deterministic Category Scorers

Each scorer reads from the shared evidence object and returns:
  - score (0-100)
  - evidence (list of concrete observations)
  - why_it_matters (plain English)
  - recommended_improvement (plain English)

No AI is used inside these scorers. They are rule-based heuristics.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

STOCK_TERMS = ("stock", "shutterstock", "depositphotos", "getty", "istock", "placeholder", "dummy")

CMS_FLEXIBLE = {"wordpress", "squarespace", "wix", "shopify", "webflow", "framer", "drupal", "joomla"}
MODERN_FRAMEWORK = {"nextjs", "react", "vue", "svelte", "gatsby", "nuxt", "astro"}


@dataclass
class ScoreContext:
    evidence: dict[str, Any]

    # short accessors
    @property
    def url(self) -> str:
        return self.evidence.get("url", "")

    @property
    def domain(self) -> str:
        return self.evidence.get("domain", "")

    @property
    def text(self) -> str:
        return self.evidence.get("text", "").lower()

    @property
    def first_kb(self) -> str:
        """First ~2KB of visible page text (best proxy for above-the-fold copy)."""
        return self.evidence.get("text_head", "").lower()

    @property
    def first_html(self) -> str:
        """First ~4KB of raw HTML (contains tel:/mailto: links and nav markup)."""
        return self.evidence.get("html_head", "").lower()

    @property
    def title(self) -> str:
        return self.evidence.get("metadata", {}).get("title", "").lower()

    @property
    def description(self) -> str:
        return self.evidence.get("metadata", {}).get("description", "").lower()

    @property
    def headings(self) -> list[dict[str, Any]]:
        return self.evidence.get("headings", [])

    @property
    def h1s(self) -> list[str]:
        return [h["text"] for h in self.headings if h["level"] == 1]

    @property
    def all_heading_levels(self) -> list[int]:
        return [h["level"] for h in self.headings if 1 <= h["level"] <= 6]

    @property
    def links(self) -> dict[str, Any]:
        return self.evidence.get("links", {"internal": [], "external": [], "counts": {"total": 0, "internal": 0, "external": 0}})

    @property
    def forms(self) -> list[dict[str, Any]]:
        return self.evidence.get("forms", [])

    @property
    def images(self) -> dict[str, Any]:
        return self.evidence.get("images", {"count": 0, "with_alt": 0, "alt_coverage": 0, "stock_photo_count": 0, "items": []})

    @property
    def structured_data(self) -> list[dict[str, Any]]:
        return self.evidence.get("structured_data", [])

    @property
    def page_metrics(self) -> dict[str, Any]:
        return self.evidence.get("page_metrics", {})

    @property
    def security_headers(self) -> dict[str, Any]:
        return self.evidence.get("security_headers", {})

    @property
    def mixed_content(self) -> list[str]:
        return self.evidence.get("mixed_content", [])

    @property
    def broken_links(self) -> dict[str, Any]:
        return self.evidence.get("broken_links", {"checked": 0, "broken": [], "broken_count": 0})

    @property
    def robots_txt(self) -> dict[str, Any] | None:
        return self.evidence.get("robots_txt")

    @property
    def sitemap(self) -> dict[str, Any]:
        return self.evidence.get("sitemap", {})

    @property
    def technologies(self) -> list[str]:
        return self.evidence.get("technologies", [])

    @property
    def cms(self) -> str | None:
        return self.evidence.get("cms")

    def text_has(self, *keywords: str) -> bool:
        return any(kw in self.text or kw in self.first_kb for kw in keywords)


def _heading_hierarchy_ok(headings: list[dict[str, Any]]) -> bool:
    """Return True if heading levels never jump (e.g. h1 -> h3 without h2)."""
    levels = [h["level"] for h in headings if 1 <= h["level"] <= 6]
    if not levels:
        return False
    for prev, cur in zip(levels, levels[1:]):
        if cur > prev + 1:
            return False
    return True


def _heading_level_set(headings: list[dict[str, Any]]) -> set[int]:
    return {h["level"] for h in headings if 1 <= h["level"] <= 6}


class DiscoverabilityScorer:
    @staticmethod
    def score(ctx: ScoreContext) -> dict[str, Any]:
        points = 0
        evidence: list[str] = []

        # HTTPS
        if ctx.page_metrics.get("https"):
            points += 10
            evidence.append("Site loads over HTTPS.")
        else:
            evidence.append("Site does not use HTTPS — search engines flag this.")

        # Title
        title = ctx.evidence.get("metadata", {}).get("title", "")
        tlen = len(title)
        if 10 <= tlen <= 70:
            points += 10
            evidence.append(f"Page title is present and a good length ({tlen} chars).")
        elif tlen:
            points += 5
            evidence.append(f"Page title exists but is {tlen} chars long — suboptimal for search results.")
        else:
            evidence.append("No page title found.")

        # Meta description
        desc = ctx.evidence.get("metadata", {}).get("description", "")
        dlen = len(desc)
        if 50 <= dlen <= 160:
            points += 10
            evidence.append(f"Meta description is present and a good length ({dlen} chars).")
        elif dlen:
            points += 5
            evidence.append(f"Meta description exists but is {dlen} chars long.")
        else:
            evidence.append("No meta description found.")

        # H1 uniqueness
        h1_count = len(ctx.h1s)
        if h1_count == 1:
            points += 10
            evidence.append("Exactly one H1 heading — good structure.")
        elif h1_count > 1:
            points += 5
            evidence.append(f"Multiple H1 headings found ({h1_count}), which dilutes page focus.")
        else:
            evidence.append("No H1 heading found.")

        # Heading hierarchy
        if _heading_hierarchy_ok(ctx.headings):
            points += 10
            evidence.append("Heading hierarchy is logical (no skipped levels).")
        else:
            evidence.append("Heading hierarchy is broken — skipped levels make content hard to parse.")

        # Internal links
        internal_count = ctx.links.get("counts", {}).get("internal", 0)
        if internal_count >= 5:
            points += 10
            evidence.append(f"{internal_count} internal links help search engines crawl the site.")
        elif internal_count >= 3:
            points += 5
            evidence.append(f"Only {internal_count} internal links — thin site structure.")
        else:
            evidence.append("Very few internal links — search crawlers cannot discover other pages.")

        # Alt text coverage
        alt_coverage = ctx.images.get("alt_coverage", 0)
        if alt_coverage >= 80:
            points += 10
            evidence.append(f"{alt_coverage}% of images have alt text.")
        elif alt_coverage >= 50:
            points += 5
            evidence.append(f"Only {alt_coverage}% of images have alt text.")
        else:
            evidence.append("Most images lack alt text — missing accessibility and image-search signal.")

        # Structured data
        if ctx.structured_data:
            types = [s["type"] for s in ctx.structured_data]
            points += 10
            evidence.append(f"Structured data found: {', '.join(types[:5])}.")
        else:
            evidence.append("No JSON-LD structured data found.")

        # Canonical
        canonical = ctx.evidence.get("metadata", {}).get("canonical", "")
        if canonical:
            points += 5
            evidence.append("Canonical URL is set.")
        else:
            evidence.append("No canonical URL set — risk of duplicate content issues.")

        # Robots allowed
        robots_meta = ctx.evidence.get("metadata", {}).get("robots_meta", "")
        robots_disallow = bool(ctx.robots_txt and ctx.robots_txt.get("disallows_root"))
        if "noindex" not in robots_meta and not robots_disallow:
            points += 5
            evidence.append("Search indexing is not blocked by robots meta or robots.txt.")
        else:
            evidence.append("Search indexing may be blocked by robots meta or robots.txt.")

        # Sitemap
        if ctx.sitemap.get("referenced"):
            points += 5
            evidence.append("Sitemap referenced or discovered.")
        else:
            evidence.append("No sitemap reference found.")

        # Lang
        lang = ctx.evidence.get("metadata", {}).get("lang", "")
        if lang:
            points += 5
            evidence.append(f"HTML lang attribute is set ({lang}).")
        else:
            evidence.append("HTML lang attribute missing.")

        # Viewport (also counted in CX, but relevant for mobile-first indexing)
        viewport = ctx.evidence.get("metadata", {}).get("viewport", "")
        if viewport:
            points += 5
            evidence.append("Viewport meta tag is present.")
        else:
            evidence.append("No viewport meta tag — Google uses mobile-first indexing.")

        return {
            "score": min(100, points),
            "evidence": evidence,
            "why_it_matters": (
                "Search engines and AI assistants rely on clear metadata, headings, and structured data "
                "to understand what the business does. Poor discoverability means fewer enquiries."
            ),
            "recommended_improvement": (
                "Add a unique title and meta description, use a single H1, fix heading hierarchy, "
                "add alt text to images, and implement relevant JSON-LD schema."
            ),
        }


class InfrastructureScorer:
    @staticmethod
    def score(ctx: ScoreContext) -> dict[str, Any]:
        points = 0
        evidence: list[str] = []

        # HTTPS
        if ctx.page_metrics.get("https"):
            points += 15
            evidence.append("Site is served over HTTPS.")
        else:
            evidence.append("Site is not served over HTTPS.")

        # Mixed content
        if not ctx.mixed_content:
            points += 10
            evidence.append("No mixed-content references on HTTPS page.")
        else:
            evidence.append(f"{len(ctx.mixed_content)} mixed-content references detected.")

        # Security headers
        sec = ctx.security_headers
        for header, weight in [
            ("strict_transport_security", 8),
            ("content_security_policy", 7),
            ("x_frame_options", 4),
            ("x_content_type_options", 4),
            ("referrer_policy", 4),
        ]:
            if sec.get(header):
                points += weight
                evidence.append(f"{header.replace('_', '-').title()} header present.")
            else:
                evidence.append(f"{header.replace('_', '-').title()} header missing.")

        # Response time
        rt = ctx.page_metrics.get("response_time_seconds", 99)
        if rt < 1.0:
            points += 12
            evidence.append(f"Server responds quickly ({rt:.2f}s).")
        elif rt < 2.5:
            points += 8
            evidence.append(f"Server response is acceptable ({rt:.2f}s).")
        elif rt < 4.0:
            points += 4
            evidence.append(f"Server response is slow ({rt:.2f}s).")
        else:
            evidence.append(f"Server response is very slow ({rt:.2f}s).")

        # Page size
        size_kb = ctx.page_metrics.get("content_size_kb", 0)
        if size_kb < 500:
            points += 8
            evidence.append(f"Page is lightweight ({size_kb} KB).")
        elif size_kb < 1000:
            points += 5
            evidence.append(f"Page size is reasonable ({size_kb} KB).")
        elif size_kb < 2000:
            points += 2
            evidence.append(f"Page is heavy ({size_kb} KB).")
        else:
            evidence.append(f"Page is very heavy ({size_kb} KB).")

        # Broken links
        broken = ctx.broken_links.get("broken_count", 0)
        checked = ctx.broken_links.get("checked", 0)
        if broken == 0 and checked > 0:
            points += 12
            evidence.append(f"No broken internal links detected ({checked} checked).")
        elif broken <= 2:
            points += 8
            evidence.append(f"{broken} broken internal links found.")
        elif broken <= 5:
            points += 4
            evidence.append(f"{broken} broken internal links found.")
        else:
            evidence.append(f"{broken} broken internal links found.")

        # HTTP/2 (many standard HTTP clients still negotiate HTTP/1.1, so HTTP/1.1 is acceptable)
        http_version = ctx.page_metrics.get("http_version", "")
        if http_version == "HTTP/2":
            points += 6
            evidence.append("HTTP/2 enabled.")
        elif http_version == "HTTP/1.1":
            points += 3
            evidence.append("HTTP/1.1 — acceptable but not optimal.")
        else:
            evidence.append("HTTP version could not be detected.")

        # Compression
        if ctx.page_metrics.get("compression"):
            points += 5
            evidence.append("Response uses compression (gzip/brotli).")
        else:
            evidence.append("Response is not compressed.")

        # Viewport
        viewport = ctx.evidence.get("metadata", {}).get("viewport", "")
        if viewport:
            points += 5
            evidence.append("Viewport meta tag present.")
        else:
            evidence.append("Viewport meta tag missing.")

        return {
            "score": min(100, points),
            "evidence": evidence,
            "why_it_matters": (
                "A slow, insecure, or broken site loses visitors before they convert. "
                "Infrastructure directly affects trust, mobile performance, and search ranking."
            ),
            "recommended_improvement": (
                "Move to HTTPS, fix mixed content, add security headers, compress assets, "
                "reduce page weight, and repair broken links."
            ),
        }


class TrustBrandScorer:
    @staticmethod
    def score(ctx: ScoreContext) -> dict[str, Any]:
        points = 0
        evidence: list[str] = []

        # Business name / brand consistency
        domain_root = ctx.domain.split(".")[0] if ctx.domain else ""
        title_has_brand = domain_root and domain_root in ctx.title
        h1_has_brand = any(domain_root in h.lower() for h in ctx.h1s) if domain_root else False
        if title_has_brand and h1_has_brand:
            points += 10
            evidence.append("Domain name appears in both page title and H1 — strong brand signal.")
        elif title_has_brand or h1_has_brand:
            points += 5
            evidence.append("Domain name appears in title or H1, but not both.")
        else:
            evidence.append("Business name is not clearly tied to the title or main heading.")

        # Contact information
        has_tel_link = bool(re.search(r'href=["\']?tel:', ctx.first_html))
        has_mailto = bool(re.search(r'href=["\']?mailto:', ctx.first_html))
        has_phone_text = bool(re.search(r"\b0\d[\s\d]{7,11}\b|\+\d[\s\d]{8,15}", ctx.text))
        has_email_text = bool(re.search(r"[\w.-]+@[\w.-]+\.[A-Za-z]{2,}", ctx.text))
        has_postcode = bool(re.search(r"[A-Z]{1,2}\d[A-Z\d]?\s?\d[ABD-HJLNP-UW-Z]{2}", ctx.text, re.I))
        has_street = any(k in ctx.text for k in (" street", " road", " avenue", " lane", " drive"))
        contact_score = sum([has_tel_link, has_mailto, has_phone_text, has_email_text, has_postcode or has_street])
        if contact_score >= 4:
            points += 15
            evidence.append("Phone, email and address signals are easy to find.")
        elif contact_score >= 2:
            points += 10
            evidence.append("Some contact details are present, but not all are obvious.")
        elif contact_score >= 1:
            points += 5
            evidence.append("Contact details are hard to find.")
        else:
            evidence.append("No clear contact details found on the page.")

        # Social proof
        social_domains = ("facebook.com", "instagram.com", "twitter.com", "x.com", "linkedin.com", "youtube.com", "tiktok.com")
        social_links = [u for u in ctx.links.get("external", []) if any(d in u for d in social_domains)]
        has_review_schema = any(s["type"] in ("Review", "AggregateRating") for s in ctx.structured_data)
        review_keywords = any(k in ctx.text for k in ("testimonial", "review", "what our", "5 star", "rated", "customers say"))
        if social_links:
            evidence.append(f"Social profile links found ({len(social_links)}).")
        if has_review_schema:
            evidence.append("Review or rating schema markup found.")
        if review_keywords:
            evidence.append("Review or testimonial language found on page.")
        if social_links or has_review_schema or review_keywords:
            points += 15
        else:
            evidence.append("No social proof or testimonials visible.")

        # Real photos
        img_count = ctx.images.get("count", 0)
        stock_count = ctx.images.get("stock_photo_count", 0)
        real_count = img_count - stock_count
        if img_count == 0:
            evidence.append("No images on the page.")
        elif real_count >= 2:
            points += 10
            evidence.append(f"Looks like {real_count} real business images are used.")
        elif real_count >= 1:
            points += 5
            evidence.append("Some real images, but several look like stock or placeholder photos.")
        else:
            evidence.append("Images appear to be stock or placeholder photos.")

        # Awards / accreditations
        award_terms = ("award", "accredited", "certified", "member of", "qualified", "registered", "approved")
        if any(t in ctx.text for t in award_terms):
            points += 10
            evidence.append("Awards, accreditation or membership language found.")
        else:
            evidence.append("No awards or accreditations mentioned.")

        # Contact page
        internal = ctx.links.get("internal", [])
        contact_link = any(re.search(r"contact|get[- ]?in[- ]?touch", u, re.I) for u in internal)
        if contact_link or ctx.forms:
            points += 10
            evidence.append("A contact page or contact form is present.")
        else:
            evidence.append("No dedicated contact page or contact form found.")

        # About / team page
        about_team = any(re.search(r"about|team|staff|meet", u, re.I) for u in internal)
        if about_team:
            points += 10
            evidence.append("About or team page is linked.")
        else:
            evidence.append("No about or team page linked.")

        # Established / years
        if re.search(r"\b(19|20)\d{2}\b", ctx.text) or any(k in ctx.text for k in ("established", "years experience", "since")):
            points += 10
            evidence.append("Business history or experience is mentioned.")
        else:
            evidence.append("No business history or experience mentioned.")

        # Brand consistency (domain in title)
        if domain_root and domain_root in ctx.title:
            points += 5
            evidence.append("Domain/brand name appears in the page title.")
        else:
            evidence.append("Brand name does not appear in the page title.")

        return {
            "score": min(100, points),
            "evidence": evidence,
            "why_it_matters": (
                "Trust is the difference between a visitor choosing you or a competitor. "
                "Photos, contact details, reviews, and history all reduce perceived risk."
            ),
            "recommended_improvement": (
                "Add a real team photo, make the phone number and address immediately visible, "
                "surface reviews or testimonials, and add an about page with business history."
            ),
        }


class CustomerExperienceScorer:
    @staticmethod
    def score(ctx: ScoreContext) -> dict[str, Any]:
        points = 0
        evidence: list[str] = []

        first = ctx.first_kb
        text = ctx.text

        # Primary CTA above the fold
        cta_terms = (
            "book", "quote", "contact", "call", "enquire", "appointment",
            "schedule", "get in touch", "request", "free", "join", "sign up",
        )
        has_cta = any(k in first for k in cta_terms)
        if has_cta:
            points += 20
            evidence.append("A clear primary call-to-action is visible near the top of the page.")
        else:
            evidence.append("No clear call-to-action is visible near the top of the page.")

        # Clickable phone
        if re.search(r'href=["\']?tel:', ctx.first_html):
            points += 10
            evidence.append("Phone number is clickable (tel: link).")
        else:
            evidence.append("No clickable phone number found in the header/hero area.")

        # Clickable email
        if re.search(r'href=["\']?mailto:', ctx.first_html):
            points += 5
            evidence.append("Email address is clickable (mailto: link).")
        else:
            evidence.append("No clickable email link found in the header/hero area.")

        # Navigation size
        total_links = ctx.links.get("counts", {}).get("total", 0)
        if 3 <= total_links <= 10:
            points += 10
            evidence.append(f"Navigation has {total_links} links — focused.")
        elif total_links > 10:
            points += 5
            evidence.append(f"Navigation has {total_links} links — may overwhelm visitors.")
        else:
            evidence.append("Very few navigation links found.")

        # Booking / quote / contact form
        form_types = [f.get("looks_booking", False) or f.get("looks_contact", False) for f in ctx.forms]
        booking_form = any(form_types)
        if booking_form:
            points += 15
            evidence.append("A booking, quote or contact form is present.")
        else:
            evidence.append("No booking, quote or contact form found.")

        # Mobile viewport
        viewport = ctx.evidence.get("metadata", {}).get("viewport", "")
        if viewport:
            points += 10
            evidence.append("Viewport meta tag present for mobile rendering.")
        else:
            evidence.append("No viewport meta tag — likely broken on mobile.")

        # Page speed
        rt = ctx.page_metrics.get("response_time_seconds", 99)
        if rt < 2.0:
            points += 10
            evidence.append(f"Page loads quickly ({rt:.2f}s).")
        elif rt < 4.0:
            points += 6
            evidence.append(f"Page load is moderate ({rt:.2f}s).")
        elif rt < 6.0:
            points += 3
            evidence.append(f"Page load is slow ({rt:.2f}s).")
        else:
            evidence.append(f"Page load is very slow ({rt:.2f}s).")

        # Heading hierarchy
        levels = _heading_level_set(ctx.headings)
        if 1 in levels and 2 in levels and _heading_hierarchy_ok(ctx.headings):
            points += 10
            evidence.append("Clear H1 and H2 structure guides visitors through the page.")
        elif 1 in levels:
            points += 5
            evidence.append("H1 is present but heading structure is weak.")
        else:
            evidence.append("No clear heading structure to guide visitors.")

        # Key information
        key_terms = ("opening hours", "open", "hours", "price", "prices", "pricing", "rates", "from £", "services", "treatments", "classes", "menu")
        if any(k in text for k in key_terms):
            points += 5
            evidence.append("Key practical information (hours, prices or services) is mentioned.")
        else:
            evidence.append("No opening hours, prices or services information found.")

        # Journey links (service / about / contact)
        internal = " ".join(ctx.links.get("internal", [])).lower()
        if any(k in internal for k in ("service", "about", "contact", "book", "quote")):
            points += 5
            evidence.append("Internal links support a visitor journey (services, about, contact).")
        else:
            evidence.append("Internal links do not clearly guide a visitor journey.")

        return {
            "score": min(100, points),
            "evidence": evidence,
            "why_it_matters": (
                "A visitor should know what to do within seconds. Confusing navigation or buried "
                "contact details directly cost enquiries and bookings."
            ),
            "recommended_improvement": (
                "Place a clear call-to-action above the fold, make the phone number clickable, "
                "add a short booking or contact form, and keep navigation focused on the next step."
            ),
        }


class ModernisationScorer:
    @staticmethod
    def score(ctx: ScoreContext) -> dict[str, Any]:
        points = 0
        evidence: list[str] = []

        techs = set(ctx.technologies)

        # Analytics
        analytics = {"google_analytics", "google_tag_manager", "facebook_pixel", "hotjar", "clarity", "plausible", "mixpanel", "amplitude"}
        found = techs & analytics
        if found:
            points += 15
            evidence.append(f"Analytics/tracking tools detected: {', '.join(sorted(found))}.")
        else:
            evidence.append("No analytics or conversion tracking detected.")

        # CRM / booking
        crm_booking = {"calendly", "cal_com", "fresha", "acuity", "hubspot", "mailchimp", "zoho", "salesforce"}
        found = techs & crm_booking
        if found:
            points += 15
            evidence.append(f"CRM or booking integration detected: {', '.join(sorted(found))}.")
        else:
            evidence.append("No CRM or online booking integration detected.")

        # CMS / modern framework
        cms_framework = CMS_FLEXIBLE | MODERN_FRAMEWORK
        found = techs & cms_framework
        if found:
            points += 10
            evidence.append(f"CMS or modern framework detected: {', '.join(sorted(found))}.")
        else:
            evidence.append("No recognisable CMS or modern framework detected — likely hard to edit.")

        # AI readiness
        schema_ok = bool(ctx.structured_data)
        semantic_ok = 1 in _heading_level_set(ctx.headings) and 2 in _heading_level_set(ctx.headings)
        robots_ok = not (ctx.robots_txt and ctx.robots_txt.get("disallows_root")) and "noindex" not in ctx.evidence.get("metadata", {}).get("robots_meta", "")
        ai_points = 0
        if schema_ok:
            ai_points += 5
            evidence.append("Structured data helps AI systems understand the business.")
        else:
            evidence.append("No structured data to feed AI search and assistants.")
        if semantic_ok:
            ai_points += 5
            evidence.append("Semantic heading structure supports AI readability.")
        else:
            evidence.append("Weak semantic structure limits AI readability.")
        if robots_ok:
            ai_points += 5
            evidence.append("Search and AI crawlers are allowed to index the site.")
        else:
            evidence.append("Crawling may be restricted for search or AI systems.")
        points += ai_points

        # Integration readiness
        has_forms = bool(ctx.forms)
        integration_tech = {"zapier", "make", "hubspot", "zoho"}
        if has_forms:
            evidence.append("Forms are present and can be wired to automation.")
        if techs & integration_tech:
            evidence.append("Automation/integration tools detected.")
        if has_forms or (techs & integration_tech):
            points += 10
        else:
            evidence.append("No obvious integration points for automation.")

        # Review automation
        review_tech = techs & {"google_reviews", "trustpilot"}
        has_review_links = any(d in " ".join(ctx.links.get("external", [])) for d in ("google.com/maps", "trustpilot"))
        if review_tech or has_review_links:
            points += 10
            evidence.append("Review platform links or tools present — review automation is possible.")
        else:
            evidence.append("No review platform integration or links found.")

        # Platform maturity
        status = ctx.page_metrics.get("status_code", 0)
        under_construction = any(k in ctx.text for k in ("coming soon", "under construction", "site under"))
        placeholder = ("lorem ipsum" in ctx.text) or ("placeholder" in ctx.text)
        if status == 200 and not under_construction and not placeholder:
            points += 15
            evidence.append("Site is live, complete and not under construction.")
        else:
            evidence.append("Site may be incomplete, under construction or returning errors.")

        # Modern frontend framework
        if techs & MODERN_FRAMEWORK:
            points += 10
            evidence.append(f"Modern frontend framework detected: {', '.join(sorted(techs & MODERN_FRAMEWORK))}.")
        else:
            evidence.append("No modern frontend framework detected.")

        return {
            "score": min(100, points),
            "evidence": evidence,
            "why_it_matters": (
                "Modern marketing depends on measurement, automation and integrations. "
                "A rigid platform limits every improvement made after launch."
            ),
            "recommended_improvement": (
                "Add analytics, connect a CRM or booking tool, implement review automation, "
                "and move to an editable, modern platform that supports future integrations."
            ),
        }

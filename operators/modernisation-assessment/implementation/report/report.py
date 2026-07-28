"""
Modernisation Assessment — Report Builder

Combines evidence and category scores into the final report.
AI is only used here as the narrator, after all deterministic scoring is complete.
"""

from __future__ import annotations

import json
import logging
import os
import re
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any

from scorers.categories import (
    CustomerExperienceScorer,
    DiscoverabilityScorer,
    InfrastructureScorer,
    ModernisationScorer,
    ScoreContext,
    TrustBrandScorer,
)

logger = logging.getLogger("modernisation-assessment.report")

CATEGORY_KEYS = [
    "discoverability",
    "infrastructure",
    "trust_and_brand",
    "customer_experience",
    "modernisation",
]

CATEGORY_LABELS = {
    "discoverability": "Discoverability",
    "infrastructure": "Infrastructure",
    "trust_and_brand": "Trust & Brand",
    "customer_experience": "Customer Experience",
    "modernisation": "Modernisation",
}

PROBLEM_STATEMENTS = {
    "discoverability": "Search engines and AI assistants struggle to understand and surface the business.",
    "infrastructure": "Slow, insecure or broken pages create friction and cause visitors to leave.",
    "trust_and_brand": "The business appears less credible than modern competitors.",
    "customer_experience": "Customers take longer to understand what to do and how to get in touch.",
    "modernisation": "The current platform restricts analytics, booking, review automation and future improvements.",
}

SOLUTION_STATEMENTS = {
    "discoverability": "Clear metadata, headings and structured data make the business easier to find.",
    "infrastructure": "Fast, secure hosting and clean code keep visitors engaged.",
    "trust_and_brand": "Professional design, real photos and visible reviews build trust.",
    "customer_experience": "Obvious calls-to-action, focused navigation and simple forms convert visitors.",
    "modernisation": "A modern, editable platform supports analytics, CRM, booking and review automation.",
}


class ReportBuilder:
    def __init__(
        self,
        business_name: str = "Unknown",
        category: str = "local business",
        location: str = "UK",
        use_ai_narration: bool = False,
    ):
        self.business_name = business_name
        self.category = category
        self.location = location
        self.use_ai_narration = use_ai_narration
        self.narrator = Narrator(use_ai=use_ai_narration)

    def build(self, evidence: dict[str, Any]) -> dict[str, Any]:
        ctx = ScoreContext(evidence)

        categories = {
            "discoverability": DiscoverabilityScorer.score(ctx),
            "infrastructure": InfrastructureScorer.score(ctx),
            "trust_and_brand": TrustBrandScorer.score(ctx),
            "customer_experience": CustomerExperienceScorer.score(ctx),
            "modernisation": ModernisationScorer.score(ctx),
        }

        overall = round(sum(c["score"] for c in categories.values()) / len(categories))

        why_solves = self._why_new_website_solves_this(categories)
        redesign_brief = self._redesign_brief(categories)
        mockup_prompt = self._mockup_prompt(categories, evidence.get("url", ""))

        base_report = {
            "url": evidence.get("url", ""),
            "business_name": self.business_name,
            "category": self.category,
            "location": self.location,
            "operator": "modernisation-assessment",
            "operator_version": "1.0.0",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "business_modernisation_score": overall,
            "categories": categories,
            "why_a_new_website_solves_this": why_solves,
            "redesign_brief": redesign_brief,
            "mockup_prompt": mockup_prompt,
        }

        # AI / deterministic narration is added on top of the scored evidence.
        narration = self.narrator.narrate(base_report, evidence)
        base_report.update(narration)

        # Keep the raw evidence for traceability but omit large blobs from the report output.
        base_report["evidence_summary"] = {
            "domain": evidence.get("domain"),
            "page_metrics": evidence.get("page_metrics"),
            "technologies": evidence.get("technologies"),
            "cms": evidence.get("cms"),
            "links_count": evidence.get("links", {}).get("counts"),
            "images_count": evidence.get("images", {}).get("count"),
            "forms_count": len(evidence.get("forms", [])),
            "structured_data_types": [s["type"] for s in evidence.get("structured_data", [])],
            "broken_links_count": evidence.get("broken_links", {}).get("broken_count"),
        }

        return base_report

    def _why_new_website_solves_this(self, categories: dict[str, Any]) -> dict[str, Any]:
        problems = []
        solutions = []
        for key in CATEGORY_KEYS:
            score = categories[key]["score"]
            if score < 65:
                problems.append(PROBLEM_STATEMENTS[key])
                solutions.append(SOLUTION_STATEMENTS[key])

        if not problems:
            problems = ["The site is reasonably solid, but a modern build would still improve polish, speed and future flexibility."]
            solutions = ["A new website sharpens every signal above and future-proofs the platform."]

        return {
            "headline": "Your current website is limiting your business because:",
            "problems": problems,
            "closing": "A modern website addresses these issues by improving:",
            "solutions": solutions,
        }

    def _redesign_brief(self, categories: dict[str, Any]) -> dict[str, Any]:
        weakest = min(categories, key=lambda k: categories[k]["score"])
        weakest_label = CATEGORY_LABELS[weakest]

        # Infer primary CTA from lowest CX score evidence if possible.
        cx_evidence = " ".join(categories["customer_experience"]["evidence"]).lower()
        if "book" in cx_evidence or "appointment" in cx_evidence:
            primary_cta = "Book an appointment"
        elif "quote" in cx_evidence:
            primary_cta = "Request a quote"
        elif "call" in cx_evidence or "phone" in cx_evidence:
            primary_cta = "Call now"
        else:
            primary_cta = "Get in touch"

        return {
            "target_audience": f"Local customers searching for a {self.category} in {self.location}.",
            "primary_cta": primary_cta,
            "biggest_gap": f"{weakest_label} is the weakest area and should lead the redesign.",
            "sections_to_prioritise": ["Hero with clear CTA", "Trust bar", "Services", "Why us", "About", "Reviews", "Contact"],
            "tone": "Obvious. Useful. Trustworthy. Frictionless. Local. Human. Competent. Polished.",
        }

    def _mockup_prompt(self, categories: dict[str, Any], url: str) -> str:
        weak = [CATEGORY_LABELS[k] for k in CATEGORY_KEYS if categories[k]["score"] < 60]
        weak_str = ", ".join(weak) if weak else "overall polish and conversion"
        return (
            f"A modern, trust-led landing page for {self.business_name}, a {self.category} in {self.location}. "
            f"The design should solve weaknesses in {weak_str}. "
            "Use clean typography, generous whitespace, real photography where possible, "
            "and one obvious primary call-to-action above the fold. "
            "Style: obvious, useful, trustworthy, frictionless, local, human, competent, polished. "
            "No generic three-card feature rows or AI gradient backgrounds."
        )


class Narrator:
    def __init__(self, use_ai: bool = False):
        self.use_ai = use_ai
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")

    def narrate(self, report: dict[str, Any], evidence: dict[str, Any]) -> dict[str, Any]:
        if not self.use_ai:
            return self._fallback_narrate(report, evidence)
        if self.openai_key:
            try:
                return self._openai_narrate(report, evidence)
            except Exception as exc:
                logger.warning("OpenAI narration failed, using fallback: %s", exc)
        if self.anthropic_key:
            try:
                return self._anthropic_narrate(report, evidence)
            except Exception as exc:
                logger.warning("Anthropic narration failed, using fallback: %s", exc)
        return self._fallback_narrate(report, evidence)

    def _fallback_narrate(self, report: dict[str, Any], evidence: dict[str, Any]) -> dict[str, Any]:
        overall = report["business_modernisation_score"]
        if overall >= 70:
            verdict = "The website is reasonably modern but has room to sharpen conversion and future-proof the platform."
        elif overall >= 45:
            verdict = "The website is holding the business back in several visible ways and would benefit from a redesign."
        else:
            verdict = "The website is significantly behind current standards and is likely costing the business enquiries."

        # Build prioritized recommendations from weakest categories first.
        ordered = sorted(report["categories"].items(), key=lambda kv: kv[1]["score"])
        recommendations = []
        for key, cat in ordered:
            if cat["score"] < 70:
                recommendations.append(f"{CATEGORY_LABELS[key]} ({cat['score']}/100): {cat['recommended_improvement']}")

        summary = (
            f"{self._business_pronoun(report)} scored {overall}/100. {verdict} "
            f"The weakest area is {CATEGORY_LABELS[ordered[0][0]]} ({ordered[0][1]['score']}/100)."
        )

        return {
            "executive_summary": summary,
            "business_interpretation": verdict,
            "prioritised_recommendations": recommendations or ["Keep iterating on conversion and platform flexibility."],
        }

    def _business_pronoun(self, report: dict[str, Any]) -> str:
        name = report.get("business_name", "This business")
        return name

    def _openai_narrate(self, report: dict[str, Any], evidence: dict[str, Any]) -> dict[str, Any]:
        prompt = self._build_prompt(report, evidence)
        payload = {
            "model": "gpt-4o-mini",
            "max_tokens": 1200,
            "temperature": 0.4,
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a plain-speaking website advisor for Sorted, a UK web design company. "
                        "You have already received a deterministic assessment of a business website. "
                        "Do not perform new inspection. Write in plain English, second person, advisory tone. "
                        "Never use jargon, em-dashes, or words like elevate, seamless, transform, next-gen, cutting-edge. "
                        "Return only a JSON object with keys: executive_summary, business_interpretation, prioritised_recommendations."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
        }
        result = self._call_openai(payload)
        content = result["choices"][0]["message"]["content"].strip()
        # Defensive parse
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            parsed = self._extract_json(content)
        return {
            "executive_summary": parsed.get("executive_summary", "") or self._fallback_narrate(report, evidence)["executive_summary"],
            "business_interpretation": parsed.get("business_interpretation", "") or self._fallback_narrate(report, evidence)["business_interpretation"],
            "prioritised_recommendations": parsed.get("prioritised_recommendations", []) or self._fallback_narrate(report, evidence)["prioritised_recommendations"],
        }

    def _anthropic_narrate(self, report: dict[str, Any], evidence: dict[str, Any]) -> dict[str, Any]:
        prompt = self._build_prompt(report, evidence)
        payload = {
            "model": "claude-3-5-haiku-20241022",
            "max_tokens": 1200,
            "system": (
                "You are a plain-speaking website advisor for Sorted, a UK web design company. "
                "Write in plain English, second person, advisory tone. No jargon. "
                "Return only a JSON object with keys: executive_summary, business_interpretation, prioritised_recommendations."
            ),
            "messages": [{"role": "user", "content": prompt}],
        }
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.anthropic_key,
            "anthropic-version": "2023-06-01",
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request("https://api.anthropic.com/v1/messages", data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = json.loads(resp.read())
            content = raw["content"][0]["text"]
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            parsed = self._extract_json(content)
        return {
            "executive_summary": parsed.get("executive_summary", ""),
            "business_interpretation": parsed.get("business_interpretation", ""),
            "prioritised_recommendations": parsed.get("prioritised_recommendations", []),
        }

    def _build_prompt(self, report: dict[str, Any], evidence: dict[str, Any]) -> str:
        lines = [
            f"Business: {report['business_name']} ({report['category']} in {report['location']})",
            f"Website: {report['url']}",
            f"Business Modernisation Score: {report['business_modernisation_score']}/100",
        ]
        for key in CATEGORY_KEYS:
            cat = report["categories"][key]
            lines.append(f"\n{CATEGORY_LABELS[key]}: {cat['score']}/100")
            for e in cat["evidence"][:6]:
                lines.append(f"  - {e}")
        lines.append("\nWrite:")
        lines.append("1. executive_summary: 2-3 sentences summarising the score and weakest area for the business owner.")
        lines.append("2. business_interpretation: 2-3 sentences explaining what the score means commercially.")
        lines.append("3. prioritised_recommendations: an ordered list of 3-5 specific, plain-English actions.")
        return "\n".join(lines)

    def _call_openai(self, payload: dict[str, Any]) -> dict[str, Any]:
        data = json.dumps(payload).encode("utf-8")
        headers = {"Content-Type": "application/json", "Authorization": f"Bearer {self.openai_key}"}
        for attempt in range(2):
            req = urllib.request.Request("https://api.openai.com/v1/chat/completions", data=data, headers=headers, method="POST")
            try:
                with urllib.request.urlopen(req, timeout=60) as resp:
                    return json.loads(resp.read())
            except urllib.error.HTTPError as exc:
                body = exc.read().decode("utf-8", errors="replace")
                if exc.code == 429 and attempt == 0:
                    time.sleep(10)
                    continue
                raise RuntimeError(f"OpenAI: HTTP {exc.code} — {body[:300]}") from exc
        raise RuntimeError("OpenAI narration failed after retry.")

    def _extract_json(self, text: str) -> dict[str, Any]:
        # Strip markdown fences and grab the first {} object.
        text = re.sub(r"^```.*\n?|```$", "", text, flags=re.MULTILINE).strip()
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        return {}



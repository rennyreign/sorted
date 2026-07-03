#!/usr/bin/env python3
"""
Batch-analyse Sorted mockups using OpenAI gpt-4o-mini vision.

Extracts design patterns from each mockup image and writes a JSON report
that can be used to build the composition skill library.
"""

import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
MODEL = "gpt-4o-mini"
MAX_TOKENS = 1200

SYSTEM_PROMPT = """You are a design systems analyst. You analyse website mockup images and extract the design patterns that can be reused as templates.

Return only valid JSON. No markdown fences. No explanations outside the JSON."""

USER_PROMPT = """Analyse this website mockup image and extract the design composition pattern.

Return a JSON object with these fields:

{
  "business_name": "the business name if visible, else null",
  "business_class": "trade | local_service | fitness | beauty | food | hospitality | professional_service | ecommerce | trust_led | booking_led | other",
  "primary_conversion": "call_now | book_intro | request_quote | visit_shop | order_online | join_class | WhatsApp | other",
  "section_order": ["list of sections in order, e.g. nav, hero, trust_bar, services, process, about, testimonials, cta, footer"],
  "hero_archetype": "hero_split | hero_centered | hero_utility | hero_full_bleed",
  "services_archetype": "service_cards_icon | service_cards_image | feature_list | image_grid | none",
  "trust_archetype": "trust_bar | logo_strip | why_us | testimonial_quote | none",
  "testimonials_archetype": "testimonial_cards | testimonial_quote | none",
  "contact_archetype": "contact_panel | cta_band | cta_split | none",
  "palette": {
    "background": "dominant background colour (hex or named)",
    "background_dark": "dark section colour if used (hex or named)",
    "text": "primary text colour",
    "accent": "CTA/accent colour",
    "style": "light | dark | mixed | warm | premium"
  },
  "typography": {
    "mood": "bold | editorial | clean | premium | playful | minimal",
    "headline_style": "large display | medium | centred | left-aligned"
  },
  "trust_signals": ["list of visible trust signals: e.g. 24/7, reviews, certifications, years_experience, local_coverage, fair_pricing"],
  "cta_hierarchy": {
    "primary": "label of the main CTA button",
    "secondary": "label of any secondary CTA"
  },
  "image_style": "photography | illustration | icons_only | mixed",
  "unique_features": ["anything distinctive worth noting"]
}

Be concise. Use exact labels. If something is not visible, use null or none."""


def encode_image(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode("utf-8")


def analyse_image(path: Path, api_key: str) -> dict:
    b64 = encode_image(path)
    payload = {
        "model": MODEL,
        "max_tokens": MAX_TOKENS,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": USER_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{b64}",
                            "detail": "low",
                        },
                    },
                ],
            },
        ],
    }

    data = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    for attempt in range(2):
        req = urllib.request.Request(OPENAI_API_URL, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                raw = json.loads(resp.read())
                content = raw["choices"][0]["message"]["content"].strip()
                if content.startswith("```"):
                    content = "\n".join(line for line in content.splitlines() if not line.startswith("```")).strip()
                return json.loads(content)
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            if exc.code == 429 and attempt == 0:
                time.sleep(10)
                continue
            raise RuntimeError(f"OpenAI HTTP {exc.code}: {body[:300]}") from exc
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"Invalid JSON response for {path.name}: {content[:300]}") from exc

    raise RuntimeError("All retry attempts failed.")


def main():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("OPENAI_API_KEY not set", file=sys.stderr)
        sys.exit(1)

    mockups_dir = Path("reference-mockups")
    output_path = Path("mockup-pattern-report.json")

    images = sorted(mockups_dir.glob("*.png"))
    print(f"Analysing {len(images)} mockups...")

    results = {}
    for i, path in enumerate(images, 1):
        print(f"[{i}/{len(images)}] {path.name}")
        try:
            results[path.name] = analyse_image(path, api_key)
        except Exception as e:
            print(f"  Failed: {e}")
            results[path.name] = {"error": str(e)}
        time.sleep(0.5)

    output_path.write_text(json.dumps(results, indent=2))
    print(f"\nReport saved to {output_path}")


if __name__ == "__main__":
    main()

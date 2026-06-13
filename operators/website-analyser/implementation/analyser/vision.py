"""
Website Analyser — GPT-4o mini vision call.

Sends a base64-encoded screenshot to the OpenAI vision API and returns
the parsed analysis result as a dict.

Model: gpt-4o-mini — vision-capable, ~$0.003 per analysis.
"""

import base64
import json
import logging
import os
import time
import urllib.error
import urllib.request

from analyser.prompt import SYSTEM_PROMPT, USER_PROMPT

logger = logging.getLogger("website-analyser.vision")

OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_API_VERSION = "2023-06-01"

MODEL = os.getenv("ANALYSER_MODEL", "claude-haiku-4-5-20251001")
MAX_TOKENS = 1500
RETRY_DELAY = 10

ANTHROPIC_MODELS = {
    "claude-3-haiku-20240307", "claude-3-5-haiku-20241022", "claude-3-5-sonnet-20241022", "claude-3-opus-20240229",
    "claude-haiku-4-5-20251001", "claude-sonnet-4-5-20250929", "claude-opus-4-5-20251101",
    "claude-sonnet-4-6", "claude-opus-4-6", "claude-opus-4-7", "claude-opus-4-8", "claude-fable-5",
}


def analyse(
    screenshot_bytes: bytes,
    business_name: str,
    category: str,
    location: str,
    website_url: str,
) -> dict:
    """
    Send screenshot to GPT-4o mini vision and return parsed analysis dict.

    Raises RuntimeError if the API call fails after one retry.
    Raises ValueError if the response JSON cannot be parsed.
    """
    model = MODEL
    b64_image = base64.b64encode(screenshot_bytes).decode("utf-8")

    user_text = USER_PROMPT.format(
        business_name=business_name,
        category=category,
        location=location or "UK",
        website_url=website_url,
    )

    if model in ANTHROPIC_MODELS:
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        if not anthropic_key:
            raise EnvironmentError("ANTHROPIC_API_KEY is not set — check your .env file.")
        logger.info("Using Anthropic model: %s", model)
        result = _call_anthropic(model, b64_image, user_text, anthropic_key)
    else:
        openai_key = os.getenv("OPENAI_API_KEY")
        if not openai_key:
            raise EnvironmentError("OPENAI_API_KEY is not set — check your .env file.")
        logger.info("Using OpenAI model: %s", model)
        payload = {
            "model": model,
            "max_tokens": MAX_TOKENS,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_text},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{b64_image}",
                                "detail": "low",
                            },
                        },
                    ],
                },
            ],
        }
        result = _call_openai(payload, openai_key)

    return _parse_response(result, website_url)


def _call_openai(payload: dict, api_key: str) -> dict:
    """Make the API call with one retry on rate limit."""
    data = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    for attempt in range(2):
        req = urllib.request.Request(OPENAI_API_URL, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            if exc.code == 429 and attempt == 0:
                logger.warning("OpenAI rate limit hit — waiting %ds before retry.", RETRY_DELAY)
                time.sleep(RETRY_DELAY)
                continue
            if exc.code == 401:
                raise PermissionError("OpenAI: invalid API key.") from exc
            raise RuntimeError(f"OpenAI: HTTP {exc.code} — {body[:300]}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"OpenAI: connection error — {exc}") from exc

    raise RuntimeError("OpenAI: all retry attempts failed.")


def _call_anthropic(model: str, b64_image: str, user_text: str, api_key: str) -> dict:
    """Make the API call to Anthropic Messages API with one retry on rate limit."""
    payload = {
        "model": model,
        "max_tokens": MAX_TOKENS,
        "system": SYSTEM_PROMPT,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": b64_image,
                        },
                    },
                    {"type": "text", "text": user_text},
                ],
            }
        ],
    }

    data = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "anthropic-version": ANTHROPIC_API_VERSION,
    }

    for attempt in range(2):
        req = urllib.request.Request(ANTHROPIC_API_URL, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = json.loads(resp.read())
                # Normalise to OpenAI-style shape so _parse_response works for both
                content_text = raw["content"][0]["text"]
                return {"choices": [{"message": {"content": content_text}}]}
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            if exc.code == 429 and attempt == 0:
                logger.warning("Anthropic rate limit hit — waiting %ds before retry.", RETRY_DELAY)
                time.sleep(RETRY_DELAY)
                continue
            if exc.code == 401:
                raise PermissionError("Anthropic: invalid API key.") from exc
            raise RuntimeError(f"Anthropic: HTTP {exc.code} — {body[:300]}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Anthropic: connection error — {exc}") from exc

    raise RuntimeError("Anthropic: all retry attempts failed.")


def _parse_response(response: dict, website_url: str) -> dict:
    """Extract and validate the JSON from the model's response."""
    try:
        content = response["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError) as exc:
        raise RuntimeError(f"OpenAI: unexpected response structure: {response}") from exc

    # Strip accidental markdown fences
    if content.startswith("```"):
        lines = content.splitlines()
        content = "\n".join(
            line for line in lines
            if not line.startswith("```")
        ).strip()

    try:
        result = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Vision model returned non-JSON for {website_url}: {content[:300]}"
        ) from exc

    # Validate required fields
    required = {"prospect_score", "business_quality_score", "opportunity_score", "site_analysis", "outreach_angle"}
    missing = required - set(result.keys())
    if missing:
        raise ValueError(
            f"Vision model response missing fields {missing} for {website_url}"
        )

    # Clamp scores to valid ranges
    for field in ("business_quality_score", "opportunity_score"):
        val = result.get(field)
        if isinstance(val, (int, float)):
            result[field] = max(-1, min(10, int(val)))

    # Recalculate opportunity_score from dimensions to prevent model arithmetic errors
    dims = result.get("opportunity_dimensions") or {}
    dim_values = [dims.get(k, 0) for k in ("visual_modernity", "mobile_experience", "desire_creation", "content_structure", "trust_and_credibility")]
    if any(isinstance(v, (int, float)) for v in dim_values):
        recalculated_opp = max(1, round((sum(dim_values) / 10) * 10))
        if result.get("opportunity_score") != recalculated_opp:
            logger.debug("Correcting opportunity_score from %s to %s (dimensions sum: %s)", result.get("opportunity_score"), recalculated_opp, sum(dim_values))
            result["opportunity_score"] = recalculated_opp

    # Recalculate prospect_score from the two sub-scores
    biz = result.get("business_quality_score")
    opp = result.get("opportunity_score")
    if isinstance(biz, (int, float)) and isinstance(opp, (int, float)):
        recalculated_prospect = round((float(biz) * 0.6) + (float(opp) * 0.4), 1)
        if result.get("prospect_score") != recalculated_prospect:
            logger.debug("Correcting prospect_score from %s to %s", result.get("prospect_score"), recalculated_prospect)
            result["prospect_score"] = recalculated_prospect

    # Enforce recommendation based on recalculated prospect_score
    ps = result.get("prospect_score")
    if isinstance(ps, (int, float)):
        if ps >= 8.0:
            result["recommendation"] = "pursue"
        elif ps >= 6.0:
            result["recommendation"] = "consider"
        else:
            result["recommendation"] = "deprioritise"

    # Ensure weaknesses is a list
    if not isinstance(result.get("site_weaknesses"), list):
        result["site_weaknesses"] = []

    logger.info(
        "Analysis complete: %s — prospect score %s/10 (biz: %s, opp: %s) | %s",
        website_url,
        result.get("prospect_score"),
        result.get("business_quality_score"),
        result.get("opportunity_score"),
        result.get("outreach_angle", "")[:80],
    )

    return result

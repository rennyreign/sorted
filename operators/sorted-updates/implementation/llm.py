"""
LLM classifier for Sorted Updates.

Uses GPT-4o mini to classify inbound messages and extract structured
intent. Falls back to the keyword classifier in parser.py if
OPENAI_API_KEY is not set or the API call fails.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any

from models import Classification, ClientOperatorConfig, Intent, UpdateRequest
from parser import (
    classify_request_type,
    detect_page_type,
    make_request_id,
    target_for_request,
)
from policies import evaluate_policy, unsupported_reply  # noqa: F401


OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
MODEL = "gpt-4o-mini"


def _system_prompt(config: ClientOperatorConfig) -> str:
    allowed = ", ".join(config.allowed_update_types)
    approval = ", ".join(config.approval_required_for)
    pages = ", ".join(config.predefined_pages)
    return f"""You are the Sorted Updates classifier for {config.business_name}.

Your job is to classify a website update request and extract structured intent.

ALLOWED UPDATE TYPES (can be handled automatically or as a preview):
{allowed}

PREDEFINED PAGES (only these page types can be added):
{pages}

APPROVAL REQUIRED FOR (must be escalated to Sorted, never auto-applied):
{approval}

BRAND CONTEXT:
- Palette: {", ".join(config.brand.palette)}
- Tone: {config.brand.tone}
- Primary CTA: {config.brand.primary_cta}
- Secondary CTA: {config.brand.secondary_cta}

Respond ONLY with a JSON object matching this exact schema:
{{
  "request_type": "<one of the allowed types, or 'unsupported'>",
  "confidence": <float 0.0-1.0>,
  "requires_approval": <true|false>,
  "requires_clarification": <true|false>,
  "page_type": "<predefined page slug or null>",
  "missing_information": ["<field name>", ...],
  "suggested_reply": "<short reply to show the user in the portal, max 2 sentences>"
}}

Rules:
- If the request matches an approval_required type, set requires_approval=true and request_type to the matching type.
- If the request is ambiguous or outside all types, set request_type="unsupported".
- If you need more information to proceed (e.g. which page, what time), set requires_clarification=true and list missing fields.
- suggested_reply must start with "Sorted —" and be written in {config.brand.tone} tone.
- Never invent page_type values — only use the predefined pages list or null.
"""


def _call_openai(system: str, user_message: str, api_key: str) -> dict[str, Any]:
    payload = json.dumps({
        "model": MODEL,
        "response_format": {"type": "json_object"},
        "max_tokens": 300,
        "temperature": 0.1,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_message},
        ],
    }).encode("utf-8")

    req = urllib.request.Request(
        OPENAI_API_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = json.loads(resp.read().decode("utf-8"))

    return json.loads(body["choices"][0]["message"]["content"])


def llm_parse_update_request(
    inbound_body: str,
    message_id: str,
    client_id: str,
    source: str,
    config: ClientOperatorConfig,
) -> UpdateRequest:
    api_key = os.getenv("OPENAI_API_KEY", "")
    request_id = make_request_id_from(message_id)

    llm_result: dict[str, Any] | None = None
    if api_key:
        try:
            llm_result = _call_openai(_system_prompt(config), inbound_body, api_key)
        except (urllib.error.URLError, KeyError, json.JSONDecodeError, TimeoutError):
            llm_result = None

    if llm_result:
        request_type = str(llm_result.get("request_type", "unsupported"))
        confidence = float(llm_result.get("confidence", 0.5))
        requires_approval = bool(llm_result.get("requires_approval", False))
        requires_clarification = bool(llm_result.get("requires_clarification", False))
        page_type = llm_result.get("page_type") or None
        missing_information: list[str] = llm_result.get("missing_information") or []
        suggested_reply = str(llm_result.get("suggested_reply", ""))
    else:
        page_type = detect_page_type(inbound_body)
        request_type, confidence = classify_request_type(inbound_body, page_type=page_type)
        policy = evaluate_policy(inbound_body, request_type=request_type, page_type=page_type)
        requires_approval = policy.approval_required
        requires_clarification = False
        missing_information = []
        suggested_reply = ""

    target_route, target_files, missing_from_target = target_for_request(config, request_type, page_type)
    if missing_from_target:
        missing_information = list(set(missing_information + missing_from_target))
        requires_clarification = requires_clarification or (not requires_approval and bool(missing_information))

    unsupported = request_type == "unsupported" or (
        request_type not in config.allowed_update_types and not requires_approval
    )

    status = "dry_run_ready"
    if unsupported:
        status = "unsupported"
    elif requires_approval:
        status = "approval_required"
    elif requires_clarification:
        status = "clarification_required"

    classification = Classification(
        type=request_type,
        confidence=confidence,
        requires_approval=requires_approval or unsupported,
        requires_clarification=requires_clarification,
    )
    intent = Intent(
        page_type=page_type,
        target_route=target_route,
        target_files=target_files,
        missing_information=missing_information,
    )

    result = UpdateRequest(
        request_id=request_id,
        client_id=client_id,
        operator_id=config.operator_id,
        source=source,
        raw_message=inbound_body,
        classification=classification,
        intent=intent,
        status=status,
    )

    if suggested_reply:
        result = result.model_copy(
            update={"intent": intent.model_copy(update={})},
        )
        object.__setattr__(result, "_suggested_reply", suggested_reply)

    return result


def make_request_id_from(message_id: str) -> str:
    import re
    cleaned = re.sub(r"[^a-zA-Z0-9_]+", "_", message_id).strip("_").lower()
    return f"upd_{cleaned or 'message'}"

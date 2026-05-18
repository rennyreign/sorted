"""
Minimal WSGI entry point for gunicorn production deploys.

Routes mirror api.py exactly. Business logic is imported from the same
modules used by the stdlib server so both surfaces stay in sync.
"""
from __future__ import annotations

import json
import os
from typing import Any, Callable
from urllib.parse import parse_qs, urlparse

from env import load_env_file

load_env_file()

from adapters.meta_whatsapp import MetaWebhookError, normalise_meta_webhook, verify_challenge, verify_signature
from approvals import decide_change
from models import InboundMessage, PortalChatRequest
from portal import handle_portal_chat, portal_history
from replies import ReplyStore, prepare_auto_reply
from reset import build_reset_plan, record_reset_plan

CORS_ORIGINS = os.getenv(
    "SORTED_UPDATES_CORS_ORIGINS",
    "https://graciebarrahalesowen.com,https://www.graciebarrahalesowen.com,http://localhost:3000",
)


def _cors_origin(environ: dict) -> str:
    origin = environ.get("HTTP_ORIGIN", "")
    allowed = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]
    return origin if origin in allowed else (allowed[0] if allowed else "*")


def _cors_headers(environ: dict) -> list[tuple[str, str]]:
    return [
        ("Access-Control-Allow-Origin", _cors_origin(environ)),
        ("Access-Control-Allow-Methods", "GET, POST, OPTIONS"),
        ("Access-Control-Allow-Headers", "Content-Type, Authorization"),
        ("Access-Control-Max-Age", "86400"),
    ]


def _json(environ: dict, start_response: Callable, status_code: int, payload: dict[str, Any]) -> list[bytes]:
    body = json.dumps(payload, indent=2).encode("utf-8")
    status_text = {200: "200 OK", 202: "202 Accepted", 400: "400 Bad Request",
                   403: "403 Forbidden", 404: "404 Not Found"}.get(status_code, f"{status_code} Unknown")
    headers = [("Content-Type", "application/json"), ("Content-Length", str(len(body)))]
    headers += _cors_headers(environ)
    start_response(status_text, headers)
    return [body]


def _text(environ: dict, start_response: Callable, status_code: int, text: str) -> list[bytes]:
    body = text.encode("utf-8")
    headers = [("Content-Type", "text/plain"), ("Content-Length", str(len(body)))]
    headers += _cors_headers(environ)
    start_response(f"{status_code} OK", headers)
    return [body]


def _read_body(environ: dict) -> bytes:
    try:
        length = int(environ.get("CONTENT_LENGTH") or 0)
    except ValueError:
        length = 0
    return environ["wsgi.input"].read(length) if length else b""


def application(environ: dict, start_response: Callable) -> list[bytes]:
    method = environ.get("REQUEST_METHOD", "GET").upper()
    parsed = urlparse(environ.get("PATH_INFO", "/"))
    path = parsed.path

    if method == "OPTIONS":
        headers = [("Content-Length", "0")] + _cors_headers(environ)
        start_response("204 No Content", headers)
        return [b""]

    if method == "GET":
        if path == "/health":
            return _json(environ, start_response, 200, {"status": "ok"})

        if path == "/portal/history":
            query = parse_qs(environ.get("QUERY_STRING", ""))
            client_id = query.get("client_id", [None])[0]
            if not client_id:
                return _json(environ, start_response, 400, {"error": "missing client_id"})
            return _json(environ, start_response, 200, portal_history(client_id))

        if path == "/whatsapp/inbound":
            query = {k: v for k, v in parse_qs(environ.get("QUERY_STRING", "")).items()}
            challenge = verify_challenge(query, os.getenv("META_WHATSAPP_VERIFY_TOKEN", ""))
            if challenge is None:
                return _json(environ, start_response, 403, {"error": "webhook verification failed"})
            return _text(environ, start_response, 200, challenge)

        return _json(environ, start_response, 404, {"error": "not found"})

    if method == "POST":
        raw_body = _read_body(environ)

        if path == "/portal/chat":
            try:
                payload = json.loads(raw_body.decode("utf-8"))
                response = handle_portal_chat(PortalChatRequest.model_validate(payload))
            except (json.JSONDecodeError, ValueError) as exc:
                return _json(environ, start_response, 400, {"error": str(exc)})
            return _json(environ, start_response, 200, response.model_dump(mode="json"))

        if path == "/portal/reset":
            try:
                payload = json.loads(raw_body.decode("utf-8"))
            except json.JSONDecodeError as exc:
                return _json(environ, start_response, 400, {"error": f"invalid JSON: {exc}"})
            reset_plan = build_reset_plan(str(payload.get("client_id", "")), str(payload.get("confirmation", "")))
            if reset_plan.status == "blocked":
                return _json(environ, start_response, 400, reset_plan.model_dump(mode="json"))
            record_reset_plan(reset_plan)
            return _json(environ, start_response, 202, reset_plan.model_dump(mode="json"))

        if path == "/portal/approval":
            try:
                payload = json.loads(raw_body.decode("utf-8"))
            except json.JSONDecodeError as exc:
                return _json(environ, start_response, 400, {"error": f"invalid JSON: {exc}"})
            decision = decide_change(
                client_id=str(payload.get("client_id", "")),
                change_id=str(payload.get("change_id", "")),
                decision=str(payload.get("decision", "")),
                decided_by=str(payload.get("decided_by", "portal")),
            )
            code = 200 if decision.status != "not_found" else 404
            return _json(environ, start_response, code, decision.model_dump(mode="json"))

        if path == "/whatsapp/inbound":
            sig = environ.get("HTTP_X_HUB_SIGNATURE_256")
            if not verify_signature(raw_body, sig, os.getenv("META_WHATSAPP_APP_SECRET")):
                return _json(environ, start_response, 403, {"error": "invalid signature"})
            try:
                payload = json.loads(raw_body.decode("utf-8"))
            except json.JSONDecodeError as exc:
                return _json(environ, start_response, 400, {"error": f"invalid JSON: {exc}"})
            try:
                if payload.get("object") == "whatsapp_business_account":
                    inbound_messages = normalise_meta_webhook(payload)
                else:
                    inbound_messages = [InboundMessage.model_validate(payload)]
                state_path = os.getenv("SORTED_UPDATES_REPLY_STATE", ".sorted-updates-state/replied_messages.json")
                store = ReplyStore(state_path)
                responses = [prepare_auto_reply(msg, store=store) for msg in inbound_messages]
            except (MetaWebhookError, ValueError) as exc:
                return _json(environ, start_response, 400, {"error": str(exc)})
            return _json(environ, start_response, 200, {"status": "ok", "responses": responses})

        return _json(environ, start_response, 404, {"error": "not found"})

    return _json(environ, start_response, 405, {"error": "method not allowed"})

from __future__ import annotations

import argparse
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import parse_qs, urlparse

from adapters.meta_whatsapp import MetaWebhookError, normalise_meta_webhook, verify_challenge, verify_signature
from approvals import decide_change
from env import load_env_file
from models import InboundMessage
from netlify_webhook import handle_netlify_webhook
from portal import handle_portal_chat, portal_history
from models import PortalChatRequest
from reset import build_reset_plan, record_reset_plan
from replies import ReplyStore, prepare_auto_reply


DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8787
CORS_ORIGINS = os.getenv(
    "SORTED_UPDATES_CORS_ORIGINS",
    "https://gbhalesowen.com,https://www.gbhalesowen.com,https://sortmydigital.netlify.app,https://gbhalesowen.netlify.app,http://localhost:3000,http://localhost:3001",
)


class SortedUpdatesHandler(BaseHTTPRequestHandler):
    server_version = "SortedUpdatesHTTP/0.1"

    def _cors_origin(self) -> str:
        origin = self.headers.get("Origin", "")
        allowed = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]
        return origin if origin in allowed else (allowed[0] if allowed else "*")

    def _add_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", self._cors_origin())
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Max-Age", "86400")

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._add_cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._json_response(200, {"status": "ok"})
            return

        if parsed.path == "/portal/history":
            query = parse_qs(parsed.query)
            client_id = query.get("client_id", [None])[0]
            if not client_id:
                self._json_response(400, {"error": "missing client_id"})
                return
            self._json_response(200, portal_history(client_id))
            return

        if parsed.path == "/whatsapp/inbound":
            query = {key: values for key, values in parse_qs(parsed.query).items()}
            challenge = verify_challenge(query, os.getenv("META_WHATSAPP_VERIFY_TOKEN", ""))
            if challenge is None:
                self._json_response(403, {"error": "webhook verification failed"})
                return
            self._text_response(200, challenge)
            return

        self._json_response(404, {"error": "not found"})

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/portal/chat":
            raw_body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
            try:
                payload = json.loads(raw_body.decode("utf-8"))
                response = handle_portal_chat(PortalChatRequest.model_validate(payload))
            except (json.JSONDecodeError, ValueError) as exc:
                self._json_response(400, {"error": str(exc)})
                return
            self._json_response(200, response.model_dump(mode="json"))
            return

        if parsed.path == "/portal/reset":
            raw_body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
            try:
                payload = json.loads(raw_body.decode("utf-8"))
            except json.JSONDecodeError as exc:
                self._json_response(400, {"error": f"invalid JSON: {exc}"})
                return
            reset_plan = build_reset_plan(str(payload.get("client_id", "")), str(payload.get("confirmation", "")))
            if reset_plan.status == "blocked":
                self._json_response(400, reset_plan.model_dump(mode="json"))
                return
            record_reset_plan(reset_plan)
            self._json_response(202, reset_plan.model_dump(mode="json"))
            return

        if parsed.path == "/portal/approval":
            raw_body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
            try:
                payload = json.loads(raw_body.decode("utf-8"))
            except json.JSONDecodeError as exc:
                self._json_response(400, {"error": f"invalid JSON: {exc}"})
                return
            decision = decide_change(
                client_id=str(payload.get("client_id", "")),
                change_id=str(payload.get("change_id", "")),
                decision=str(payload.get("decision", "")),
                decided_by=str(payload.get("decided_by", "portal")),
            )
            self._json_response(200 if decision.status != "not_found" else 404, decision.model_dump(mode="json"))
            return

        if parsed.path == "/netlify/webhook":
            raw_body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
            result = handle_netlify_webhook(
                raw_body,
                self.headers.get("X-Netlify-Signature"),
            )
            status = 403 if result.get("status") == "forbidden" else 200
            self._json_response(status, result)
            return

        if parsed.path != "/whatsapp/inbound":
            self._json_response(404, {"error": "not found"})
            return

        raw_body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
        if not verify_signature(
            raw_body,
            self.headers.get("X-Hub-Signature-256"),
            os.getenv("META_WHATSAPP_APP_SECRET"),
        ):
            self._json_response(403, {"error": "invalid signature"})
            return

        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError as exc:
            self._json_response(400, {"error": f"invalid JSON: {exc}"})
            return

        try:
            responses = self._handle_payload(payload)
        except MetaWebhookError as exc:
            self._json_response(400, {"error": str(exc)})
            return
        except ValueError as exc:
            self._json_response(400, {"error": str(exc)})
            return

        self._json_response(200, {"status": "ok", "responses": responses})

    def _handle_payload(self, payload: dict[str, Any]) -> list[dict[str, Any]]:
        return handle_inbound_payload(
            payload,
            state_path=os.getenv("SORTED_UPDATES_REPLY_STATE", ".sorted-updates-state/replied_messages.json"),
        )

    def _json_response(self, status_code: int, payload: dict[str, Any]) -> None:
        encoded = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status_code)
        self._add_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def _text_response(self, status_code: int, text: str) -> None:
        encoded = text.encode("utf-8")
        self.send_response(status_code)
        self._add_cors_headers()
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def log_message(self, format: str, *args: Any) -> None:
        if os.getenv("SORTED_UPDATES_HTTP_LOGS", "0") == "1":
            super().log_message(format, *args)


def run_server(host: str = DEFAULT_HOST, port: int = DEFAULT_PORT) -> None:
    server = ThreadingHTTPServer((host, port), SortedUpdatesHandler)
    print(f"Sorted Updates local intake listening on http://{host}:{port}")
    server.serve_forever()


def handle_inbound_payload(payload: dict[str, Any], state_path: str | None = None) -> list[dict[str, Any]]:
    if payload.get("object") == "whatsapp_business_account":
        inbound_messages = normalise_meta_webhook(payload)
    else:
        inbound_messages = [InboundMessage.model_validate(payload)]

    store = ReplyStore(state_path or ".sorted-updates-state/replied_messages.json")
    return [prepare_auto_reply(inbound, store=store) for inbound in inbound_messages]


def main() -> None:
    load_env_file()
    parser = argparse.ArgumentParser(description="Sorted Updates local WhatsApp Intake HTTP server")
    parser.add_argument("--host", default=os.getenv("SORTED_UPDATES_HOST", DEFAULT_HOST))
    parser.add_argument("--port", type=int, default=int(os.getenv("SORTED_UPDATES_PORT", DEFAULT_PORT)))
    args = parser.parse_args()
    run_server(host=args.host, port=args.port)


if __name__ == "__main__":
    main()

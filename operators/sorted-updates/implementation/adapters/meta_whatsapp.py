from __future__ import annotations

import hmac
import json
import os
from datetime import UTC, datetime
from hashlib import sha256
from typing import Any
from urllib import request
from urllib.error import HTTPError, URLError

from models import InboundMessage


class MetaWebhookError(ValueError):
    pass


def _as_list(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if value is None:
        return []
    return [value]


def _first(value: str | list[str] | None) -> str | None:
    if isinstance(value, list):
        return value[0] if value else None
    return value


def verify_challenge(query: dict[str, str | list[str]], verify_token: str) -> str | None:
    mode = _first(query.get("hub.mode"))
    token = _first(query.get("hub.verify_token"))
    challenge = _first(query.get("hub.challenge"))
    if mode == "subscribe" and token == verify_token and challenge is not None:
        return challenge
    return None


def verify_signature(raw_body: bytes, signature_header: str | None, app_secret: str | None) -> bool:
    if not app_secret:
        return True
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    expected = "sha256=" + hmac.new(app_secret.encode("utf-8"), raw_body, sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header)


def normalise_meta_webhook(payload: dict[str, Any], client_id: str | None = None) -> list[InboundMessage]:
    if payload.get("object") != "whatsapp_business_account":
        raise MetaWebhookError("Payload is not a WhatsApp Business Account webhook.")

    inbound_messages: list[InboundMessage] = []
    for entry in _as_list(payload.get("entry")):
        for change in _as_list(entry.get("changes") if isinstance(entry, dict) else None):
            if not isinstance(change, dict) or change.get("field") != "messages":
                continue

            value = change.get("value") or {}
            contacts = value.get("contacts") or []
            contact_by_wa_id = {
                str(contact.get("wa_id")): contact
                for contact in contacts
                if isinstance(contact, dict) and contact.get("wa_id")
            }

            for message in _as_list(value.get("messages")):
                if not isinstance(message, dict) or message.get("type") != "text":
                    continue

                from_phone = str(message.get("from", ""))
                contact = contact_by_wa_id.get(from_phone, {})
                profile = contact.get("profile") if isinstance(contact, dict) else {}
                timestamp = _received_at(message.get("timestamp"))
                text = message.get("text") or {}
                body = text.get("body") if isinstance(text, dict) else None

                if not body:
                    continue

                inbound_messages.append(
                    InboundMessage(
                        source="whatsapp",
                        message_id=str(message.get("id") or f"meta_{from_phone}_{int(timestamp.timestamp())}"),
                        from_phone=from_phone,
                        from_name=profile.get("name") if isinstance(profile, dict) else None,
                        received_at=timestamp,
                        body=str(body),
                        attachments=[],
                        client_id=client_id,
                    )
                )

    return inbound_messages


def _received_at(value: Any) -> datetime:
    if value is None:
        return datetime.now(UTC)
    try:
        return datetime.fromtimestamp(int(value), tz=UTC)
    except (TypeError, ValueError, OSError):
        return datetime.now(UTC)


def build_text_reply_payload(
    to_phone: str,
    body: str,
    reply_to_message_id: str | None = None,
    preview_url: bool = False,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_phone.lstrip("+"),
        "type": "text",
        "text": {
            "preview_url": preview_url,
            "body": body,
        },
    }
    if reply_to_message_id:
        payload["context"] = {"message_id": reply_to_message_id}
    return payload


def messages_url(phone_number_id: str, graph_api_version: str | None = None) -> str:
    version = graph_api_version or os.getenv("META_GRAPH_API_VERSION", "vXX.X")
    return f"https://graph.facebook.com/{version}/{phone_number_id}/messages"


def send_text_reply(
    to_phone: str,
    body: str,
    reply_to_message_id: str | None = None,
    *,
    access_token: str | None = None,
    phone_number_id: str | None = None,
    graph_api_version: str | None = None,
    timeout_seconds: int = 10,
) -> dict[str, Any]:
    token = access_token or os.getenv("META_WHATSAPP_ACCESS_TOKEN")
    sender_id = phone_number_id or os.getenv("META_WHATSAPP_PHONE_NUMBER_ID")
    if not token or not sender_id:
        raise MetaWebhookError("Meta access token and phone number id are required to send replies.")

    payload = build_text_reply_payload(
        to_phone=to_phone,
        body=body,
        reply_to_message_id=reply_to_message_id,
    )
    req = request.Request(
        messages_url(sender_id, graph_api_version=graph_api_version),
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=timeout_seconds) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        body_text = exc.read().decode("utf-8", errors="replace")
        raise MetaWebhookError(f"Meta reply failed with HTTP {exc.code}: {body_text}") from exc
    except URLError as exc:
        raise MetaWebhookError(f"Meta reply failed: {exc.reason}") from exc


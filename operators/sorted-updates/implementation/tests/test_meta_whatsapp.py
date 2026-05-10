import hmac
from hashlib import sha256

from adapters.meta_whatsapp import build_text_reply_payload, normalise_meta_webhook, verify_challenge, verify_signature
from router import route_inbound_message


def meta_payload(body: str = "Can you add a beginners page to the site?") -> dict:
    return {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "waba_example",
                "changes": [
                    {
                        "field": "messages",
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "447000000001",
                                "phone_number_id": "phone_number_id_example",
                            },
                            "contacts": [
                                {
                                    "profile": {"name": "GB Halesowen Owner"},
                                    "wa_id": "447000000000",
                                }
                            ],
                            "messages": [
                                {
                                    "from": "447000000000",
                                    "id": "wamid_meta_text_001",
                                    "timestamp": "1778414400",
                                    "type": "text",
                                    "text": {"body": body},
                                }
                            ],
                        },
                    }
                ],
            }
        ],
    }


def test_normalises_meta_webhook_text_message_and_routes_digit_phone():
    messages = normalise_meta_webhook(meta_payload())

    assert len(messages) == 1
    assert messages[0].message_id == "wamid_meta_text_001"
    assert messages[0].from_phone == "447000000000"
    assert messages[0].body == "Can you add a beginners page to the site?"
    assert route_inbound_message(messages[0]).client_id == "gbhalesowen"


def test_builds_meta_text_reply_payload():
    payload = build_text_reply_payload(
        to_phone="+447000000000",
        body="Sorted - preview first.",
        reply_to_message_id="wamid_meta_text_001",
    )

    assert payload["messaging_product"] == "whatsapp"
    assert payload["to"] == "447000000000"
    assert payload["context"] == {"message_id": "wamid_meta_text_001"}
    assert payload["text"]["body"] == "Sorted - preview first."


def test_verifies_meta_webhook_challenge():
    challenge = verify_challenge(
        {
            "hub.mode": ["subscribe"],
            "hub.verify_token": ["test-token"],
            "hub.challenge": ["12345"],
        },
        "test-token",
    )

    assert challenge == "12345"


def test_verifies_meta_signature_when_secret_is_present():
    raw_body = b'{"object":"whatsapp_business_account"}'
    signature = "sha256=" + hmac.new(b"secret", raw_body, sha256).hexdigest()

    assert verify_signature(raw_body, signature, "secret") is True
    assert verify_signature(raw_body, "sha256=bad", "secret") is False

from __future__ import annotations

from master import EscalationQueue
from memory import ConversationStore
from models import PortalChatRequest
from portal import handle_portal_chat, portal_history


def make_request(body: str, message_id: str = "portal_001", requested_mode: str = "auto") -> PortalChatRequest:
    return PortalChatRequest.model_validate(
        {
            "session": {
                "session_id": "session_001",
                "client_id": "gbhalesowen",
                "user_id": "owner_001",
                "email": "owner@example.com",
                "first_login": False,
                "intro_completed": True,
            },
            "message_id": message_id,
            "body": body,
            "attachments": [],
            "requested_mode": requested_mode,
        }
    )


def test_portal_chat_records_messages_and_change(tmp_path):
    store = ConversationStore(tmp_path / "memory")
    queue = EscalationQueue(tmp_path / "escalations.json")

    response = handle_portal_chat(
        make_request("Change Saturday kids class to 10am"),
        store=store,
        escalation_queue=queue,
    )

    assert response.status == "preview_planned"
    assert response.change.preview_url is None
    assert response.change.execution["preview_branch_plan"]["branch_name"]
    history = portal_history("gbhalesowen", store=store)
    assert len(history["messages"]) == 2
    assert history["changes"][0]["status"] == "preview_planned"
    assert queue.list_open() == []


def test_portal_chat_escalates_guarded_request(tmp_path):
    store = ConversationStore(tmp_path / "memory")
    queue = EscalationQueue(tmp_path / "escalations.json")

    response = handle_portal_chat(
        make_request("Add a \u00a389 membership price to the pricing page", message_id="portal_002"),
        store=store,
        escalation_queue=queue,
    )

    assert response.status == "escalation_required"
    assert response.change.blocked_reasons
    assert len(response.change.execution["notification_results"]) == 3
    open_escalations = queue.list_open()
    assert len(open_escalations) == 1
    assert open_escalations[0].notification_channels == ["email", "whatsapp", "dashboard"]

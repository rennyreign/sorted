from models import InboundMessage
from replies import ReplyStore, prepare_auto_reply


def inbound(body: str, message_id: str = "wamid_reply_test", from_phone: str = "+447000000000") -> InboundMessage:
    return InboundMessage.model_validate(
        {
            "source": "whatsapp",
            "message_id": message_id,
            "from_phone": from_phone,
            "from_name": "GB Halesowen Owner",
            "received_at": "2026-05-10T12:00:00Z",
            "body": body,
            "attachments": [],
        }
    )


def test_prepare_auto_reply_for_allowed_request(tmp_path):
    store = ReplyStore(tmp_path / "replied.json")

    result = prepare_auto_reply(inbound("Can you add a beginners page to the site?"), store=store)

    assert result["status"] == "reply_prepared"
    assert result["reply_required"] is True
    assert result["sent"] is False
    assert result["dry_run_plan"]["status"] == "dry_run_ready"
    assert result["preview_branch_plan"]["status"] == "preview_plan_ready"
    assert result["preview_branch_plan"]["branch_name"].startswith("sorted-updates/gbhalesowen/")
    assert result["outbound_text"].startswith("Sorted -")


def test_prepare_auto_reply_for_approval_gated_request(tmp_path):
    store = ReplyStore(tmp_path / "replied.json")

    result = prepare_auto_reply(inbound("Add \u00a389 membership pricing"), store=store)

    assert result["status"] == "reply_prepared"
    assert result["dry_run_plan"]["status"] == "approval_required"
    assert result["dry_run_plan"]["approval_required"] is True
    assert result["preview_branch_plan"]["status"] == "preview_blocked"
    assert "manual approval" in result["outbound_text"]


def test_duplicate_message_id_is_noop(tmp_path):
    store = ReplyStore(tmp_path / "replied.json")
    message = inbound("Can you add a beginners page to the site?")

    first = prepare_auto_reply(message, store=store)
    second = prepare_auto_reply(message, store=store)

    assert first["status"] == "reply_prepared"
    assert second["status"] == "duplicate_ignored"
    assert second["reply_required"] is False
    assert second["preview_branch_plan"] is None


def test_unknown_sender_returns_routing_failure(tmp_path):
    store = ReplyStore(tmp_path / "replied.json")

    result = prepare_auto_reply(inbound("Can you update the timetable?", from_phone="+441111111111"), store=store)

    assert result["status"] == "routing_failed"
    assert result["reply_required"] is False
    assert "Could not identify" in result["error"]

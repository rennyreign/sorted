from api import handle_inbound_payload
from api import SortedUpdatesHandler
from api import _hydrate_preview_url
from memory import ConversationStore
from models import ChangeRecord
from datetime import UTC, datetime


def test_handler_exposes_portal_paths():
    assert SortedUpdatesHandler.server_version == "SortedUpdatesHTTP/0.1"


def test_handle_normalized_inbound_payload(tmp_path):
    payload = {
        "source": "whatsapp",
        "message_id": "wamid_api_test_001",
        "from_phone": "+447000000000",
        "from_name": "GB Halesowen Owner",
        "received_at": "2026-05-10T12:00:00Z",
        "body": "Change Saturday kids class to 10am",
        "attachments": [],
    }

    responses = handle_inbound_payload(payload, state_path=str(tmp_path / "replied.json"))

    assert len(responses) == 1
    assert responses[0]["status"] == "reply_prepared"
    assert responses[0]["dry_run_plan"]["request_type"] == "timetable_update"
    assert responses[0]["preview_branch_plan"]["status"] == "preview_plan_ready"
    assert responses[0]["outbound_text"] == "Sorted - I can prepare that timetable update as a preview first."


def test_handle_meta_webhook_payload(tmp_path):
    payload = {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "changes": [
                    {
                        "field": "messages",
                        "value": {
                            "contacts": [{"profile": {"name": "Owner"}, "wa_id": "447000000000"}],
                            "messages": [
                                {
                                    "from": "447000000000",
                                    "id": "wamid_api_meta_001",
                                    "timestamp": "1778414400",
                                    "type": "text",
                                    "text": {"body": "Add \u00a389 membership pricing"},
                                }
                            ],
                        },
                    }
                ]
            }
        ],
    }

    responses = handle_inbound_payload(payload, state_path=str(tmp_path / "replied.json"))

    assert responses[0]["status"] == "reply_prepared"
    assert responses[0]["dry_run_plan"]["status"] == "approval_required"
    assert responses[0]["reply_required"] is True


def test_hydrate_preview_url_from_netlify_lookup(monkeypatch, tmp_path):
    store = ConversationStore(tmp_path / "memory")
    now = datetime.now(UTC)
    change = ChangeRecord(
        change_id="chg_upd_test",
        request_id="upd_test",
        client_id="gbhalesowen",
        status="preview_planned",
        summary="Preview a homepage update.",
        created_at=now,
        updated_at=now,
        execution={
            "preview_branch_plan": {
                "branch_name": "sorted-updates/gbhalesowen/upd-test",
            }
        },
    )

    monkeypatch.setattr("api.get_netlify_deploy_url_for_branch", lambda branch: "https://deploy-preview.netlify.app")

    updated = _hydrate_preview_url(change, store)

    assert updated.preview_url == "https://deploy-preview.netlify.app"
    assert updated.execution["build_status"] == "preview_ready"
    assert store.get_change("gbhalesowen", "chg_upd_test").preview_url == "https://deploy-preview.netlify.app"

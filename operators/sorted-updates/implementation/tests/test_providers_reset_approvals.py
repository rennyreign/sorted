from __future__ import annotations

from approvals import decide_change
from config import load_client_config
from memory import ConversationStore, conversation_message_from_row
from models import ChangeRecord
from netlify_webhook import find_change_by_branch
from providers import PlannedGitHubProvider, PlannedNetlifyProvider, PlannedNotificationProvider
from reset import RESET_CONFIRMATION, build_reset_plan, record_reset_plan
from datetime import UTC, datetime


def test_provider_stubs_return_deterministic_plans():
    config = load_client_config("gbhalesowen")
    deploy = PlannedNetlifyProvider()
    notifications = PlannedNotificationProvider()

    assert deploy.preview_url(config, "sorted-updates/gbhalesowen/upd-test") is None
    assert notifications.send_escalation({"request_id": "upd_test"})[0]["status"] == "planned"


def test_reset_plan_requires_confirmation():
    blocked = build_reset_plan("gbhalesowen", "wrong", git_provider=PlannedGitHubProvider())
    planned = build_reset_plan("gbhalesowen", RESET_CONFIRMATION, git_provider=PlannedGitHubProvider())

    assert blocked.status == "blocked"
    assert planned.status == "reset_planned"
    assert planned.handoff_tag == "sorted-handoff"


def test_record_reset_plan_adds_history(tmp_path):
    store = ConversationStore(tmp_path / "memory")
    plan = build_reset_plan("gbhalesowen", RESET_CONFIRMATION, git_provider=PlannedGitHubProvider())

    record_reset_plan(plan, store=store)

    assert store.list_messages("gbhalesowen")
    assert store.list_changes("gbhalesowen")[0].status == "reset_planned"


def test_decide_change_updates_preview_status(tmp_path):
    store = ConversationStore(tmp_path / "memory")
    now = datetime.now(UTC)
    store.upsert_change(
        ChangeRecord(
            change_id="chg_upd_test",
            request_id="upd_test",
            client_id="gbhalesowen",
            status="preview_planned",
            summary="Preview a timetable update.",
            created_at=now,
            updated_at=now,
            preview_url="https://deploy-preview.netlify.app",
        )
    )

    decision = decide_change("gbhalesowen", "chg_upd_test", "approve", "owner", store=store)

    assert decision.status == "approved_for_merge"
    assert store.list_changes("gbhalesowen")[0].status == "approved_for_merge"


def test_decide_change_blocks_publish_before_preview_is_ready(tmp_path):
    store = ConversationStore(tmp_path / "memory")
    now = datetime.now(UTC)
    store.upsert_change(
        ChangeRecord(
            change_id="chg_upd_building",
            request_id="upd_building",
            client_id="gbhalesowen",
            status="preview_planned",
            summary="Preview a homepage update.",
            created_at=now,
            updated_at=now,
            execution={
                "mode": "preview",
                "preview_branch_plan": {"branch_name": "sorted-updates/gbhalesowen/upd-building"},
            },
        )
    )

    decision = decide_change("gbhalesowen", "chg_upd_building", "approve", "owner", store=store)

    assert decision.status == "blocked"
    assert decision.message == "Preview is still building. Review the preview link before publishing."
    assert store.list_changes("gbhalesowen")[0].status == "preview_planned"


def test_netlify_branch_lookup_queries_supabase(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key")
    now = datetime.now(UTC).isoformat()
    calls = []

    def fake_supa_request(method, path, body=None, params="", upsert=False):
        calls.append({"method": method, "path": path, "params": params})
        return [
            {
                "change_id": "chg_upd_test",
                "request_id": "upd_test",
                "client_id": "gbhalesowen",
                "status": "preview_planned",
                "summary": "Preview a timetable update.",
                "created_at": now,
                "updated_at": now,
                "target_route": "/timetable",
                "preview_url": None,
                "live_url": None,
                "blocked_reasons": None,
                "execution": {
                    "preview_branch_plan": {
                        "branch_name": "sorted-updates/gbhalesowen/upd-test",
                        "repo": "rennyreign/gbhalesowen",
                    }
                },
            }
        ]

    monkeypatch.setattr("netlify_webhook._supa_request", fake_supa_request)

    result = find_change_by_branch("sorted-updates/gbhalesowen/upd-test", ConversationStore())

    assert result is not None
    client_id, change = result
    assert client_id == "gbhalesowen"
    assert change.change_id == "chg_upd_test"
    assert calls[0]["path"] == "/sorted_changes"
    assert "execution-%3Epreview_branch_plan-%3E%3Ebranch_name=eq.sorted-updates%2Fgbhalesowen%2Fupd-test" in calls[0]["params"]


def test_netlify_branch_lookup_falls_back_to_recent_supabase_rows(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key")
    now = datetime.now(UTC).isoformat()
    calls = []

    def fake_supa_request(method, path, body=None, params="", upsert=False):
        calls.append({"method": method, "path": path, "params": params})
        if "execution-%3Epreview_branch_plan" in params:
            return {"error": 400, "message": "bad json path"}
        return [
            {
                "change_id": "chg_upd_test",
                "request_id": "upd_test",
                "client_id": "gbhalesowen",
                "status": "preview_planned",
                "summary": "Preview a timetable update.",
                "created_at": now,
                "updated_at": now,
                "blocked_reasons": [],
                "execution": {
                    "preview_branch_plan": {
                        "branch_name": "sorted-updates/gbhalesowen/upd-test",
                    }
                },
            }
        ]

    monkeypatch.setattr("netlify_webhook._supa_request", fake_supa_request)

    result = find_change_by_branch("sorted-updates/gbhalesowen/upd-test", ConversationStore())

    assert result is not None
    assert result[1].change_id == "chg_upd_test"
    assert calls[1]["params"] == "order=created_at.desc&limit=100"


def test_conversation_message_from_supabase_row_ignores_table_columns():
    message = conversation_message_from_row(
        {
            "id": "portal_001",
            "client_id": "gbhalesowen",
            "role": "user",
            "content": "Change homepage copy",
            "created_at": datetime.now(UTC).isoformat(),
            "attachments": [],
            "metadata": {},
        }
    )

    assert message.id == "portal_001"
    assert message.role == "user"

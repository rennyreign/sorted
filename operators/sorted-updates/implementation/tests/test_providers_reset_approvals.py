from __future__ import annotations

from approvals import decide_change
from config import load_client_config
from memory import ConversationStore
from models import ChangeRecord
from providers import PlannedGitHubProvider, PlannedNetlifyProvider, PlannedNotificationProvider
from reset import RESET_CONFIRMATION, build_reset_plan, record_reset_plan
from datetime import UTC, datetime


def test_provider_stubs_return_deterministic_plans():
    config = load_client_config("gbhalesowen")
    deploy = PlannedNetlifyProvider()
    notifications = PlannedNotificationProvider()

    assert deploy.preview_url(config, "sorted-updates/gbhalesowen/upd-test").endswith(".netlify.app")
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
        )
    )

    decision = decide_change("gbhalesowen", "chg_upd_test", "approve", "owner", store=store)

    assert decision.status == "approved_for_merge"
    assert store.list_changes("gbhalesowen")[0].status == "approved_for_merge"

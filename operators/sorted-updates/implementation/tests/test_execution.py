from __future__ import annotations

from config import load_client_config
from execution import plan_change_execution
from parser import build_cli_inbound, dry_run_plan, parse_update_request


def test_contact_update_can_auto_apply_when_requested():
    config = load_client_config("gbhalesowen")
    inbound = build_cli_inbound("Change the phone number to 0121 000 0000", client_id="gbhalesowen")
    update_request = parse_update_request(inbound, config)
    dry_run = dry_run_plan(update_request, config)

    execution = plan_change_execution(update_request, dry_run, config, requested_mode="auto")

    assert execution.status == "apply_planned"
    assert execution.mode == "auto_apply"
    assert execution.live_url is not None


def test_preview_mode_forces_preview_for_safe_request():
    config = load_client_config("gbhalesowen")
    inbound = build_cli_inbound("Change the email address to hello@example.com", client_id="gbhalesowen")
    update_request = parse_update_request(inbound, config)
    dry_run = dry_run_plan(update_request, config)

    execution = plan_change_execution(update_request, dry_run, config, requested_mode="preview")

    assert execution.status == "preview_planned"
    assert execution.mode == "preview"
    assert execution.preview_url is None
    assert execution.branch_result["branch_name"]

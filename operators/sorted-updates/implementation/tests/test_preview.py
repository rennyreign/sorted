from config import load_client_config
from models import DryRunPlan
from parser import build_cli_inbound, dry_run_plan, parse_update_request
from preview import build_preview_branch_plan, target_is_allowed


def make_request_and_plan(message: str):
    config = load_client_config("gbhalesowen")
    inbound = build_cli_inbound(message, client_id="gbhalesowen")
    request = parse_update_request(inbound, config)
    plan = dry_run_plan(request, config)
    return config, request, plan


def test_builds_preview_branch_plan_for_allowed_request():
    config, request, plan = make_request_and_plan("Can you add a beginners page to the site?")

    preview = build_preview_branch_plan(request, plan, config)

    assert preview.status == "preview_plan_ready"
    assert preview.branch_name == "sorted-updates/gbhalesowen/upd_cli_message-predefined_page_addition"
    assert preview.pr_title == "Sorted Updates: gbhalesowen predefined_page_addition"
    assert "app/gbhalesowen/beginners/page.tsx" in preview.pr_body


def test_blocks_preview_branch_for_approval_required_request():
    config, request, plan = make_request_and_plan("Add \u00a389 membership pricing")

    preview = build_preview_branch_plan(request, plan, config)

    assert preview.status == "preview_blocked"
    assert preview.branch_name is None
    assert "dry-run status is approval_required" in preview.blocked_reasons
    assert "request requires approval" in preview.blocked_reasons


def test_blocks_target_outside_allowed_client_paths():
    config, request, plan = make_request_and_plan("Can you add a beginners page to the site?")
    unsafe_plan = DryRunPlan(
        **{
            **plan.model_dump(),
            "target_files": ["app/page.tsx"],
        }
    )

    preview = build_preview_branch_plan(request, unsafe_plan, config)

    assert preview.status == "preview_blocked"
    assert preview.branch_name is None
    assert preview.blocked_reasons == ["target file is outside allowed client paths: app/page.tsx"]


def test_allowed_path_validation_accepts_client_roots():
    config = load_client_config("gbhalesowen")

    assert target_is_allowed("app/gbhalesowen/timetable/page.tsx", config)
    assert target_is_allowed("public/gbhalesowen", config)
    assert not target_is_allowed("app/about/page.tsx", config)


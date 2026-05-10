from config import load_client_config
from parser import build_cli_inbound, dry_run_plan, parse_update_request


def test_pricing_request_requires_approval():
    config = load_client_config("gbhalesowen")
    inbound = build_cli_inbound("Add \u00a389 membership pricing", client_id="gbhalesowen")
    request = parse_update_request(inbound, config)
    plan = dry_run_plan(request, config)

    assert request.status == "approval_required"
    assert request.classification.requires_approval is True
    assert plan.approval_required is True
    assert "pricing" in " ".join(plan.blocked_reasons)


def test_unsupported_request_returns_manual_review():
    config = load_client_config("gbhalesowen")
    inbound = build_cli_inbound("Can you write a full Instagram campaign for next month?", client_id="gbhalesowen")
    request = parse_update_request(inbound, config)
    plan = dry_run_plan(request, config)

    assert request.status == "unsupported"
    assert plan.status == "unsupported"
    assert plan.approval_required is True
    assert "manual review" in plan.suggested_whatsapp_reply.casefold()


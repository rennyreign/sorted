from config import load_client_config
from parser import build_cli_inbound, dry_run_plan, parse_update_request


def test_client_config_loads_correctly():
    config = load_client_config("gbhalesowen")

    assert config.business_name == "Gracie Barra Halesowen"
    assert config.site_paths["app_root"] == "app/gbhalesowen"
    assert "predefined_page_addition" in config.allowed_update_types


def test_dry_run_plan_contains_suggested_whatsapp_reply():
    config = load_client_config("gbhalesowen")
    inbound = build_cli_inbound("Can you add a beginners page to the site?", client_id="gbhalesowen")
    request = parse_update_request(inbound, config)
    plan = dry_run_plan(request, config)

    assert plan.status == "dry_run_ready"
    assert plan.suggested_whatsapp_reply
    assert "preview" in plan.suggested_whatsapp_reply.casefold()


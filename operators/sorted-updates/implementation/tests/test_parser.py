from config import load_client_config
from parser import build_cli_inbound, parse_update_request


def test_classifies_beginners_page_request():
    config = load_client_config("gbhalesowen")
    inbound = build_cli_inbound("Can you add a beginners page to the site?", client_id="gbhalesowen")
    request = parse_update_request(inbound, config)

    assert request.classification.type == "predefined_page_addition"
    assert request.intent.page_type == "beginners"
    assert request.status == "dry_run_ready"


def test_classifies_timetable_update():
    config = load_client_config("gbhalesowen")
    inbound = build_cli_inbound("Change Saturday kids class to 10am", client_id="gbhalesowen")
    request = parse_update_request(inbound, config)

    assert request.classification.type == "timetable_update"
    assert request.intent.target_route == "/gbhalesowen/timetable"


def test_target_route_and_file_for_predefined_page():
    config = load_client_config("gbhalesowen")
    inbound = build_cli_inbound("Please add a kids page", client_id="gbhalesowen")
    request = parse_update_request(inbound, config)

    assert request.intent.target_route == "/gbhalesowen/kids-classes"
    assert request.intent.target_files == ["app/gbhalesowen/kids-classes/page.tsx"]


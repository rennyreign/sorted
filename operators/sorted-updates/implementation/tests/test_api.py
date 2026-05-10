from api import handle_inbound_payload


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

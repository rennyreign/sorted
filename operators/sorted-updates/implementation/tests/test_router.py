from models import InboundMessage
from router import route_inbound_message


def test_routes_known_gbh_phone_to_gbh_operator():
    inbound = InboundMessage.model_validate(
        {
            "source": "whatsapp",
            "message_id": "wamid_test_router",
            "from_phone": "+44 7000 000000",
            "from_name": "GB Halesowen Owner",
            "received_at": "2026-05-10T12:00:00Z",
            "body": "Can you update the timetable?",
            "attachments": [],
        }
    )

    config = route_inbound_message(inbound)

    assert config.client_id == "gbhalesowen"
    assert config.operator_id == "gbhalesowen-website-operator"


from __future__ import annotations

import re

from config import ConfigError, list_client_configs, load_client_config
from models import ClientOperatorConfig, InboundMessage


def normalise_phone(phone: str | None) -> str:
    if not phone:
        return ""
    return re.sub(r"\D+", "", phone)


def route_inbound_message(
    inbound: InboundMessage,
    explicit_client_id: str | None = None,
) -> ClientOperatorConfig:
    client_id = explicit_client_id or inbound.client_id
    if client_id:
        return load_client_config(client_id)

    inbound_phone = normalise_phone(inbound.from_phone)
    for config in list_client_configs():
        for contact in config.known_contacts:
            if normalise_phone(contact.phone) == inbound_phone:
                return config

    raise ConfigError("Could not identify a Client Website Operator for this inbound message.")

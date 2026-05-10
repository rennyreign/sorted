from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from config import ConfigError
from models import ClientOperatorConfig, DryRunPlan, InboundMessage, UpdateRequest
from parser import dry_run_plan, parse_update_request
from preview import build_preview_branch_plan
from router import route_inbound_message


DEFAULT_REPLY_STATE = Path(".sorted-updates-state/replied_messages.json")


class ReplyStore:
    def __init__(self, path: Path | str = DEFAULT_REPLY_STATE):
        self.path = Path(path)

    def has_replied(self, message_id: str) -> bool:
        return message_id in self._read()

    def mark_replied(self, message_id: str) -> None:
        data = self._read()
        data.add(message_id)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(sorted(data), indent=2), encoding="utf-8")

    def _read(self) -> set[str]:
        if not self.path.exists():
            return set()
        try:
            payload = json.loads(self.path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return set()
        if not isinstance(payload, list):
            return set()
        return {str(item) for item in payload}


@dataclass(frozen=True)
class OperatorRun:
    config: ClientOperatorConfig
    update_request: UpdateRequest
    dry_run: DryRunPlan


def run_operator_for_inbound(inbound: InboundMessage, explicit_client_id: str | None = None) -> OperatorRun:
    config = route_inbound_message(inbound, explicit_client_id=explicit_client_id)
    update_request = parse_update_request(inbound, config)
    return OperatorRun(
        config=config,
        update_request=update_request,
        dry_run=dry_run_plan(update_request, config),
    )


def dry_run_for_inbound(inbound: InboundMessage, explicit_client_id: str | None = None) -> DryRunPlan:
    return run_operator_for_inbound(inbound, explicit_client_id=explicit_client_id).dry_run


def prepare_auto_reply(
    inbound: InboundMessage,
    *,
    store: ReplyStore | None = None,
    explicit_client_id: str | None = None,
    send: bool = False,
) -> dict[str, Any]:
    reply_store = store or ReplyStore()
    if reply_store.has_replied(inbound.message_id):
        return {
            "status": "duplicate_ignored",
            "message_id": inbound.message_id,
            "reply_required": False,
            "sent": False,
            "dry_run_plan": None,
            "preview_branch_plan": None,
            "outbound_text": None,
        }

    try:
        operator_run = run_operator_for_inbound(inbound, explicit_client_id=explicit_client_id)
    except ConfigError as exc:
        return {
            "status": "routing_failed",
            "message_id": inbound.message_id,
            "reply_required": False,
            "sent": False,
            "dry_run_plan": None,
            "preview_branch_plan": None,
            "outbound_text": None,
            "error": str(exc),
        }

    plan = operator_run.dry_run
    preview_plan = build_preview_branch_plan(operator_run.update_request, plan, operator_run.config)

    if send:
        raise RuntimeError("Provider send is intentionally disabled in the local auto-reply contract.")

    reply_store.mark_replied(inbound.message_id)
    return {
        "status": "reply_prepared",
        "message_id": inbound.message_id,
        "reply_required": True,
        "sent": False,
        "dry_run_plan": plan.model_dump(mode="json"),
        "preview_branch_plan": preview_plan.as_dict(),
        "outbound_text": plan.suggested_whatsapp_reply,
    }

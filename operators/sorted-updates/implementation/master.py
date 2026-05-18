from __future__ import annotations

import json
import os
from datetime import UTC, datetime
from pathlib import Path

from models import EscalationRecord
from providers import NotificationProvider, default_notification_provider


DEFAULT_ESCALATION_PATH = Path(".sorted-updates-state/escalations.json")
DEFAULT_NOTIFICATION_CHANNELS = ["email", "whatsapp", "dashboard"]


class EscalationQueue:
    def __init__(self, path: Path | str = DEFAULT_ESCALATION_PATH):
        self.path = Path(os.getenv("SORTED_UPDATES_ESCALATION_STATE", str(path)))

    def enqueue(self, escalation: EscalationRecord) -> None:
        records = [item for item in self._read() if item.get("escalation_id") != escalation.escalation_id]
        records.append(escalation.model_dump(mode="json"))
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(records, indent=2), encoding="utf-8")

    def notify(
        self,
        escalation: EscalationRecord,
        provider: NotificationProvider | None = None,
    ) -> list[dict]:
        notifier = provider or default_notification_provider()
        return notifier.send_escalation(escalation.model_dump(mode="json"))

    def list_open(self) -> list[EscalationRecord]:
        return [
            EscalationRecord.model_validate(item)
            for item in self._read()
            if item.get("status") in {"open", "notified"}
        ]

    def _read(self) -> list[dict]:
        if not self.path.exists():
            return []
        try:
            payload = json.loads(self.path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return []
        return payload if isinstance(payload, list) else []


def build_escalation(
    client_id: str,
    request_id: str,
    reason: str,
    summary: str,
    channels: list[str] | None = None,
) -> EscalationRecord:
    return EscalationRecord(
        escalation_id=f"esc_{client_id}_{request_id}",
        client_id=client_id,
        request_id=request_id,
        status="notified",
        reason=reason,
        summary=summary,
        created_at=datetime.now(UTC),
        notification_channels=channels or DEFAULT_NOTIFICATION_CHANNELS,
    )

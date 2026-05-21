from __future__ import annotations

import json
import os
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from models import ChangeRecord, ConversationMessage


DEFAULT_MEMORY_ROOT = Path(".sorted-updates-state/memory")


class ConversationStore:
    def __init__(self, root: Path | str = DEFAULT_MEMORY_ROOT):
        self.root = Path(os.getenv("SORTED_UPDATES_MEMORY_ROOT", str(root)))

    def append_message(self, client_id: str, message: ConversationMessage) -> None:
        data = self._read(client_id)
        data.setdefault("messages", []).append(message.model_dump(mode="json"))
        self._write(client_id, data)

    def list_messages(self, client_id: str) -> list[ConversationMessage]:
        data = self._read(client_id)
        return [ConversationMessage.model_validate(item) for item in data.get("messages", [])]

    def upsert_change(self, change: ChangeRecord) -> None:
        data = self._read(change.client_id)
        changes = [item for item in data.get("changes", []) if item.get("change_id") != change.change_id]
        changes.append(change.model_dump(mode="json"))
        data["changes"] = changes
        self._write(change.client_id, data)

    def list_changes(self, client_id: str) -> list[ChangeRecord]:
        data = self._read(client_id)
        return [ChangeRecord.model_validate(item) for item in data.get("changes", [])]

    def get_change(self, client_id: str, change_id: str) -> ChangeRecord | None:
        for change in self.list_changes(client_id):
            if change.change_id == change_id:
                return change
        return None

    def mark_intro_completed(self, client_id: str, session_id: str) -> None:
        data = self._read(client_id)
        sessions = data.setdefault("sessions", {})
        session = sessions.setdefault(session_id, {})
        session["intro_completed"] = True
        session["updated_at"] = datetime.now(UTC).isoformat()
        self._write(client_id, data)

    def intro_completed(self, client_id: str, session_id: str) -> bool:
        data = self._read(client_id)
        return bool(data.get("sessions", {}).get(session_id, {}).get("intro_completed"))

    def _path(self, client_id: str) -> Path:
        return self.root / client_id / "conversation.json"

    def _read(self, client_id: str) -> dict[str, Any]:
        path = self._path(client_id)
        if not path.exists():
            return {"messages": [], "changes": [], "sessions": {}}
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {"messages": [], "changes": [], "sessions": {}}
        if not isinstance(payload, dict):
            return {"messages": [], "changes": [], "sessions": {}}
        payload.setdefault("messages", [])
        payload.setdefault("changes", [])
        payload.setdefault("sessions", {})
        return payload

    def _write(self, client_id: str, data: dict[str, Any]) -> None:
        path = self._path(client_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")

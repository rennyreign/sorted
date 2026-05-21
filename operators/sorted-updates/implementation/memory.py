from __future__ import annotations

import json
import os
import urllib.request
import urllib.error
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from models import ChangeRecord, ConversationMessage


# ── Supabase helpers ──────────────────────────────────────────────────────────

def _supa_url() -> str:
    return os.getenv("SUPABASE_URL", "").rstrip("/")

def _supa_key() -> str:
    return os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

def _supa_request(method: str, path: str, body: dict | None = None, params: str = "") -> Any:
    url = f"{_supa_url()}/rest/v1{path}"
    if params:
        url = f"{url}?{params}"
    data = json.dumps(body).encode() if body else None
    headers = {
        "apikey": _supa_key(),
        "Authorization": f"Bearer {_supa_key()}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else []
    except urllib.error.HTTPError as e:
        return {"error": e.code, "message": e.read().decode()}
    except Exception as e:
        return {"error": str(e)}


# ── Fallback file store (used when Supabase not configured) ───────────────────

DEFAULT_MEMORY_ROOT = Path(".sorted-updates-state/memory")


class _FileStore:
    def __init__(self) -> None:
        self.root = Path(os.getenv("SORTED_UPDATES_MEMORY_ROOT", str(DEFAULT_MEMORY_ROOT)))

    def _path(self, client_id: str) -> Path:
        return self.root / client_id / "conversation.json"

    def read(self, client_id: str) -> dict[str, Any]:
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

    def write(self, client_id: str, data: dict[str, Any]) -> None:
        path = self._path(client_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")


# ── ConversationStore ─────────────────────────────────────────────────────────

class ConversationStore:
    """
    Persists messages and changes.
    Uses Supabase when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set,
    falls back to local JSON files otherwise.
    """

    def _use_supabase(self) -> bool:
        return bool(_supa_url() and _supa_key())

    # ── Messages ──────────────────────────────────────────────────────────────

    def append_message(self, client_id: str, message: ConversationMessage) -> None:
        if self._use_supabase():
            row = {
                "id": message.id,
                "client_id": client_id,
                "role": message.role,
                "content": message.content,
                "created_at": message.created_at.isoformat() if hasattr(message.created_at, "isoformat") else message.created_at,
                "attachments": message.attachments or [],
                "metadata": message.metadata or {},
            }
            _supa_request("POST", "/sorted_messages", row,
                         params="on_conflict=client_id,id")
        else:
            fs = _FileStore()
            data = fs.read(client_id)
            data["messages"].append(message.model_dump(mode="json"))
            fs.write(client_id, data)

    def list_messages(self, client_id: str) -> list[ConversationMessage]:
        if self._use_supabase():
            rows = _supa_request("GET", "/sorted_messages",
                                 params=f"client_id=eq.{client_id}&order=created_at.asc")
            if isinstance(rows, list):
                return [ConversationMessage.model_validate(r) for r in rows]
            return []
        else:
            data = _FileStore().read(client_id)
            return [ConversationMessage.model_validate(item) for item in data.get("messages", [])]

    # ── Changes ───────────────────────────────────────────────────────────────

    def upsert_change(self, change: ChangeRecord) -> None:
        if self._use_supabase():
            d = change.model_dump(mode="json")
            row = {
                "change_id": d["change_id"],
                "client_id": d["client_id"],
                "request_id": d["request_id"],
                "status": d["status"],
                "summary": d.get("summary", ""),
                "created_at": d["created_at"],
                "updated_at": d["updated_at"],
                "target_route": d.get("target_route"),
                "preview_url": d.get("preview_url"),
                "live_url": d.get("live_url"),
                "blocked_reasons": d.get("blocked_reasons", []),
                "execution": d.get("execution", {}),
            }
            _supa_request("POST", "/sorted_changes", row,
                         params="on_conflict=change_id")
        else:
            fs = _FileStore()
            data = fs.read(change.client_id)
            changes = [c for c in data.get("changes", []) if c.get("change_id") != change.change_id]
            changes.append(change.model_dump(mode="json"))
            data["changes"] = changes
            fs.write(change.client_id, data)

    def list_changes(self, client_id: str) -> list[ChangeRecord]:
        if self._use_supabase():
            rows = _supa_request("GET", "/sorted_changes",
                                 params=f"client_id=eq.{client_id}&order=created_at.desc")
            if isinstance(rows, list):
                return [ChangeRecord.model_validate(r) for r in rows]
            return []
        else:
            data = _FileStore().read(client_id)
            return [ChangeRecord.model_validate(item) for item in data.get("changes", [])]

    def get_change(self, client_id: str, change_id: str) -> ChangeRecord | None:
        if self._use_supabase():
            rows = _supa_request("GET", "/sorted_changes",
                                 params=f"change_id=eq.{change_id}&client_id=eq.{client_id}&limit=1")
            if isinstance(rows, list) and rows:
                return ChangeRecord.model_validate(rows[0])
            return None
        else:
            for change in self.list_changes(client_id):
                if change.change_id == change_id:
                    return change
            return None

    # ── Sessions ──────────────────────────────────────────────────────────────

    def mark_intro_completed(self, client_id: str, session_id: str) -> None:
        if self._use_supabase():
            # Store session state as a special message row
            row = {
                "id": f"session_{session_id}_intro",
                "client_id": client_id,
                "role": "system",
                "content": "intro_completed",
                "attachments": [],
                "metadata": {"session_id": session_id, "intro_completed": True},
            }
            _supa_request("POST", "/sorted_messages", row,
                         params="on_conflict=client_id,id")
        else:
            fs = _FileStore()
            data = fs.read(client_id)
            sessions = data.setdefault("sessions", {})
            session = sessions.setdefault(session_id, {})
            session["intro_completed"] = True
            session["updated_at"] = datetime.now(UTC).isoformat()
            fs.write(client_id, data)

    def intro_completed(self, client_id: str, session_id: str) -> bool:
        if self._use_supabase():
            rows = _supa_request("GET", "/sorted_messages",
                                 params=f"client_id=eq.{client_id}&id=eq.session_{session_id}_intro&limit=1")
            return isinstance(rows, list) and len(rows) > 0
        else:
            data = _FileStore().read(client_id)
            return bool(data.get("sessions", {}).get(session_id, {}).get("intro_completed"))

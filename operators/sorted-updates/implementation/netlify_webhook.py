"""
netlify_webhook.py — handles Netlify deploy event webhooks.

Netlify calls this endpoint when a branch deploy succeeds or fails.
We match the branch name back to a ChangeRecord and update its status,
so the portal can surface build feedback inline.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import pathlib

from memory import ConversationStore, _supa_params, _supa_request, change_record_from_row
from models import ChangeRecord


def _verify_signature(body: bytes, signature_header: str | None, secret: str) -> bool:
    """Netlify signs webhooks with HMAC-SHA256 when a webhook secret is configured."""
    if not secret or not signature_header:
        return True  # no secret configured — skip verification
    mac = hmac.new(secret.encode(), body, digestmod=hashlib.sha256)
    expected = "sha256=" + mac.hexdigest()
    return hmac.compare_digest(expected, signature_header)


def find_change_by_branch(branch_name: str, store: ConversationStore) -> tuple[str, ChangeRecord] | None:
    """
    Find a ChangeRecord whose preview branch matches.
    Returns (client_id, change) or None.
    """
    if store._use_supabase():
        rows = _supa_request(
            "GET",
            "/sorted_changes",
            params=_supa_params(
                {
                    "execution->preview_branch_plan->>branch_name": f"eq.{branch_name}",
                    "limit": "1",
                }
            ),
        )
        if isinstance(rows, list) and rows:
            change = change_record_from_row(rows[0])
            return change.client_id, change

    root = pathlib.Path(store.memory_root or os.getenv("SORTED_UPDATES_MEMORY_ROOT", ".sorted-updates-state/memory"))
    if not root.exists():
        return None
    for client_dir in root.iterdir():
        if not client_dir.is_dir():
            continue
        client_id = client_dir.name
        for change in store.list_changes(client_id):
            bp = change.execution.get("preview_branch_plan", {})
            if bp.get("branch_name") == branch_name:
                return client_id, change
    return None


def handle_netlify_webhook(body: bytes, signature: str | None) -> dict:
    secret = os.getenv("NETLIFY_WEBHOOK_SECRET", "")
    if not _verify_signature(body, signature, secret):
        return {"status": "forbidden", "message": "invalid signature"}

    try:
        payload = json.loads(body.decode("utf-8"))
    except json.JSONDecodeError:
        return {"status": "error", "message": "invalid JSON"}

    event_type = payload.get("state")  # "ready", "error", "building", etc.
    branch = payload.get("branch", "")
    deploy_url = payload.get("deploy_ssl_url") or payload.get("url") or ""

    if not branch or event_type not in {"ready", "error"}:
        return {"status": "ignored", "branch": branch, "state": event_type}

    store = ConversationStore()
    result = find_change_by_branch(branch, store)
    if not result:
        return {"status": "no_match", "branch": branch}

    client_id, change = result

    if event_type == "ready":
        build_status = "preview_ready"
        build_message = f"Your preview is ready. View it at {deploy_url}"
    else:
        build_status = "preview_build_failed"
        build_message = "Something went wrong preparing your preview — I've flagged it for review."
        deploy_url = ""

    update_fields: dict = {
        "execution": {
            **change.execution,
            "build_status": build_status,
            "build_message": build_message,
            "deploy_url": deploy_url,
        }
    }
    # Save the real Netlify deploy URL onto the change record
    if deploy_url:
        update_fields["preview_url"] = deploy_url

    updated = change.model_copy(update=update_fields)
    store.upsert_change(updated)

    return {
        "status": "updated",
        "client_id": client_id,
        "change_id": change.change_id,
        "build_status": build_status,
    }

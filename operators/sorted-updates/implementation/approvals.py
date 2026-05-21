from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from datetime import UTC, datetime

from memory import ConversationStore
from models import ApprovalDecision, ChangeRecord


APPROVE = "approve"
REJECT = "reject"


def _github_merge_pr(repo: str, pr_number: int, commit_title: str) -> dict:
    token = os.getenv("GITHUB_TOKEN", "")
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/merge"
    body = json.dumps({
        "commit_title": commit_title,
        "merge_method": "squash",
    }).encode()
    req = urllib.request.Request(
        url, data=body, method="PUT",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "message": e.read().decode()}


def _find_pr_number(repo: str, branch_name: str) -> int | None:
    token = os.getenv("GITHUB_TOKEN", "")
    url = f"https://api.github.com/repos/{repo}/pulls?head={repo.split('/')[0]}:{branch_name}&state=open"
    req = urllib.request.Request(
        url, method="GET",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            prs = json.loads(resp.read())
        if prs and isinstance(prs, list):
            return prs[0].get("number")
    except Exception:
        pass
    return None


def decide_change(
    client_id: str,
    change_id: str,
    decision: str,
    decided_by: str,
    *,
    store: ConversationStore | None = None,
) -> ApprovalDecision:
    memory = store or ConversationStore()
    change = find_change(memory, client_id, change_id)
    if not change:
        return ApprovalDecision(
            change_id=change_id,
            client_id=client_id,
            decision=decision,
            decided_by=decided_by,
            decided_at=datetime.now(UTC),
            status="not_found",
            message="Change record was not found.",
        )

    if decision not in {APPROVE, REJECT}:
        return ApprovalDecision(
            change_id=change_id,
            client_id=client_id,
            decision=decision,
            decided_by=decided_by,
            decided_at=datetime.now(UTC),
            status="blocked",
            message="Decision must be approve or reject.",
        )

    if decision == APPROVE and _requires_preview_before_approval(change):
        return ApprovalDecision(
            change_id=change_id,
            client_id=client_id,
            decision=decision,
            decided_by=decided_by,
            decided_at=datetime.now(UTC),
            status="blocked",
            message="Preview is still building. Review the preview link before publishing.",
        )

    merge_result = None
    if decision == APPROVE and os.getenv("SORTED_UPDATES_ENABLE_NETWORK") == "1":
        # Extract branch name from preview_branch_plan stored in change execution
        branch_name = change.execution.get("preview_branch_plan", {}).get("branch_name")
        repo = change.execution.get("preview_branch_plan", {}).get("repo")
        if branch_name and repo:
            pr_number = _find_pr_number(repo, branch_name)
            if pr_number:
                merge_result = _github_merge_pr(repo, pr_number, f"sorted: {change.summary[:72]}")

    merge_ok = merge_result and "error" not in merge_result
    status = ("merged_to_main" if merge_ok else "approved_for_merge") if decision == APPROVE else "rejected"

    updated = change.model_copy(
        update={
            "status": status,
            "updated_at": datetime.now(UTC),
            "execution": {**change.execution, "decision": decision, "decided_by": decided_by, "merge_result": merge_result},
        }
    )
    memory.upsert_change(updated)

    if decision == APPROVE:
        message = "Change is live — Netlify is deploying now." if merge_ok else "Approved and queued for merge."
    else:
        message = "Preview rejected and left unapplied."

    return ApprovalDecision(
        change_id=change_id,
        client_id=client_id,
        decision=decision,
        decided_by=decided_by,
        decided_at=datetime.now(UTC),
        status=status,
        message=message,
    )


def find_change(memory: ConversationStore, client_id: str, change_id: str) -> ChangeRecord | None:
    for change in memory.list_changes(client_id):
        if change.change_id == change_id:
            return change
    return None


def _requires_preview_before_approval(change: ChangeRecord) -> bool:
    if change.preview_url:
        return False
    mode = change.execution.get("mode")
    has_preview_branch = bool(change.execution.get("preview_branch_plan", {}).get("branch_name"))
    return change.status == "preview_planned" or mode == "preview" or has_preview_branch

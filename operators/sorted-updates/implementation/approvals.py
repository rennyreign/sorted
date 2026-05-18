from __future__ import annotations

from datetime import UTC, datetime

from memory import ConversationStore
from models import ApprovalDecision, ChangeRecord


APPROVE = "approve"
REJECT = "reject"


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

    status = "approved_for_merge" if decision == APPROVE else "rejected"
    updated = change.model_copy(
        update={
            "status": status,
            "updated_at": datetime.now(UTC),
            "execution": {**change.execution, "decision": decision, "decided_by": decided_by},
        }
    )
    memory.upsert_change(updated)

    return ApprovalDecision(
        change_id=change_id,
        client_id=client_id,
        decision=decision,
        decided_by=decided_by,
        decided_at=datetime.now(UTC),
        status=status,
        message="Preview approved for merge." if decision == APPROVE else "Preview rejected and left unapplied.",
    )


def find_change(memory: ConversationStore, client_id: str, change_id: str) -> ChangeRecord | None:
    for change in memory.list_changes(client_id):
        if change.change_id == change_id:
            return change
    return None

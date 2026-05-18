from __future__ import annotations

from datetime import UTC, datetime

from config import load_client_config
from memory import ConversationStore
from models import ChangeRecord, ConversationMessage, ResetPlan
from providers import GitProvider, default_git_provider


RESET_CONFIRMATION = "RESTORE SORTED HANDOFF"
HANDOFF_TAG = "sorted-handoff"


def build_reset_plan(
    client_id: str,
    confirmation: str,
    *,
    git_provider: GitProvider | None = None,
) -> ResetPlan:
    config = load_client_config(client_id)
    if confirmation != RESET_CONFIRMATION:
        return ResetPlan(
            status="blocked",
            client_id=client_id,
            repo=config.repo,
            handoff_tag=HANDOFF_TAG,
            branch_name="",
            commit_message="",
            blocked_reasons=["typed confirmation required"],
        )

    git = git_provider or default_git_provider()
    git_plan = git.plan_reset_to_tag(config, HANDOFF_TAG)
    return ResetPlan(
        status="reset_planned",
        client_id=client_id,
        repo=config.repo,
        handoff_tag=HANDOFF_TAG,
        branch_name=git_plan["branch_name"],
        commit_message=f"Restore {client_id} to {HANDOFF_TAG}",
        blocked_reasons=[],
    )


def record_reset_plan(reset_plan: ResetPlan, *, store: ConversationStore | None = None) -> None:
    if reset_plan.status != "reset_planned":
        return

    memory = store or ConversationStore()
    now = datetime.now(UTC)
    message = ConversationMessage(
        id=f"reset_{reset_plan.client_id}_{int(now.timestamp())}",
        role="assistant",
        content=(
            "Your site reset has been planned against the Sorted handoff point. "
            "No post-handoff changes will be retained once the live reset executor is enabled."
        ),
        created_at=now,
        metadata={"handoff_tag": reset_plan.handoff_tag, "branch_name": reset_plan.branch_name},
    )
    memory.append_message(reset_plan.client_id, message)
    memory.upsert_change(
        ChangeRecord(
            change_id=f"reset_{reset_plan.client_id}_{int(now.timestamp())}",
            request_id=f"reset_{reset_plan.client_id}",
            client_id=reset_plan.client_id,
            status=reset_plan.status,
            summary=f"Restore code to {reset_plan.handoff_tag}.",
            created_at=now,
            updated_at=now,
            blocked_reasons=[],
            execution=reset_plan.model_dump(mode="json"),
        )
    )

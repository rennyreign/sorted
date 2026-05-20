from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from config import load_client_config
from execution import plan_change_execution
from master import EscalationQueue, build_escalation
from memory import ConversationStore
from models import (
    ChangeRecord,
    ConversationMessage,
    PortalChatRequest,
    PortalChatResponse,
)
from llm import llm_parse_update_request
from parser import dry_run_plan


def handle_portal_chat(
    request: PortalChatRequest,
    *,
    store: ConversationStore | None = None,
    escalation_queue: EscalationQueue | None = None,
) -> PortalChatResponse:
    config = load_client_config(request.session.client_id)
    memory = store or ConversationStore()
    escalations = escalation_queue or EscalationQueue()
    now = datetime.now(UTC)

    user_message = ConversationMessage(
        id=request.message_id,
        role="user",
        content=request.body,
        created_at=now,
        attachments=request.attachments,
        metadata={"source": "portal", "requested_mode": request.requested_mode},
    )
    memory.append_message(config.client_id, user_message)

    update_request = llm_parse_update_request(
        inbound_body=request.body,
        message_id=request.message_id,
        client_id=config.client_id,
        source="portal",
        config=config,
    )
    dry_run = dry_run_plan(update_request, config)
    llm_reply = getattr(update_request, "_suggested_reply", None)
    if llm_reply:
        dry_run = dry_run.model_copy(update={"suggested_whatsapp_reply": llm_reply})
    execution = plan_change_execution(update_request, dry_run, config, request.requested_mode)

    if execution.status == "escalation_required":
        reason = "; ".join(dry_run.blocked_reasons) or dry_run.status
        escalation = build_escalation(config.client_id, update_request.request_id, reason, dry_run.summary)
        escalations.enqueue(escalation)
        notification_results = escalations.notify(escalation)
    else:
        notification_results = []

    assistant_text = assistant_reply_for(dry_run.status, execution.status, dry_run.suggested_whatsapp_reply)
    assistant_message = ConversationMessage(
        id=f"assistant_{update_request.request_id}",
        role="assistant",
        content=assistant_text,
        created_at=datetime.now(UTC),
        metadata={"execution_status": execution.status},
    )
    memory.append_message(config.client_id, assistant_message)

    change = ChangeRecord(
        change_id=f"chg_{update_request.request_id}",
        request_id=update_request.request_id,
        client_id=config.client_id,
        status=execution.status,
        summary=dry_run.summary,
        created_at=now,
        updated_at=datetime.now(UTC),
        target_route=dry_run.target_route,
        preview_url=execution.preview_url,
        live_url=execution.live_url,
        blocked_reasons=dry_run.blocked_reasons,
        execution={
            "mode": execution.mode,
            "notification_results": notification_results,
            "preview_branch_plan": execution.preview_branch_plan.as_dict(),
        },
    )
    memory.upsert_change(change)

    return PortalChatResponse(
        status=execution.status,
        client_id=config.client_id,
        request_id=update_request.request_id,
        assistant_message=assistant_message,
        dry_run_plan=dry_run.model_dump(mode="json"),
        preview_branch_plan=execution.preview_branch_plan.as_dict(),
        change=change,
    )


def assistant_reply_for(dry_run_status: str, execution_status: str, fallback: str) -> str:
    if execution_status == "apply_planned":
        return "Sorted - this is safe to apply. I have queued it to go live."
    if execution_status == "preview_planned":
        return "Sorted - I have prepared this as a preview first. Review it before anything goes live."
    if execution_status == "clarification_required":
        return fallback
    if execution_status == "escalation_required":
        return "I can help, but this needs Sorted approval before anything changes. I have flagged it for review."
    if dry_run_status == "unsupported":
        return "I can help, but this falls outside the approved update menu. I have flagged it for review."
    return fallback


def portal_history(client_id: str, *, store: ConversationStore | None = None) -> dict[str, Any]:
    memory = store or ConversationStore()
    return {
        "client_id": client_id,
        "messages": [message.model_dump(mode="json") for message in memory.list_messages(client_id)],
        "changes": [change.model_dump(mode="json") for change in memory.list_changes(client_id)],
    }

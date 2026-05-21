from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class Attachment(BaseModel):
    model_config = ConfigDict(extra="allow")

    type: str | None = None
    url: str | None = None
    filename: str | None = None


class InboundMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source: str = "whatsapp"
    message_id: str
    from_phone: str | None = None
    from_name: str | None = None
    received_at: datetime
    body: str
    attachments: list[Attachment | dict[str, Any]] = Field(default_factory=list)
    client_id: str | None = None


class PortalSession(BaseModel):
    model_config = ConfigDict(extra="forbid")

    session_id: str
    client_id: str
    user_id: str | None = None
    email: str | None = None
    first_login: bool = False
    intro_completed: bool = False


class PortalChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    session: PortalSession
    message_id: str
    body: str
    attachments: list[Attachment | dict[str, Any]] = Field(default_factory=list)
    requested_mode: str = "auto"


class Classification(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: str
    confidence: float = Field(ge=0, le=1)
    requires_approval: bool = False
    requires_clarification: bool = False


class Intent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page_type: str | None = None
    target_route: str | None = None
    target_files: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)


class UpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    request_id: str
    client_id: str
    operator_id: str
    source: str
    raw_message: str
    classification: Classification
    intent: Intent
    status: str


class DryRunPlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str
    client_id: str
    operator_id: str
    request_type: str
    summary: str
    approval_required: bool
    clarification_required: bool = False
    target_route: str | None = None
    target_files: list[str] = Field(default_factory=list)
    proposed_actions: list[str] = Field(default_factory=list)
    blocked_reasons: list[str] = Field(default_factory=list)
    suggested_whatsapp_reply: str


class ConversationMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    role: str
    content: str
    created_at: datetime
    attachments: list[Attachment | dict[str, Any]] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ChangeRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    change_id: str
    request_id: str
    client_id: str
    status: str
    summary: str
    created_at: datetime
    updated_at: datetime
    target_route: str | None = None
    preview_url: str | None = None
    live_url: str | None = None
    blocked_reasons: list[str] = Field(default_factory=list)
    execution: dict[str, Any] = Field(default_factory=dict)


class PortalChatResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str
    client_id: str
    request_id: str
    assistant_message: ConversationMessage
    dry_run_plan: dict[str, Any]
    preview_branch_plan: dict[str, Any]
    change: ChangeRecord


class EscalationRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    escalation_id: str
    client_id: str
    request_id: str
    status: str
    reason: str
    summary: str
    created_at: datetime
    notification_channels: list[str] = Field(default_factory=list)


class ProvisioningPlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    client_id: str
    repo: str
    site_domain: str
    portal_routes: list[str]
    required_secrets: list[str]
    handoff_tag: str = "sorted-handoff"


class ResetPlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str
    client_id: str
    repo: str
    handoff_tag: str
    branch_name: str
    commit_message: str
    deploy_required: bool = True
    blocked_reasons: list[str] = Field(default_factory=list)


class ApprovalDecision(BaseModel):
    model_config = ConfigDict(extra="forbid")

    change_id: str
    client_id: str
    decision: str
    decided_by: str
    decided_at: datetime
    status: str
    message: str


class BrandConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    palette: list[str]
    tone: str
    primary_cta: str
    secondary_cta: str


class KnownContact(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    phone: str
    role: str


class ClientOperatorConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    client_id: str
    operator_id: str
    business_name: str
    site_route: str
    repo: str
    site_paths: dict[str, str]
    brand: BrandConfig
    allowed_update_types: list[str]
    predefined_pages: list[str]
    approval_required_for: list[str]
    known_contacts: list[KnownContact] = Field(default_factory=list)

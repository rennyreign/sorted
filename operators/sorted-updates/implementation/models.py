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


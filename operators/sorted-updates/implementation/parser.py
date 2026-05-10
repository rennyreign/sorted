from __future__ import annotations

import re
from datetime import UTC, datetime

from models import Classification, ClientOperatorConfig, DryRunPlan, InboundMessage, Intent, UpdateRequest
from policies import evaluate_policy, unsupported_reply


PAGE_ALIASES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("beginners", ("beginner", "beginners")),
    ("kids-classes", ("kids", "children")),
    ("womens-classes", ("women", "ladies", "female")),
    ("timetable", ("timetable", "schedule")),
    ("privacy", ("privacy",)),
    ("terms", ("terms",)),
    ("event", ("camp", "seminar", "event", "open day")),
)

DAYS = ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")
TIME_RE = re.compile(r"\b\d{1,2}(:\d{2})?\s?(am|pm)\b", re.IGNORECASE)


def build_cli_inbound(message: str, client_id: str | None = None) -> InboundMessage:
    return InboundMessage(
        source="whatsapp",
        message_id="cli_message",
        from_phone="+447000000000",
        from_name="CLI",
        received_at=datetime.now(UTC),
        body=message,
        attachments=[],
        client_id=client_id,
    )


def detect_page_type(text: str) -> str | None:
    lower = text.casefold()
    for page_type, aliases in PAGE_ALIASES:
        if any(alias in lower for alias in aliases):
            return page_type
    return None


def classify_request_type(text: str, page_type: str | None = None) -> tuple[str, float]:
    lower = text.casefold()

    if any(keyword in lower for keyword in ("price", "pricing", "membership", "\u00a3", "gbp")):
        return "pricing_update", 0.92
    if any(keyword in lower for keyword in ("payment", "checkout", "stripe")):
        return "payment_update", 0.9
    if "new booking system" in lower or "integration" in lower:
        return "integration_update", 0.9
    if "delete" in lower or "remove page" in lower:
        return "delete_page", 0.9
    if any(keyword in lower for keyword in ("phone", "number", "email", "address")):
        return "contact_update", 0.86
    if any(keyword in lower for keyword in ("testimonial", "review")):
        return "testimonial_update", 0.86
    if any(keyword in lower for keyword in ("timetable", "class time", "schedule")):
        return "timetable_update", 0.9
    if any(day in lower for day in DAYS) and TIME_RE.search(text):
        return "timetable_update", 0.84
    if any(keyword in lower for keyword in ("banner", "notice", "announcement")):
        return "announcement_banner", 0.88
    if any(keyword in lower for keyword in ("page", "add a page", "landing page")):
        return "predefined_page_addition", 0.9 if page_type else 0.76
    if any(keyword in lower for keyword in ("photo", "image", "gallery")):
        return "gallery_update", 0.84
    if any(keyword in lower for keyword in ("button", "cta", "link")):
        return "cta_update", 0.84

    return "unsupported", 0.35


def target_for_request(
    config: ClientOperatorConfig,
    request_type: str,
    page_type: str | None,
) -> tuple[str | None, list[str], list[str]]:
    app_root = config.site_paths["app_root"]
    components_path = config.site_paths["components"]
    public_assets = config.site_paths["public_assets"]
    missing: list[str] = []

    if request_type == "predefined_page_addition":
        if not page_type:
            missing.append("predefined_page_type")
            return None, [], missing
        if page_type not in config.predefined_pages:
            missing.append("approved_predefined_page_type")
            return None, [], missing
        return f"{config.site_route}/{page_type}", [f"{app_root}/{page_type}/page.tsx"], missing

    if request_type == "timetable_update":
        return f"{config.site_route}/timetable", [f"{app_root}/timetable/page.tsx"], missing
    if request_type == "announcement_banner":
        return config.site_route, [f"{components_path}/AnnouncementBanner.tsx", f"{app_root}/page.tsx"], missing
    if request_type == "gallery_update":
        return f"{config.site_route}/gallery", [f"{app_root}/gallery/page.tsx", public_assets], missing
    if request_type in {"contact_update", "testimonial_update", "cta_update"}:
        return config.site_route, [f"{app_root}/page.tsx"], missing

    return None, [], missing


def make_request_id(inbound: InboundMessage) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_]+", "_", inbound.message_id).strip("_").lower()
    return f"upd_{cleaned or 'message'}"


def parse_update_request(inbound: InboundMessage, config: ClientOperatorConfig) -> UpdateRequest:
    page_type = detect_page_type(inbound.body)
    request_type, confidence = classify_request_type(inbound.body, page_type=page_type)
    target_route, target_files, missing_information = target_for_request(config, request_type, page_type)
    policy = evaluate_policy(inbound.body, request_type=request_type, page_type=page_type)

    unsupported = request_type == "unsupported" or (
        request_type not in config.allowed_update_types and not policy.approval_required
    )
    requires_clarification = bool(missing_information) and not policy.approval_required and not unsupported

    status = "dry_run_ready"
    if unsupported:
        status = "unsupported"
    elif policy.approval_required:
        status = "approval_required"
    elif requires_clarification:
        status = "clarification_required"

    classification = Classification(
        type=request_type,
        confidence=confidence,
        requires_approval=policy.approval_required or unsupported,
        requires_clarification=requires_clarification,
    )
    intent = Intent(
        page_type=page_type,
        target_route=target_route,
        target_files=target_files,
        missing_information=missing_information,
    )

    return UpdateRequest(
        request_id=make_request_id(inbound),
        client_id=config.client_id,
        operator_id=config.operator_id,
        source=inbound.source,
        raw_message=inbound.body,
        classification=classification,
        intent=intent,
        status=status,
    )


def dry_run_plan(update_request: UpdateRequest, config: ClientOperatorConfig) -> DryRunPlan:
    policy = evaluate_policy(
        update_request.raw_message,
        request_type=update_request.classification.type,
        page_type=update_request.intent.page_type,
    )

    if update_request.status == "unsupported":
        return DryRunPlan(
            status="unsupported",
            client_id=config.client_id,
            operator_id=config.operator_id,
            request_type=update_request.classification.type,
            summary="Manual review needed because this request is outside the approved GB Halesowen update menu.",
            approval_required=True,
            clarification_required=False,
            target_route=update_request.intent.target_route,
            target_files=update_request.intent.target_files,
            proposed_actions=[],
            blocked_reasons=["unsupported request type"],
            suggested_whatsapp_reply=unsupported_reply(),
        )

    if update_request.status == "approval_required":
        return DryRunPlan(
            status="approval_required",
            client_id=config.client_id,
            operator_id=config.operator_id,
            request_type=update_request.classification.type,
            summary="Manual approval required before preparing this GB Halesowen website update.",
            approval_required=True,
            clarification_required=False,
            target_route=update_request.intent.target_route,
            target_files=update_request.intent.target_files,
            proposed_actions=[
                "Record the request against the GB Halesowen Operator.",
                "Ask for manual approval before any preview or apply step.",
                "Keep the current live site unchanged.",
            ],
            blocked_reasons=policy.blocked_reasons or ["manual approval required"],
            suggested_whatsapp_reply=(
                "I can prepare this as a preview, but it needs manual approval before anything changes."
            ),
        )

    if update_request.status == "clarification_required":
        return DryRunPlan(
            status="clarification_required",
            client_id=config.client_id,
            operator_id=config.operator_id,
            request_type=update_request.classification.type,
            summary="More detail is needed before this GB Halesowen update can be planned.",
            approval_required=False,
            clarification_required=True,
            target_route=update_request.intent.target_route,
            target_files=update_request.intent.target_files,
            proposed_actions=["Ask the owner for the missing page type or update detail."],
            blocked_reasons=[f"missing: {item}" for item in update_request.intent.missing_information],
            suggested_whatsapp_reply="Sorted - which approved page type should I prepare for the site?",
        )

    request_type = update_request.classification.type
    page_type = update_request.intent.page_type
    primary_cta = config.brand.primary_cta
    secondary_cta = config.brand.secondary_cta
    palette = ", ".join(config.brand.palette)

    summaries = {
        "predefined_page_addition": f"Add a new {page_type} page for {config.business_name}.",
        "timetable_update": f"Prepare a timetable update for {config.business_name}.",
        "contact_update": f"Prepare a contact detail update for {config.business_name}.",
        "testimonial_update": f"Prepare a testimonial update for {config.business_name}.",
        "announcement_banner": f"Prepare an announcement banner for {config.business_name}.",
        "gallery_update": f"Prepare a gallery update for {config.business_name}.",
        "cta_update": f"Prepare a call-to-action update for {config.business_name}.",
    }

    actions = {
        "predefined_page_addition": [
            f"Create {page_type} page using the approved GB Halesowen page template.",
            f"Reuse existing site CTA language: {primary_cta}.",
            f"Preserve existing {palette} visual system.",
        ],
        "timetable_update": [
            "Update the timetable page as a preview first.",
            f"Keep the secondary CTA available: {secondary_cta}.",
            "Preserve current programme naming unless the owner confirms a rename.",
        ],
        "contact_update": [
            "Update visible contact details in the GB Halesowen site copy.",
            "Check footer and contact sections for matching details.",
            "Return a preview summary before apply.",
        ],
        "testimonial_update": [
            "Add or adjust testimonial copy in the approved testimonial section.",
            "Keep tone supportive, local, and specific.",
            "Avoid inventing names, claims, or reviews.",
        ],
        "announcement_banner": [
            "Prepare a reusable announcement banner component.",
            "Place it only where it does not block primary booking actions.",
            "Keep the message short enough for mobile.",
        ],
        "gallery_update": [
            "Prepare gallery asset placement using provided images only.",
            "Keep image crops consistent with the current GB Halesowen style.",
            "Return a preview before any live asset changes.",
        ],
        "cta_update": [
            "Update CTA copy or link targets as a preview first.",
            "Keep booking-led conversion flow intact.",
            "Avoid payment or integration changes without approval.",
        ],
    }

    replies = {
        "predefined_page_addition": (
            f"Sorted - I can add a {page_type} page using the existing site style. "
            "I'll prepare the update as a preview first."
        ),
        "timetable_update": "Sorted - I can prepare that timetable update as a preview first.",
        "contact_update": "Sorted - I can prepare that contact update and show you the preview first.",
        "testimonial_update": "Sorted - I can add that testimonial as a preview first.",
        "announcement_banner": "Sorted - I can prepare a short announcement banner preview for the site.",
        "gallery_update": "Sorted - I can prepare the gallery update as a preview first.",
        "cta_update": "Sorted - I can prepare that CTA update as a preview first.",
    }

    return DryRunPlan(
        status="dry_run_ready",
        client_id=config.client_id,
        operator_id=config.operator_id,
        request_type=request_type,
        summary=summaries.get(request_type, f"Prepare a website update for {config.business_name}."),
        approval_required=False,
        clarification_required=False,
        target_route=update_request.intent.target_route,
        target_files=update_request.intent.target_files,
        proposed_actions=actions.get(request_type, ["Prepare a safe preview for manual review."]),
        blocked_reasons=[],
        suggested_whatsapp_reply=replies.get(request_type, "Sorted - I can prepare that as a preview first."),
    )

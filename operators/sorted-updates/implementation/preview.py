from __future__ import annotations

import re
from dataclasses import dataclass

from models import ClientOperatorConfig, DryRunPlan, UpdateRequest


@dataclass(frozen=True)
class PreviewBranchPlan:
    status: str
    client_id: str
    operator_id: str
    request_id: str
    branch_name: str | None
    pr_title: str | None
    pr_body: str | None
    target_files: list[str]
    blocked_reasons: list[str]

    def as_dict(self) -> dict:
        return {
            "status": self.status,
            "client_id": self.client_id,
            "operator_id": self.operator_id,
            "request_id": self.request_id,
            "branch_name": self.branch_name,
            "pr_title": self.pr_title,
            "pr_body": self.pr_body,
            "target_files": self.target_files,
            "blocked_reasons": self.blocked_reasons,
        }


def build_preview_branch_plan(
    update_request: UpdateRequest,
    dry_run: DryRunPlan,
    config: ClientOperatorConfig,
) -> PreviewBranchPlan:
    blocked = preview_blockers(dry_run, config)
    branch_name = None
    pr_title = None
    pr_body = None

    if not blocked:
        branch_name = branch_name_for(update_request)
        pr_title = f"Sorted Updates: {config.client_id} {dry_run.request_type}"
        pr_body = pr_body_for(update_request, dry_run)

    return PreviewBranchPlan(
        status="preview_plan_ready" if not blocked else "preview_blocked",
        client_id=config.client_id,
        operator_id=config.operator_id,
        request_id=update_request.request_id,
        branch_name=branch_name,
        pr_title=pr_title,
        pr_body=pr_body,
        target_files=dry_run.target_files,
        blocked_reasons=blocked,
    )


def preview_blockers(dry_run: DryRunPlan, config: ClientOperatorConfig) -> list[str]:
    blocked: list[str] = []
    if dry_run.status != "dry_run_ready":
        blocked.append(f"dry-run status is {dry_run.status}")
    if dry_run.approval_required:
        blocked.append("request requires approval")
    if dry_run.clarification_required:
        blocked.append("request requires clarification")

    for target_file in dry_run.target_files:
        if not target_is_allowed(target_file, config):
            blocked.append(f"target file is outside allowed client paths: {target_file}")

    return blocked


def target_is_allowed(target_file: str, config: ClientOperatorConfig) -> bool:
    normalised = target_file.strip().strip("/")
    allowed_roots = [
        config.site_paths["app_root"].strip("/"),
        config.site_paths["components"].strip("/"),
        config.site_paths["public_assets"].strip("/"),
        config.site_paths["client_context"].strip("/"),
    ]
    return any(normalised == root or normalised.startswith(f"{root}/") for root in allowed_roots)


def branch_name_for(update_request: UpdateRequest) -> str:
    request_id = slug_part(update_request.request_id)
    request_type = slug_part(update_request.classification.type)
    return f"sorted-updates/{update_request.client_id}/{request_id}-{request_type}"


def slug_part(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_-]+", "-", value).strip("-").lower()
    return cleaned or "request"


def pr_body_for(update_request: UpdateRequest, dry_run: DryRunPlan) -> str:
    target_files = "\n".join(f"- `{path}`" for path in dry_run.target_files) or "- None"
    blocked_reasons = "\n".join(f"- {reason}" for reason in dry_run.blocked_reasons) or "- None"
    return "\n".join(
        [
            "## Sorted Updates Preview",
            "",
            f"Client: `{update_request.client_id}`",
            f"Operator: `{update_request.operator_id}`",
            f"Request: {update_request.raw_message}",
            "Status: preview branch",
            "",
            "### Dry-run summary",
            dry_run.summary,
            "",
            "### Target files",
            target_files,
            "",
            "### Safety notes",
            blocked_reasons,
            "",
            "### Owner approval",
            "Pending Renaldo review.",
        ]
    )


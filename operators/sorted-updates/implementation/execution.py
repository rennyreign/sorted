from __future__ import annotations

from dataclasses import dataclass

from models import ClientOperatorConfig, DryRunPlan, UpdateRequest
from preview import PreviewBranchPlan, build_preview_branch_plan
from providers import DeployProvider, GitProvider, default_deploy_provider, default_git_provider
from writer import write_preview_edits


@dataclass(frozen=True)
class ExecutionPlan:
    status: str
    mode: str
    preview_url: str | None
    live_url: str | None
    preview_branch_plan: PreviewBranchPlan
    branch_result: dict | None = None

    def as_dict(self) -> dict:
        return {
            "status": self.status,
            "mode": self.mode,
            "preview_url": self.preview_url,
            "live_url": self.live_url,
            "preview_branch_plan": self.preview_branch_plan.as_dict(),
            "branch_result": self.branch_result,
        }


def plan_change_execution(
    update_request: UpdateRequest,
    dry_run: DryRunPlan,
    config: ClientOperatorConfig,
    requested_mode: str = "auto",
    git_provider: GitProvider | None = None,
    deploy_provider: DeployProvider | None = None,
) -> ExecutionPlan:
    preview_plan = build_preview_branch_plan(update_request, dry_run, config)
    git = git_provider or default_git_provider()
    deploy = deploy_provider or default_deploy_provider()

    if dry_run.approval_required or dry_run.status in {"approval_required", "unsupported"}:
        return ExecutionPlan(
            status="escalation_required",
            mode="escalate",
            preview_url=None,
            live_url=None,
            preview_branch_plan=preview_plan,
        )

    if dry_run.clarification_required:
        return ExecutionPlan(
            status="clarification_required",
            mode="clarify",
            preview_url=None,
            live_url=None,
            preview_branch_plan=preview_plan,
        )

    if should_auto_apply(dry_run, requested_mode=requested_mode):
        return ExecutionPlan(
            status="apply_planned",
            mode="auto_apply",
            preview_url=None,
            live_url=live_url_for(config, dry_run),
            preview_branch_plan=preview_plan,
        )

    branch_result: dict | None = None
    if preview_plan.status == "preview_plan_ready":
        branch_result = git.prepare_preview_branch(config, preview_plan)
        # If branch was actually created (network enabled), write the file edits
        if branch_result.get("status") == "branch_created" and preview_plan.branch_name:
            writer_result = write_preview_edits(update_request, dry_run, config, preview_plan.branch_name)
            branch_result = {**branch_result, "writer_result": writer_result}

    return ExecutionPlan(
        status="preview_planned" if preview_plan.status == "preview_plan_ready" else "preview_blocked",
        mode="preview",
        preview_url=preview_url_for(config, preview_plan, deploy),
        live_url=None,
        preview_branch_plan=preview_plan,
        branch_result=branch_result,
    )


def should_auto_apply(dry_run: DryRunPlan, requested_mode: str = "auto") -> bool:
    if requested_mode == "preview":
        return False
    if dry_run.status != "dry_run_ready":
        return False
    return dry_run.request_type in {
        "contact_update",
        "testimonial_update",
        "announcement_banner",
        "cta_update",
    }


def preview_url_for(
    config: ClientOperatorConfig,
    preview_plan: PreviewBranchPlan,
    deploy_provider: DeployProvider | None = None,
) -> str | None:
    if preview_plan.status != "preview_plan_ready" or not preview_plan.branch_name:
        return None
    deploy = deploy_provider or default_deploy_provider()
    return deploy.preview_url(config, preview_plan.branch_name)


def live_url_for(config: ClientOperatorConfig, dry_run: DryRunPlan) -> str:
    route = dry_run.target_route or config.site_route
    return f"https://{config.client_id}.sorted.local{route}"

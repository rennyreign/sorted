from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Protocol

from models import ClientOperatorConfig
from preview import PreviewBranchPlan


class GitProvider(Protocol):
    def prepare_preview_branch(self, config: ClientOperatorConfig, preview: PreviewBranchPlan) -> dict:
        ...

    def plan_reset_to_tag(self, config: ClientOperatorConfig, handoff_tag: str) -> dict:
        ...


class DeployProvider(Protocol):
    def preview_url(self, config: ClientOperatorConfig, branch_name: str) -> str:
        ...

    def trigger_deploy(self, config: ClientOperatorConfig, ref: str) -> dict:
        ...


class NotificationProvider(Protocol):
    def send_escalation(self, payload: dict) -> list[dict]:
        ...


@dataclass(frozen=True)
class PlannedGitHubProvider:
    enabled: bool = False

    def prepare_preview_branch(self, config: ClientOperatorConfig, preview: PreviewBranchPlan) -> dict:
        if preview.status != "preview_plan_ready" or not preview.branch_name:
            return {"status": "blocked", "blocked_reasons": preview.blocked_reasons}
        return {
            "status": "planned",
            "provider": "github",
            "repo": config.repo,
            "branch_name": preview.branch_name,
            "pr_title": preview.pr_title,
            "target_files": preview.target_files,
            "network_enabled": self.enabled,
        }

    def plan_reset_to_tag(self, config: ClientOperatorConfig, handoff_tag: str) -> dict:
        return {
            "status": "planned",
            "provider": "github",
            "repo": config.repo,
            "source_tag": handoff_tag,
            "branch_name": f"sorted-reset/{config.client_id}/{handoff_tag}",
            "network_enabled": self.enabled,
        }


@dataclass(frozen=True)
class PlannedNetlifyProvider:
    enabled: bool = False

    def preview_url(self, config: ClientOperatorConfig, branch_name: str) -> str:
        slug = branch_name.replace("/", "--")
        site_id = os.getenv("NETLIFY_SITE_ID") or config.client_id
        return f"https://{slug}--{site_id}.netlify.app"

    def trigger_deploy(self, config: ClientOperatorConfig, ref: str) -> dict:
        return {
            "status": "planned",
            "provider": "netlify",
            "site": config.client_id,
            "ref": ref,
            "network_enabled": self.enabled,
        }


@dataclass(frozen=True)
class PlannedNotificationProvider:
    channels: tuple[str, ...] = ("email", "whatsapp", "dashboard")
    enabled: bool = False

    def send_escalation(self, payload: dict) -> list[dict]:
        return [
            {
                "status": "planned",
                "provider": channel,
                "request_id": payload.get("request_id"),
                "network_enabled": self.enabled,
            }
            for channel in self.channels
        ]


def default_git_provider() -> GitProvider:
    return PlannedGitHubProvider(enabled=os.getenv("SORTED_UPDATES_ENABLE_NETWORK") == "1")


def default_deploy_provider() -> DeployProvider:
    return PlannedNetlifyProvider(enabled=os.getenv("SORTED_UPDATES_ENABLE_NETWORK") == "1")


def default_notification_provider() -> NotificationProvider:
    return PlannedNotificationProvider(enabled=os.getenv("SORTED_UPDATES_ENABLE_NETWORK") == "1")

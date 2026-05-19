from __future__ import annotations

import json
import os
import urllib.request
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


def _github_api(method: str, path: str, body: dict | None = None) -> dict:
    token = os.getenv("GITHUB_TOKEN", "")
    url = f"https://api.github.com{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url, data=data, method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "message": e.read().decode()}


@dataclass(frozen=True)
class PlannedGitHubProvider:
    enabled: bool = False

    def prepare_preview_branch(self, config: ClientOperatorConfig, preview: PreviewBranchPlan) -> dict:
        if preview.status != "preview_plan_ready" or not preview.branch_name:
            return {"status": "blocked", "blocked_reasons": preview.blocked_reasons}

        if not self.enabled:
            return {
                "status": "planned",
                "provider": "github",
                "repo": config.repo,
                "branch_name": preview.branch_name,
                "pr_title": preview.pr_title,
                "target_files": preview.target_files,
                "network_enabled": False,
            }

        repo = config.repo
        branch = preview.branch_name

        # Get current SHA of main
        ref_data = _github_api("GET", f"/repos/{repo}/git/ref/heads/main")
        if "error" in ref_data:
            return {"status": "error", "message": f"Could not get main ref: {ref_data}"}
        sha = ref_data["object"]["sha"]

        # Create the branch
        create = _github_api("POST", f"/repos/{repo}/git/refs", {
            "ref": f"refs/heads/{branch}",
            "sha": sha,
        })
        if "error" in create and create["error"] != 422:
            return {"status": "error", "message": f"Branch creation failed: {create}"}

        # Open a PR
        pr = _github_api("POST", f"/repos/{repo}/pulls", {
            "title": preview.pr_title or f"Sorted preview: {preview.request_id}",
            "body": preview.pr_body or "",
            "head": branch,
            "base": "main",
            "draft": True,
        })

        return {
            "status": "branch_created",
            "provider": "github",
            "repo": repo,
            "branch_name": branch,
            "pr_url": pr.get("html_url"),
            "pr_number": pr.get("number"),
            "network_enabled": True,
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

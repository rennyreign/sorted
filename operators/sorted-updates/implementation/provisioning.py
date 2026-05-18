from __future__ import annotations

from models import ClientOperatorConfig, ProvisioningPlan


PORTAL_ROUTES = ["/sorted", "/sorted/chat", "/sorted/history", "/sorted/preview", "/sorted/reset"]


def build_provisioning_plan(config: ClientOperatorConfig, site_domain: str) -> ProvisioningPlan:
    return ProvisioningPlan(
        client_id=config.client_id,
        repo=config.repo,
        site_domain=site_domain,
        portal_routes=[f"https://{site_domain}{route}" for route in PORTAL_ROUTES],
        required_secrets=[
            "SUPABASE_URL",
            "SUPABASE_SERVICE_ROLE_KEY",
            "GITHUB_APP_ID",
            "GITHUB_APP_PRIVATE_KEY",
            "NETLIFY_AUTH_TOKEN",
            "RESEND_API_KEY",
            "META_WHATSAPP_ACCESS_TOKEN",
        ],
    )


def handoff_tag_command() -> str:
    return 'git tag -a sorted-handoff -m "Sorted approved handoff"'

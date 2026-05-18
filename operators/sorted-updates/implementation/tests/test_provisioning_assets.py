from __future__ import annotations

from assets import plan_asset_ingestion
from config import load_client_config
from models import Attachment
from provisioning import build_provisioning_plan


def test_build_provisioning_plan_lists_portal_routes_and_secrets():
    config = load_client_config("gbhalesowen")

    plan = build_provisioning_plan(config, "gbhalesowen.com")

    assert "https://gbhalesowen.com/sorted/chat" in plan.portal_routes
    assert "SUPABASE_URL" in plan.required_secrets
    assert plan.handoff_tag == "sorted-handoff"


def test_image_asset_ingestion_plans_crop_pipeline():
    config = load_client_config("gbhalesowen")
    attachment = Attachment(type="image/jpeg", filename="hero.jpg", url="https://example.com/hero.jpg")

    plan = plan_asset_ingestion(attachment, config)

    assert plan.status == "asset_plan_ready"
    assert plan.storage_key == "gbhalesowen/uploads/hero.jpg"
    assert "crop safely" in plan.optimisation_steps

from __future__ import annotations

from dataclasses import dataclass
from pathlib import PurePosixPath

from models import Attachment, ClientOperatorConfig


ALLOWED_MEDIA_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}


@dataclass(frozen=True)
class AssetIngestionPlan:
    status: str
    storage_key: str | None
    optimisation_steps: list[str]
    blocked_reasons: list[str]

    def as_dict(self) -> dict:
        return {
            "status": self.status,
            "storage_key": self.storage_key,
            "optimisation_steps": self.optimisation_steps,
            "blocked_reasons": self.blocked_reasons,
        }


def plan_asset_ingestion(attachment: Attachment, config: ClientOperatorConfig) -> AssetIngestionPlan:
    media_type = attachment.type or ""
    filename = attachment.filename or "upload"
    if media_type and media_type not in ALLOWED_MEDIA_TYPES:
        return AssetIngestionPlan(
            status="blocked",
            storage_key=None,
            optimisation_steps=[],
            blocked_reasons=[f"unsupported media type: {media_type}"],
        )

    storage_key = str(PurePosixPath(config.client_id) / "uploads" / filename)
    steps = ["store original asset", "scan asset metadata"]
    if media_type.startswith("image/"):
        steps.extend(["detect target aspect ratio", "crop safely", "optimise for web"])
    if media_type == "application/pdf":
        steps.append("store PDF for linking or embedding")

    return AssetIngestionPlan(
        status="asset_plan_ready",
        storage_key=storage_key,
        optimisation_steps=steps,
        blocked_reasons=[],
    )

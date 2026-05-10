from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from models import ClientOperatorConfig


BASE_DIR = Path(__file__).resolve().parent
CLIENTS_DIR = BASE_DIR / "clients"


class ConfigError(RuntimeError):
    pass


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ConfigError(f"Missing config file: {path}") from exc
    except json.JSONDecodeError as exc:
        raise ConfigError(f"Invalid JSON in {path}: {exc}") from exc


def load_client_config(client_id: str) -> ClientOperatorConfig:
    path = CLIENTS_DIR / client_id / "operator.json"
    return ClientOperatorConfig.model_validate(load_json(path))


def load_client_memory(client_id: str) -> dict[str, Any]:
    path = CLIENTS_DIR / client_id / "memory.json"
    return load_json(path)


def list_client_configs() -> list[ClientOperatorConfig]:
    configs: list[ClientOperatorConfig] = []
    if not CLIENTS_DIR.exists():
        return configs

    for operator_path in sorted(CLIENTS_DIR.glob("*/operator.json")):
        configs.append(ClientOperatorConfig.model_validate(load_json(operator_path)))
    return configs


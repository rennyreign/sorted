"""Prepare a local, read-only prospect research dossier.

This is the harness runtime for the Prospect Research operator. It makes no
model calls and performs no database writes. The generated artifacts are the
stable handoff contract for local skill execution today and an autonomous
runtime later.

Usage:
    ./venv/bin/python research_harness.py prepare --id 1826
    ./venv/bin/python research_harness.py prepare --id 1826 --stdout
"""

from __future__ import annotations

import argparse
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv


HERE = Path(__file__).resolve().parent
load_dotenv(HERE / ".env")


def _base_url() -> str:
    value = os.getenv("SUPABASE_URL", "").rstrip("/")
    if not value:
        raise RuntimeError("SUPABASE_URL is not configured")
    return value


def _headers() -> dict[str, str]:
    key = os.getenv("SUPABASE_SERVICE_KEY", "")
    if not key:
        raise RuntimeError("SUPABASE_SERVICE_KEY is not configured")
    return {"apikey": key, "Authorization": f"Bearer {key}"}


def _get(table: str, params: dict[str, str]) -> list[dict[str, Any]]:
    response = requests.get(
        f"{_base_url()}/rest/v1/{table}",
        headers=_headers(),
        params=params,
        timeout=20,
    )
    if response.status_code == 401:
        raise PermissionError("Supabase authentication failed; check SUPABASE_SERVICE_KEY")
    if not response.ok:
        raise RuntimeError(f"Could not read {table} (HTTP {response.status_code}): {response.text[:300]}")
    return response.json()


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60] or "prospect"


def _first(rows: list[dict[str, Any]]) -> dict[str, Any] | None:
    return rows[0] if rows else None


def fetch_dossier(prospect_id: int) -> dict[str, Any]:
    prospect = _first(_get("prospects", {"select": "*", "id": f"eq.{prospect_id}", "limit": "1"}))
    if prospect is None:
        raise RuntimeError(f"No prospect found with id {prospect_id}")

    workflow = _first(_get("prospect_workflow", {
        "select": "*", "prospect_id": f"eq.{prospect_id}", "limit": "1"
    }))
    financial_reviews = _get("prospect_financial_reviews", {
        "select": "*", "prospect_id": f"eq.{prospect_id}", "order": "created_at.desc"
    })
    contacts = _get("prospect_contacts", {
        "select": "*", "prospect_id": f"eq.{prospect_id}", "order": "is_primary.desc,created_at.asc"
    })
    activity = _get("prospect_activity", {
        "select": "*", "prospect_id": f"eq.{prospect_id}", "order": "created_at.desc", "limit": "100"
    })

    return {
        "schema_version": "prospect-dossier.v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "prospect": prospect,
        "workflow": workflow,
        "financial_reviews": financial_reviews,
        "contacts": contacts,
        "activity": activity,
    }


def _value(value: Any, fallback: str = "Not recorded") -> str:
    if value is None or value == "" or value == []:
        return fallback
    if isinstance(value, list):
        return "; ".join(str(item) for item in value)
    return str(value)


def render_build_brief(dossier: dict[str, Any]) -> str:
    p = dossier["prospect"]
    w = dossier.get("workflow") or {}
    reviews = dossier.get("financial_reviews") or []
    contacts = dossier.get("contacts") or []
    latest = reviews[0] if reviews else {}
    primary = next((item for item in contacts if item.get("is_primary")), contacts[0] if contacts else {})
    weaknesses = p.get("site_weaknesses") or p.get("weaknesses") or []

    return f"""# Prospect dossier — {_value(p.get('name'), 'Unknown business')}

Generated: {dossier['generated_at']}
Prospect ID: {p['id']}

## Identity

- Business: {_value(p.get('name'))}
- Category: {_value(p.get('category'))}
- Location: {_value(p.get('city') or p.get('search_location'))}
- Website: {_value(p.get('website'))}
- Companies House: {_value(p.get('source_url'))}
- Company number: {_value(p.get('source_company_number'))}

## Why it was scouted

- Prospect score: {_value(p.get('prospect_score'))}
- Site score: {_value(p.get('site_score'))}
- Opportunity score: {_value(p.get('opportunity_score'))}
- Outreach angle: {_value(p.get('outreach_angle'))}
- Observed site gaps: {_value(weaknesses)}

## Human scouting decision

- Research status: {_value(w.get('research_status'), 'unreviewed')}
- Decision: {_value(w.get('scout_decision'), 'undecided')}
- Priority: {_value(w.get('scout_priority'))}
- Evidence: {_value(w.get('decision_reason'))}
- Next action: {_value(w.get('next_action_type'))} at {_value(w.get('next_action_at'))}
- Next-action note: {_value(w.get('next_action_note'))}

## Latest financial evidence

- Filing / period: {_value(latest.get('filing_date') or latest.get('period_end'))}
- Accounts type: {_value(latest.get('accounts_type') or p.get('ch_accounts_type'))}
- Automatically extracted turnover: {_value(p.get('ch_turnover'), 'Not publicly disclosed')}
- Automatically extracted net assets: {_value(p.get('ch_net_assets'))}
- Automatically extracted current assets: {_value(p.get('ch_current_assets'))}
- Automatically extracted cash: {_value(p.get('ch_cash'), 'Not separately disclosed')}
- Automatically extracted liabilities: {_value(p.get('ch_liabilities'), 'Not separately disclosed')}
- Automatically extracted employees: {_value(p.get('ch_employees'))}
- Strength / trajectory: {_value(latest.get('financial_strength'))} / {_value(latest.get('trajectory'))}
- Turnover: {_value(latest.get('turnover'))} {_value(latest.get('currency'), '')}
- Net assets: {_value(latest.get('net_assets'))} {_value(latest.get('currency'), '')}
- Cash or reserves: {_value(latest.get('cash_or_reserves'))} {_value(latest.get('currency'), '')}
- Evidence note: {_value(latest.get('summary'))}
- Source: {_value(latest.get('source_url'))}

Do not infer revenue from cash, reserves, assets, company-size thresholds, or abbreviated accounts. Use only figures explicitly supported by the filing.

## Primary contact

- Name: {_value(primary.get('name'))}
- Role: {_value(primary.get('role'))}
- Email: {_value(primary.get('email'))}
- Phone: {_value(primary.get('phone'))}
- LinkedIn: {_value(primary.get('linkedin_url'))}
- Verification: {_value(primary.get('verification_status'))}

## Build handoff

- Existing mockup: {_value(p.get('mockup_url'))}
- Review workspace: {_value(p.get('review_slug'))}
- Decision context to preserve: {_value(w.get('decision_reason'))}
- Specific gap to address: {_value(p.get('outreach_angle'))}

Before starting a mockup or build, confirm the decision is `priority`, the evidence is current, and the intended conversion action is explicit.
"""


def cmd_prepare(args: argparse.Namespace) -> int:
    dossier = fetch_dossier(args.id)
    p = dossier["prospect"]
    outdir = Path(args.outdir) if args.outdir else HERE / "dossiers" / f"{p['id']}-{_slug(p.get('name') or 'prospect')}"
    outdir.mkdir(parents=True, exist_ok=True)
    dossier_path = outdir / "dossier.json"
    brief_path = outdir / "build-brief.md"
    dossier_path.write_text(json.dumps(dossier, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    brief = render_build_brief(dossier)
    brief_path.write_text(brief, encoding="utf-8")
    if args.stdout:
        print(brief)
    print(f"Dossier: {dossier_path}")
    print(f"Build brief: {brief_path}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Prepare a read-only local prospect dossier")
    subparsers = parser.add_subparsers(dest="command", required=True)
    prepare = subparsers.add_parser("prepare", help="fetch one prospect and write dossier artifacts")
    prepare.add_argument("--id", required=True, type=int, help="prospects.id")
    prepare.add_argument("--outdir", help="override the dossier output directory")
    prepare.add_argument("--stdout", action="store_true", help="also print the Markdown brief")
    prepare.set_defaults(func=cmd_prepare)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        return args.func(args)
    except (RuntimeError, PermissionError, requests.RequestException) as exc:
        print(f"Error: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

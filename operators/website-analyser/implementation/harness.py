"""
Website Analyser — Devin harness mode.

A second execution mode where Devin itself reads the screenshots and
produces the analysis JSON, instead of calling the vision API (Haiku)
in analyser/vision.py.

Three subcommands:

  prepare        — fetch the prospect, run tech profile + screenshots +
                   Companies House, render the vision prompt, and write a
                   bundle directory (bundle.json + desktop.png + mobile.png)
                   for the agent to analyse.
  prepare-batch  — same prepare logic over a batch of unanalysed prospects
                   (bundles/<id>-<hostslug>/ + bundles/manifest.json).
  commit         — read the agent-written analysis.json from a bundle,
             validate it, run qualify() (all arithmetic lives there),
             build the record exactly like main.py, and write it via
             storage/supabase.write_analysis.

Nothing here reimplements scoring, storage or capture — it reuses
analyser.qualify, analyser.tech, analyser.screenshot,
analyser.companies_house, analyser.prompt and storage.supabase.

Usage:
    ./venv/bin/python harness.py prepare --id 1826
    ./venv/bin/python harness.py prepare --url https://example.com --name "Acme"
    ./venv/bin/python harness.py commit --bundle bundles/acme/ [--dry-run]
"""

import argparse
import json
import logging
import os
import re
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()  # same env loading as main.py

from analyser.companies_house import check as check_companies_house
from analyser.prompt import SYSTEM_PROMPT, USER_PROMPT
from analyser.qualify import qualify
from analyser.screenshot import capture
from analyser.tech import profile as profile_tech
from storage.supabase import (
    _get_base_url,
    _get_headers,
    fetch_unanalysed,
    write_analysis,
    TABLE,
)

log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("website-analyser.harness")

# Same column list fetch_unanalysed uses.
PROSPECT_SELECT = (
    "id,place_id,name,category,intake_category,intake_priority,city,"
    "website,postcode,rating,review_count,search_location,"
    "source_company_number"
)
# Fallback when the intake_* columns don't exist (same as fetch_unanalysed).
PROSPECT_SELECT_FALLBACK = (
    "id,place_id,name,category,city,website,postcode,rating,"
    "review_count,search_location,source_company_number"
)


def _select_prospect(params: dict) -> dict:
    """GET a single prospect row; falls back if intake_* columns are absent."""
    url = f"{_get_base_url()}/rest/v1/{TABLE}"
    params = {"select": PROSPECT_SELECT, "limit": "1", **params}
    resp = requests.get(url, headers=_get_headers(), params=params, timeout=15)
    if not resp.ok and "intake_" in resp.text:
        params["select"] = PROSPECT_SELECT_FALLBACK
        resp = requests.get(url, headers=_get_headers(), params=params, timeout=15)
    if resp.status_code == 401:
        raise PermissionError("Supabase authentication failed. Check SUPABASE_SERVICE_KEY.")
    if not resp.ok:
        raise RuntimeError(f"Supabase fetch error — HTTP {resp.status_code}: {resp.text[:300]}")
    rows = resp.json()
    if not rows:
        raise RuntimeError(f"No prospect row found for {params}")
    return rows[0]

REQUIRED_DIMS = (
    "visual_modernity",
    "mobile_experience",
    "desire_creation",
    "content_structure",
    "trust_and_credibility",
)
# Keys the analysis must contain for qualify() to compute anything.
FATAL_KEYS = ("opportunity_dimensions", "business_quality_score")
# Keys expected per prompt.py's Output format — warned if absent.
EXPECTED_KEYS = (
    "opportunity_dimensions",
    "business_quality_score",
    "service_price_point",
    "site_weaknesses",
    "site_analysis",
    "review_summary",
    "outreach_angle",
    "modernity_gap",
)


# ---------------------------------------------------------------------------
# prepare
# ---------------------------------------------------------------------------


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:60] or "bundle"


def _slug_for(url: str | None, row_id: int | None, place_id: str | None) -> str:
    """Bundle dir slug: '<row_id>-<hostslug>' when a DB row exists (the id
    prefix guarantees uniqueness, the host slug keeps it human-readable);
    otherwise fall back to host slug alone, then place_id/row_id."""
    host_slug = None
    if url:
        host = re.sub(r"^https?://", "", url).split("/")[0]
        host = host.removeprefix("www.")
        host_slug = _slugify(host)
    if row_id is not None:
        return f"{row_id}-{host_slug or 'bundle'}"
    if host_slug:
        return host_slug
    return _slugify(str(place_id or "bundle"))


def _fetch_prospect_by_id(row_id: int) -> dict:
    """REST select for a single prospect row by primary key."""
    return _select_prospect({"id": f"eq.{row_id}"})


def _fetch_prospect_by_place_id(place_id: str) -> dict:
    return _select_prospect({"place_id": f"eq.{place_id}"})


def cmd_prepare(args: argparse.Namespace) -> int:
    # --- resolve the prospect -------------------------------------------
    if args.id is not None:
        prospect = _fetch_prospect_by_id(args.id)
    elif args.place_id:
        prospect = _fetch_prospect_by_place_id(args.place_id)
    elif args.url:
        prospect = {
            "id": None,
            "place_id": args.place_id,
            "name": args.name,
            "category": args.category,
            "city": args.location,
            "website": args.url,
            "postcode": args.postcode,
            "search_location": args.location,
        }
    else:
        logger.error("prepare needs --id, --place-id, or --url.")
        return 2

    url = args.url or prospect.get("website")
    name = prospect.get("name") or args.name or "Unknown"
    category = prospect.get("category") or args.category or "local business"
    location = prospect.get("city") or prospect.get("search_location") or args.location or "UK"

    outdir = Path(args.outdir) if args.outdir else Path("bundles") / _slug_for(
        url, prospect.get("id"), prospect.get("place_id")
    )

    rc = prepare_one(prospect, url, name, category, location, args.no_ch, outdir)
    if rc != 0:
        if not url:
            logger.error(
                "Prospect %s has no website URL.",
                prospect.get("id") or prospect.get("place_id"),
            )
            return 2
        return rc
    return 0


def prepare_one(
    prospect: dict,
    url: str | None,
    name: str,
    category: str,
    location: str,
    no_ch: bool,
    outdir: Path,
) -> int:
    """Shared prepare logic for `prepare` and `prepare-batch`.

    Runs tech profile + screenshots + Companies House and writes the bundle
    (bundle.json + pngs) into `outdir`. Returns 0 on success, 1 on capture
    failure, 2 when the prospect has no website URL. Per-row callers must
    treat non-zero as "skip this row", not abort.
    """
    if not url:
        return 2
    outdir.mkdir(parents=True, exist_ok=True)

    logger.info("Preparing bundle for %s (%s) → %s", name, url, outdir)

    # --- tech profile ----------------------------------------------------
    tech = profile_tech(url)
    if not tech.get("fetch_ok"):
        logger.warning("No HTML fetched for %s — tech profile empty, continuing.", url)

    # --- screenshots ------------------------------------------------------
    images: dict[str, str] = {}
    desktop_path = outdir / "desktop.png"
    try:
        desktop_path.write_bytes(capture(url, full_page=True))
        images["desktop"] = "desktop.png"
        logger.info("Desktop capture (full_page) → %s (%d bytes)", desktop_path, desktop_path.stat().st_size)
    except Exception as exc:
        logger.error("Desktop screenshot failed for %s: %s", url, exc)
        if tech.get("site_down"):
            logger.error(
                "Site appears DOWN — do not continue with harness mode. "
                "Run main.py so the site-down record path is used instead."
            )
        return 1

    mobile_path = outdir / "mobile.png"
    try:
        mobile_path.write_bytes(capture(url, mobile=True))
        images["mobile"] = "mobile.png"
        logger.info("Mobile capture (above-fold) → %s (%d bytes)", mobile_path, mobile_path.stat().st_size)
    except Exception as exc:
        logger.warning("Mobile screenshot failed for %s (%s) — bundle will have desktop only.", url, exc)

    # --- Companies House (same graceful handling as main.py) --------------
    if no_ch:
        ch = {"ch_verified": False}
    else:
        try:
            ch = check_companies_house(
                name=name,
                postcode=prospect.get("postcode"),
                company_number=prospect.get("source_company_number"),
            )
        except EnvironmentError as exc:
            logger.warning("Companies House check unavailable: %s", exc)
            ch = {"ch_verified": False}

    # --- render the prompt exactly like analyse_vision --------------------
    prompt_text = USER_PROMPT.format(
        business_name=name,
        category=category,
        location=location or "UK",
        website_url=url,
        site_platform=tech.get("site_platform") or "unknown",
        site_age_signals=json.dumps(tech.get("site_age_signal") or {}),
    )

    bundle = {
        "prospect": prospect,
        "tech": tech,
        "ch": ch,
        "prompt": prompt_text,
        "system_prompt": SYSTEM_PROMPT,
        "images": images,
        "url": url,
        "name": name,
        "category": category,
        "location": location,
    }
    bundle_path = outdir / "bundle.json"
    bundle_path.write_text(json.dumps(bundle, indent=2, ensure_ascii=False))

    print(f"\nBundle prepared: {outdir}/")
    print(f"  bundle.json   : {bundle_path}")
    for key, rel in images.items():
        print(f"  {key:<12}: {outdir / rel} ({(outdir / rel).stat().st_size} bytes)")
    print(f"  prospect id   : {prospect.get('id')}  place_id: {prospect.get('place_id')}")
    print(f"  platform      : {tech.get('site_platform')}  built: {tech.get('site_built_estimate')}")
    print(f"  ch_verified   : {ch.get('ch_verified')}  status: {ch.get('ch_status')}")
    print(
        "\nNext: read desktop.png + mobile.png, write analysis.json per "
        "bundle.prompt, then `harness.py commit --bundle "
        f"{outdir}`"
    )
    return 0


# ---------------------------------------------------------------------------
# prepare-batch
# ---------------------------------------------------------------------------

MANIFEST_PATH = Path("bundles") / "manifest.json"


def _fetch_batch(
    limit: int, reanalyse: bool, maps_only: bool, offset: int
) -> list[dict]:
    """Fetch unanalysed prospects with an offset.

    `storage.supabase.fetch_unanalysed` has no offset param, so when offset
    is 0 we delegate straight to it. When offset > 0 we mirror the same
    query here — PostgREST natively supports `offset`, so it's a thin copy,
    not a reimplementation (same filters, ordering and intake-column
    fallback).
    """
    if offset <= 0:
        return fetch_unanalysed(limit, reanalyse=reanalyse, maps_only=maps_only)

    url = f"{_get_base_url()}/rest/v1/{TABLE}"
    params = {
        "select": PROSPECT_SELECT,
        "website_exists": "eq.true",
        "order": "intake_priority.desc.nullslast,first_seen_at.desc",
        "limit": str(limit),
        "offset": str(offset),
    }
    if not reanalyse:
        params["analysed_at"] = "is.null"
    if maps_only:
        params["place_id"] = "like.ChIJ*"

    resp = requests.get(url, headers=_get_headers(), params=params, timeout=15)
    if not resp.ok and "intake_" in resp.text:
        logger.warning("Intake columns unavailable — falling back to first_seen_at ordering.")
        params["select"] = PROSPECT_SELECT_FALLBACK
        params["order"] = "first_seen_at.desc"
        resp = requests.get(url, headers=_get_headers(), params=params, timeout=15)
    if resp.status_code == 401:
        raise PermissionError("Supabase authentication failed. Check SUPABASE_SERVICE_KEY.")
    if not resp.ok:
        raise RuntimeError(f"Supabase fetch error — HTTP {resp.status_code}: {resp.text[:300]}")
    data = resp.json()
    logger.info("Fetched %d prospects (offset=%d).", len(data), offset)
    return data


def _load_manifest() -> list[dict]:
    if MANIFEST_PATH.exists():
        try:
            return json.loads(MANIFEST_PATH.read_text())
        except json.JSONDecodeError:
            logger.warning("Manifest at %s is corrupt — starting fresh.", MANIFEST_PATH)
    return []


def _save_manifest(manifest: list[dict]) -> None:
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))


def cmd_prepare_batch(args: argparse.Namespace) -> int:
    rows = _fetch_batch(args.limit, args.reanalyse, args.maps_only, args.offset)
    if not rows:
        logger.info("No prospects matched — nothing to prepare.")
        return 0

    manifest = _load_manifest()
    # Index existing entries by prospect id for idempotent re-runs.
    by_id = {e.get("id"): e for e in manifest if e.get("id") is not None}

    prepared: list[dict] = []
    failed: list[dict] = []
    skipped = 0

    for row in rows:
        row_id = row.get("id")
        name = row.get("name") or "Unknown"
        url = row.get("website")

        existing = by_id.get(row_id)
        if existing and existing.get("status") == "prepared" and not args.force:
            logger.info("Skipping %s (id=%s) — already prepared.", name, row_id)
            skipped += 1
            continue

        outdir = Path("bundles") / _slug_for(url, row_id, row.get("place_id"))
        entry = {
            "id": row_id,
            "name": name,
            "url": url,
            "dir": str(outdir),
        }

        try:
            rc = prepare_one(
                prospect=row,
                url=url,
                name=name,
                category=row.get("category") or "local business",
                location=row.get("city") or row.get("search_location") or "UK",
                no_ch=args.no_ch,
                outdir=outdir,
            )
            if rc == 0:
                entry["status"] = "prepared"
                prepared.append(entry)
            else:
                entry["status"] = "failed"
                entry["error"] = "no website URL" if rc == 2 else "screenshot/capture failed"
                failed.append(entry)
        except Exception as exc:  # never let one row abort the batch
            logger.exception("Prepare failed for %s (%s): %s", name, url, exc)
            entry["status"] = "failed"
            entry["error"] = str(exc)
            failed.append(entry)

        # Upsert + persist the manifest after every row so progress survives
        # an interrupted batch.
        if existing:
            existing.update(entry)
        else:
            manifest.append(entry)
            by_id[row_id] = entry
        _save_manifest(manifest)

    print(f"\nBatch complete: {len(prepared)} prepared, {len(failed)} failed, {skipped} skipped.")
    for e in prepared:
        print(f"  prepared: {e['dir']}")
    for e in failed:
        print(f"  failed  : {e['dir']} — {e.get('error')}")
    print(f"Manifest: {MANIFEST_PATH}")
    return 0


# ---------------------------------------------------------------------------
# commit
# ---------------------------------------------------------------------------


def _validate_analysis(analysis) -> list[str]:
    """Returns list of warnings. Raises ValueError on fatal missing keys."""
    if not isinstance(analysis, dict):
        raise ValueError("analysis.json must contain a JSON object.")
    missing_fatal = [k for k in FATAL_KEYS if k not in analysis]
    if missing_fatal:
        raise ValueError(
            f"analysis.json missing required keys {missing_fatal} — "
            "qualify() cannot compute scores without them."
        )
    dims = analysis.get("opportunity_dimensions")
    if not isinstance(dims, dict) or not all(k in dims for k in REQUIRED_DIMS):
        raise ValueError(
            f"opportunity_dimensions must be a dict containing all 5 dims: {list(REQUIRED_DIMS)}"
        )
    warnings = [f"missing optional key '{k}'" for k in EXPECTED_KEYS if k not in analysis]
    if not isinstance(analysis.get("site_weaknesses", []), list):
        warnings.append("site_weaknesses is not a list — will be stored as-is")
    return warnings


def cmd_commit(args: argparse.Namespace) -> int:
    bundle_dir = Path(args.bundle)
    bundle_path = bundle_dir / "bundle.json"
    if not bundle_path.exists():
        logger.error("No bundle.json at %s", bundle_path)
        return 2
    bundle = json.loads(bundle_path.read_text())

    analysis_path = Path(args.analysis) if args.analysis else bundle_dir / "analysis.json"
    if not analysis_path.exists():
        logger.error("No analysis JSON at %s — write it after reading the screenshots.", analysis_path)
        return 2
    analysis = json.loads(analysis_path.read_text())

    try:
        warnings = _validate_analysis(analysis)
    except ValueError as exc:
        logger.error("Invalid analysis: %s", exc)
        return 2
    for w in warnings:
        logger.warning("analysis.json: %s", w)

    tech = bundle.get("tech") or {}
    if tech.get("site_down"):
        logger.error(
            "Bundle records tech.site_down=true for %s. Harness mode handles "
            "visual analysis only — run main.py so its site-down record path "
            "writes the correct record instead.",
            bundle.get("url"),
        )
        return 1

    ch = bundle.get("ch") or {}
    prospect = bundle.get("prospect") or {}
    place_id = prospect.get("place_id") or bundle.get("place_id")
    row_id = prospect.get("id")

    # --- qualify + record build — same merge shape as main.py analyse_one --
    scores = qualify(analysis=analysis, tech=tech, ch=ch, prospect=prospect)

    record = {
        **analysis,
        **scores,
        "tech_stack": tech.get("tech_stack"),
        "site_platform": tech.get("site_platform"),
        "site_age_signal": tech.get("site_age_signal"),
        "site_built_estimate": tech.get("site_built_estimate"),
        "source_company_number": ch.get("source_company_number"),
        "source_url": ch.get("source_url"),
        "ch_status": ch.get("ch_status"),
        "ch_incorporated_date": ch.get("ch_incorporated_date"),
        "ch_accounts_type": ch.get("ch_accounts_type"),
        "ch_accounts_last_date": ch.get("ch_accounts_last_date"),
        "ch_match_confidence": ch.get("ch_match_confidence"),
        "owner_name": ch.get("owner_name"),
        "owner_role": ch.get("owner_role"),
        "owner_source": ch.get("owner_source"),
        "associated_names": ch.get("associated_names"),
    }

    if args.dry_run:
        print("\n[DRY RUN] Computed scores:")
        for k in ("site_score", "opportunity_score", "business_quality_score",
                  "prospect_score", "service_price_point", "payback_jobs",
                  "qualified_lead", "qualification_reasons"):
            print(f"  {k}: {record.get(k)}")
        print(f"\nRecord keys ({len(record)}): {sorted(record.keys())}")
        print("No database write performed.")
        return 0

    if not place_id and row_id is None:
        logger.error("Bundle has neither place_id nor row id — cannot write.")
        return 2

    success = write_analysis(place_id=place_id, record=record, row_id=row_id)
    if not success:
        logger.error("Failed to store analysis for %s", bundle.get("name"))
        return 1

    print(f"\nCommitted analysis for {bundle.get('name')} ({bundle.get('url')})")
    for k in ("qualified_lead", "site_score", "opportunity_score",
              "business_quality_score", "prospect_score", "payback_jobs"):
        print(f"  {k}: {record.get(k)}")
    return 0


# ---------------------------------------------------------------------------
# entry point
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Website Analyser — Devin harness mode (prepare/commit)",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("prepare", help="Build an analysis bundle for one prospect")
    src = p.add_mutually_exclusive_group()
    src.add_argument("--id", type=int, default=None, help="Prospect row id")
    src.add_argument("--url", type=str, default=None, help="Ad-hoc URL (no DB row needed)")
    p.add_argument("--place-id", type=str, default=None,
                   help="Prospect place_id (or attach to a --url bundle)")
    p.add_argument("--name", type=str, default="Unknown")
    p.add_argument("--category", type=str, default="local business")
    p.add_argument("--location", type=str, default="UK")
    p.add_argument("--postcode", type=str, default=None)
    p.add_argument("--outdir", type=str, default=None,
                   help="Bundle directory (default: bundles/<slug>/)")
    p.add_argument("--no-ch", action="store_true", help="Skip Companies House check")

    b = sub.add_parser(
        "prepare-batch",
        help="Prepare bundles for a batch of unanalysed prospects",
    )
    b.add_argument("--limit", type=int, default=25)
    b.add_argument("--offset", type=int, default=0)
    b.add_argument("--reanalyse", action="store_true",
                   help="Include rows that already have an analysis")
    b.add_argument("--maps-only", action="store_true",
                   help="Restrict to Google Maps place_ids (ChIJ*)")
    b.add_argument("--no-ch", action="store_true",
                   help="Skip Companies House check for the whole batch")
    b.add_argument("--force", action="store_true",
                   help="Re-prepare rows already marked 'prepared' in the manifest")

    c = sub.add_parser("commit", help="Qualify + write a prepared analysis")
    c.add_argument("--bundle", type=str, required=True, help="Bundle directory")
    c.add_argument("--analysis", type=str, default=None,
                   help="Path to analysis JSON (default: <bundle>/analysis.json)")
    c.add_argument("--dry-run", action="store_true",
                   help="Print computed scores and record keys; no DB write")

    args = parser.parse_args()

    try:
        if args.command == "prepare":
            sys.exit(cmd_prepare(args))
        elif args.command == "prepare-batch":
            sys.exit(cmd_prepare_batch(args))
        else:
            sys.exit(cmd_commit(args))
    except PermissionError as exc:
        logger.critical("AUTH ERROR: %s", exc)
        sys.exit(1)
    except EnvironmentError as exc:
        logger.critical("CONFIG ERROR: %s", exc)
        sys.exit(1)
    except KeyboardInterrupt:
        logger.info("Interrupted by user.")
        sys.exit(0)


if __name__ == "__main__":
    main()

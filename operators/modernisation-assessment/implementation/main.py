"""
Modernisation Assessment — CLI entry point.

Usage:
    python main.py --url https://example.com --name "Example Co" --category "café"
    python main.py --url https://example.com --output report.json
    python main.py --url https://example.com --html report.html
    python main.py --url https://example.com --preview --preview-port 8080
    python main.py --write --limit 20               # batch mode, requires Supabase

Single-URL mode is dry by default and prints a JSON report to stdout.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import subprocess
import sys
import uuid
import webbrowser
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from collector.crawler import EvidenceCollector
from report.html import render_html
from report.report import ReportBuilder
from storage.supabase import fetch_unanalysed, write_assessment

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("modernisation-assessment")

OPERATOR_NAME = "modernisation-assessment"
OPERATOR_VERSION = "1.0.0"


def assess_one(
    url: str,
    name: str = "Unknown",
    category: str = "local business",
    location: str = "UK",
    capture_screenshots: bool = False,
    use_ai_narration: bool = False,
) -> dict | None:
    """Assess a single website and return the report dict."""
    logger.info("Assessing: %s (%s — %s)", url, name, category)

    collector = EvidenceCollector(url, capture_screenshots=capture_screenshots)
    evidence = collector.collect()

    if evidence.get("error"):
        logger.error("Evidence collection failed: %s", evidence["error"])
        return None

    builder = ReportBuilder(
        business_name=name,
        category=category,
        location=location,
        use_ai_narration=use_ai_narration,
    )
    report = builder.build(evidence)
    return report


def run_batch(
    write: bool = False,
    limit: int = 100,
    capture_screenshots: bool = False,
    use_ai_narration: bool = False,
) -> None:
    run_id = str(uuid.uuid4())[:8]
    started = datetime.now(timezone.utc)
    logger.info("=" * 60)
    logger.info("%s v%s — RUN %s", OPERATOR_NAME, OPERATOR_VERSION, run_id)
    logger.info("Started: %s", started.strftime("%Y-%m-%d %H:%M:%S UTC"))
    if not write:
        logger.info("DRY RUN — no database writes")
    logger.info("=" * 60)

    try:
        prospects = fetch_unanalysed(limit=limit)
    except Exception as exc:
        logger.critical("Failed to fetch prospects: %s", exc)
        sys.exit(1)

    if not prospects:
        logger.info("No prospects to assess.")
        return

    success = failed = skipped = 0
    for prospect in prospects:
        url = prospect.get("website")
        place_id = prospect.get("place_id")
        if not url:
            skipped += 1
            continue

        report = assess_one(
            url=url,
            name=prospect.get("name") or "Unknown",
            category=prospect.get("category") or "local business",
            location=prospect.get("city") or "UK",
            capture_screenshots=capture_screenshots,
            use_ai_narration=use_ai_narration,
        )
        if report is None:
            failed += 1
            continue

        if write and place_id:
            if write_assessment(place_id, report):
                logger.info("Stored assessment for %s — score %s/100", report.get("business_name"), report["business_modernisation_score"])
            else:
                logger.error("Failed to store assessment for %s", place_id)
        else:
            logger.info("[DRY RUN] %s — score %s/100", report.get("business_name"), report["business_modernisation_score"])

        success += 1

    duration = (datetime.now(timezone.utc) - started).total_seconds()
    logger.info("=" * 60)
    logger.info("RUN COMPLETE — %s", run_id)
    logger.info("  Assessed: %d", success)
    logger.info("  Failed:   %d", failed)
    logger.info("  Skipped:  %d", skipped)
    logger.info("  Duration: %.1fs", duration)
    logger.info("=" * 60)

    if failed > 0 and success == 0:
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(description="Modernisation Assessment — Sorted scoring operator")
    parser.add_argument("--url", type=str, default=None, help="Assess a single URL")
    parser.add_argument("--name", type=str, default="Unknown", help="Business name (used with --url)")
    parser.add_argument("--category", type=str, default="local business", help="Business category")
    parser.add_argument("--location", type=str, default="UK", help="Business location")
    parser.add_argument("--output", type=str, default=None, help="Write JSON report to this file")
    parser.add_argument("--html", type=str, default=None, help="Write HTML report to this file")
    parser.add_argument("--preview", action="store_true", help="Start a local preview server for the HTML report (requires --url)")
    parser.add_argument("--preview-port", type=int, default=8080, help="Port for the local preview server (default: 8080)")
    parser.add_argument("--pretty", action="store_true", help="Pretty-print JSON output")
    parser.add_argument("--screenshots", action="store_true", help="Capture desktop and mobile screenshots")
    parser.add_argument("--narrate", action="store_true", help="Use an LLM for executive summary and recommendations (requires API key)")
    parser.add_argument("--write", action="store_true", help="Batch mode: write results to Supabase (requires migration)")
    parser.add_argument("--limit", type=int, default=100, help="Batch mode limit")
    args = parser.parse_args()

    try:
        if args.url or args.preview:
            if not args.url:
                parser.error("--preview requires --url")

            report = assess_one(
                url=args.url,
                name=args.name,
                category=args.category,
                location=args.location,
                capture_screenshots=args.screenshots,
                use_ai_narration=args.narrate,
            )
            if not report:
                logger.error("Assessment failed for %s", args.url)
                sys.exit(1)

            # HTML output
            if args.html:
                html = render_html(report)
                html_path = Path(args.html)
                html_path.parent.mkdir(parents=True, exist_ok=True)
                html_path.write_text(html, encoding="utf-8")
                logger.info("HTML report written to %s", args.html)

            # Preview server
            if args.preview:
                preview_dir = Path("output")
                preview_dir.mkdir(exist_ok=True)
                html_path = preview_dir / "report.html"
                html_path.write_text(render_html(report), encoding="utf-8")

                url = f"http://localhost:{args.preview_port}/report.html"
                logger.info("Starting preview server at %s", url)
                subprocess.Popen(
                    [sys.executable, "-m", "http.server", str(args.preview_port)],
                    cwd=str(preview_dir),
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
                try:
                    webbrowser.open(url)
                except Exception:
                    pass
                logger.info("Preview server running. Press Ctrl+C to stop.")
                # Keep the main process alive so the user sees the log.
                while True:
                    pass

            json_opts: dict = {"ensure_ascii": False}
            if args.pretty:
                json_opts["indent"] = 2
            out = json.dumps(report, **json_opts)

            if args.output:
                out_path = Path(args.output)
                out_path.parent.mkdir(parents=True, exist_ok=True)
                out_path.write_text(out, encoding="utf-8")
                logger.info("Report written to %s", args.output)
            print(out)
        else:
            run_batch(
                write=args.write,
                limit=args.limit,
                capture_screenshots=args.screenshots,
                use_ai_narration=args.narrate,
            )

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

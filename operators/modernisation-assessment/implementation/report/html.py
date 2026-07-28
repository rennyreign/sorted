"""
Modernisation Assessment — HTML report renderer.

Converts the JSON report into a self-contained, browser-friendly HTML page
that can be previewed locally at http://localhost:8080/report.html.
"""

from __future__ import annotations

from html import escape
from typing import Any


def _score_colour(score: int) -> str:
    if score >= 70:
        return "#059669"  # emerald-600
    if score >= 45:
        return "#d97706"  # amber-600
    return "#dc2626"  # red-600


def _score_bg(score: int) -> str:
    if score >= 70:
        return "#ecfdf5"
    if score >= 45:
        return "#fffbeb"
    return "#fef2f2"


def render_html(report: dict[str, Any]) -> str:
    overall = report.get("business_modernisation_score", 0)
    categories = report.get("categories", {})
    why = report.get("why_a_new_website_solves_this", {})
    brief = report.get("redesign_brief", {})

    cat_cards = ""
    for key, cat in categories.items():
        label = key.replace("_", " ").title()
        score = cat.get("score", 0)
        colour = _score_colour(score)
        bg = _score_bg(score)
        evidence_items = "".join(
            f"<li>{escape(str(e))}</li>"
            for e in cat.get("evidence", [])
        )
        cat_cards += f"""
        <details class="category" open>
          <summary>
            <span class="cat-title">{escape(label)}</span>
            <span class="cat-score" style="background:{bg};color:{colour}">{score}/100</span>
          </summary>
          <div class="cat-body">
            <p class="cat-why"><strong>Why this matters:</strong> {escape(cat.get('why_it_matters', ''))}</p>
            <p class="cat-rec"><strong>Recommended improvement:</strong> {escape(cat.get('recommended_improvement', ''))}</p>
            <ul class="evidence">{evidence_items}</ul>
          </div>
        </details>
        """

    problems = "".join(f"<li>{escape(str(p))}</li>" for p in why.get("problems", []))
    solutions = "".join(f"<li>{escape(str(s))}</li>" for s in why.get("solutions", []))

    recommendations = "".join(
        f"<li>{escape(str(r))}</li>"
        for r in report.get("prioritised_recommendations", [])
    )

    redesign_sections = "".join(
        f"<li>{escape(str(s))}</li>"
        for s in brief.get("sections_to_prioritise", [])
    )

    colour = _score_colour(overall)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Modernisation Assessment — {escape(report.get('business_name', 'Unknown'))}</title>
  <style>
    :root {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }}
    body {{ margin: 0; padding: 2rem; background: #fafafa; color: #111; line-height: 1.5; }}
    .container {{ max-width: 800px; margin: 0 auto; }}
    .header {{ background: #fff; border-radius: 16px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 1.5rem; }}
    .header h1 {{ margin: 0 0 0.5rem; font-size: 1.5rem; }}
    .header .url {{ color: #666; font-size: 0.9rem; word-break: break-all; }}
    .score-ring {{ width: 140px; height: 140px; border-radius: 50%; background: conic-gradient({colour} {overall}%%, #e5e7eb 0); display: grid; place-items: center; margin: 1rem 0; }}
    .score-ring span {{ width: 110px; height: 110px; border-radius: 50%; background: #fff; display: grid; place-items: center; font-size: 2rem; font-weight: 700; color: {colour}; }}
    .summary {{ background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 1.5rem; }}
    .summary h2 {{ margin-top: 0; font-size: 1.1rem; }}
    .summary p {{ margin: 0.5rem 0; }}
    .category {{ background: #fff; border-radius: 12px; padding: 1rem 1.5rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }}
    .category summary {{ cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; font-weight: 600; }}
    .category summary::-webkit-details-marker {{ display: none; }}
    .cat-score {{ font-size: 0.85rem; padding: 0.35rem 0.65rem; border-radius: 999px; font-weight: 700; }}
    .cat-body {{ margin-top: 1rem; color: #333; }}
    .cat-why, .cat-rec {{ margin: 0.75rem 0; }}
    .evidence {{ padding-left: 1.2rem; margin: 0.75rem 0 0; color: #444; }}
    .evidence li {{ margin-bottom: 0.35rem; }}
    .bridge {{ background: #111; color: #fff; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }}
    .bridge h2 {{ margin-top: 0; font-size: 1.1rem; }}
    .bridge ul {{ padding-left: 1.2rem; margin: 0.75rem 0; }}
    .bridge .solutions {{ color: #a7f3d0; }}
    .mockup {{ background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 1.5rem; }}
    .mockup pre {{ white-space: pre-wrap; word-break: break-word; background: #f5f5f5; padding: 1rem; border-radius: 8px; }}
    .meta {{ color: #888; font-size: 0.8rem; margin-top: 2rem; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Website Modernisation Assessment</h1>
      <div class="url">{escape(report.get('url', ''))}</div>
      <div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;">
        <div class="score-ring"><span>{overall}</span></div>
        <div>
          <div style="font-size:1.25rem;font-weight:700;color:{colour};margin-bottom:0.25rem;">Business Modernisation Score</div>
          <div style="color:#666;">{escape(report.get('business_name', 'Unknown'))} · {escape(report.get('category', 'local business'))} · {escape(report.get('location', 'UK'))}</div>
        </div>
      </div>
    </div>

    <div class="summary">
      <h2>Executive Summary</h2>
      <p>{escape(report.get('executive_summary', ''))}</p>
      <h2>Business Interpretation</h2>
      <p>{escape(report.get('business_interpretation', ''))}</p>
      <h2>Prioritised Recommendations</h2>
      <ol>{recommendations or '<li>No high-priority recommendations.</li>'}</ol>
    </div>

    {cat_cards}

    <div class="bridge">
      <h2>{escape(why.get('headline', 'Why a new website solves this'))}</h2>
      <ul>{problems}</ul>
      <h2 class="solutions">{escape(why.get('closing', 'A modern website addresses these issues by improving:'))}</h2>
      <ul>{solutions}</ul>
    </div>

    <div class="summary">
      <h2>Redesign Brief</h2>
      <p><strong>Target audience:</strong> {escape(brief.get('target_audience', ''))}</p>
      <p><strong>Primary CTA:</strong> {escape(brief.get('primary_cta', ''))}</p>
      <p><strong>Biggest gap:</strong> {escape(brief.get('biggest_gap', ''))}</p>
      <p><strong>Sections to prioritise:</strong></p>
      <ol>{redesign_sections}</ol>
      <p><strong>Tone:</strong> {escape(brief.get('tone', ''))}</p>
    </div>

    <div class="mockup">
      <h2>Mockup Prompt</h2>
      <pre>{escape(report.get('mockup_prompt', ''))}</pre>
    </div>

    <div class="meta">
      Generated by {escape(report.get('operator', 'modernisation-assessment'))} v{escape(report.get('operator_version', ''))} at {escape(report.get('generated_at', ''))}
    </div>
  </div>
</body>
</html>"""

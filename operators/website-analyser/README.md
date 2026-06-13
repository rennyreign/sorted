# Website Analyser Operator

Sorted's acquisition analysis operator. Takes unanalysed prospects from Supabase, screenshots their websites, scores them with GPT-4o mini vision, and writes structured results back to the database.

## What It Removes

Manual screenshot → custom GPT → score → decide. That loop is gone. You open the dashboard, see scored prospects, and cherry-pick who to contact — with the outreach angle already written.

## What It Produces

New columns on each prospect row:
- `site_score` — 1–10 opportunity score (low = more opportunity for Sorted)
- `site_analysis` — 2–3 sentence description of the site's current state
- `site_weaknesses` — JSON array of specific problem strings
- `outreach_angle` — one-sentence hook for the cold email
- `screenshot_url` — captured screenshot
- `analysed_at` — when analysis ran

## Status

Production-ready. Python 3.x. GPT-4o mini vision. Screenshotone API. Supabase storage.

---

## Setup

```bash
cd implementation
cp .env.example .env
# Fill in OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
# SCREENSHOT_API_KEY is optional — falls back to playwright if not set
make setup
make dry-run
```

## Run

```bash
make run              # Analyse all unanalysed prospects (website_exists=true, site_score IS NULL)
make analyse URL=https://example.com   # Analyse a single URL, print result
make dry-run          # Screenshot only, no DB writes
```

Safe to re-run. Already-scored prospects are skipped.

## Cost

~$0.003 per analysis with GPT-4o mini. Screenshot: start with playwright (free, built-in fallback). Screenshotone paid plan: $17/month for 2,000 screenshots if you need speed at scale.

---

## The Operator Test

> If the human must be present during execution, it is not an operator.

Renaldo is not present when this runs. Scored prospects arrive in Supabase. That is the point.

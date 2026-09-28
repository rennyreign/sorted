# Website Analyser Operator — Build Brief

**For:** Sorted / ADX Engine
**From:** Renaldo
**Type:** Sorted Operator — Acquisition pipeline, analysis step

---

## 1. Operator Name

**Website Analyser**

---

## 2. Business Outcome

This operator takes a prospect's website URL and runs the full viability pipeline: technology profile → desktop + mobile screenshots → vision analysis → Companies House check → qualification gate. It produces a `qualified_lead` verdict with an audit trail, plus all the copy needed for the review page and outreach. Renaldo reviews the **Qualified leads** filter in the dashboard and copies the workspace link — that's the whole job.

---

## 3. Workflow Being Replaced

**Current process:**
1. Open Awesome Screenshot
2. Capture the prospect's website
3. Open custom GPT
4. Paste screenshot + prompt: "analyse this site and score it"
5. Read write-up — decide whether to pursue
6. Prompt again: "now generate a redesign mockup"

**What this operator replaces:** Steps 1–5. The screenshot + analysis + outreach angle are automated. The mockup generation remains manual (quality depends on conversational prompting).

---

## 4. Where This Lives in the Chain

```
Prospect Finder → [prospects table, status: prospect]
       ↓
Website Analyser → [prospects table, site_score + analysis columns written]
       ↓
[YOU] Cherry-pick from scored list
       ↓
[YOU] Custom GPT → mockup image (stays manual)
       ↓
Devin → site build
```

---

## 5. Inputs

| Input | Source |
|---|---|
| Prospect website URLs | Supabase `prospects` table |
| `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` | `.env` (whichever `ANALYSER_MODEL` targets) |
| `SUPABASE_URL` | `.env` |
| `SUPABASE_SERVICE_KEY` | `.env` |
| `SCREENSHOT_API_KEY` | `.env` (Screenshotone — desktop + mobile captures) |
| `COMPANIES_HOUSE_API_KEY` | `.env` (free — viability check; gate falls back to Maps signals without it) |

---

## 6. Scoring Model

Five opportunity dimensions scored 0–2 by the vision model from desktop + mobile screenshots; all arithmetic is computed in `analyser/qualify.py` (the model never calculates scores).

| Dimension | Measures |
|---|---|
| `visual_modernity` | Built in the last 2–3 years? |
| `mobile_experience` | Scored from the actual 390px screenshot |
| `desire_creation` | Does it create desire, not just inform? |
| `content_structure` | Does content guide to conversion? |
| `trust_and_credibility` | Real proof the business is legitimate |

`opportunity_score = sum(dims)` · `site_score = 10 − opportunity` · `prospect_score = opp×0.6 + biz×0.4` · `payback_jobs = ceil(3000 / service_price_point)`

`qualified_lead` = opportunity ≥ 7 AND (Companies House verified OR Maps rating ≥4 + ≥20 reviews) AND payback ≤ 25 jobs AND not a modern custom build. A dead/parked site counts as maximum opportunity.

Full doctrine: `doctrine/scoring-for-modernization.md`.

---

## 7. Outputs — written to `prospects` table

| Column | Type | Description |
|---|---|---|
| `site_score` | numeric 0–10 | Site quality (low = bad site = good prospect) |
| `opportunity_score` | int 0–10 | Modernity gap (high = big gap) |
| `business_quality_score` | int 1–10 | Commercial viability |
| `prospect_score` | numeric 0–10 | Blended score |
| `service_price_point` / `payback_jobs` | numeric / int | Typical job value + jobs to pay back £3k |
| `site_platform` / `site_built_estimate` / `tech_stack` | text / text / jsonb | Technology profile |
| `ch_status` / `ch_accounts_type` / `ch_accounts_last_date` / `ch_match_confidence` | text/date/text | Companies House verification |
| `qualified_lead` / `qualification_reasons` | bool / jsonb | Gate verdict + audit trail |
| `site_analysis` / `site_weaknesses` / `review_summary` / `outreach_angle` | text/jsonb | Copy for review page + outreach |
| `analysed_at` | timestamptz | When analysis ran |

---

## 8. Decision Logic

- Only analyse prospects where `website_exists = true` and `analysed_at IS NULL`
- Skip records already analysed (idempotent — safe to re-run)
- If screenshot capture fails, log and skip — do not write partial results
- If vision API call fails, log and skip — do not write partial results
- Companies House check degrades gracefully — missing API key or no confident match falls back to Maps signals (rating ≥4.0, ≥20 reviews)
- Records without `place_id` (CH-sourced prospects) are matched by row `id`

---

## 9. Execution Modes

```bash
make run              # Analyse all unanalysed prospects with websites
make analyse URL=...  # Analyse a single URL (ad-hoc)
make dry-run          # Fetch and screenshot, no DB writes
```

---

## 10. Model

**Claude Haiku 4.5** by default (`ANALYSER_MODEL` env var); OpenAI vision models also supported. ~$0.004 per analysis with two screenshots.

---

## 11. Screenshot API

**Screenshotone** (`screenshotone.com`). Captures screenshot at 1280px viewport. Trial: 100 free screenshots (no card required). Paid: $17/month for 2,000 screenshots ($0.0085 each). The prospect's website URL is passed directly — no browser automation required.

As a fallback (and the recommended starting point), if no screenshot API key is set, the operator uses `playwright` headless — slower (~5–8s per screenshot vs ~2s) but completely free. Start with playwright; add Screenshotone only if speed becomes a problem at scale.

---

## 12. Failure Modes

| Failure | Handling |
|---|---|
| Website returns 404/500 | Log, skip, mark `site_score = -1` to avoid retry loops |
| Screenshot API down | Log, skip, continue |
| Vision API error | Log, skip, continue |
| Supabase write fails | Log error, exit with non-zero |
| Rate limit (OpenAI) | Backoff 10s, retry once |

---

## 13. Acceptance Criteria

- [ ] Operator runs to completion without human input
- [ ] Each analysed prospect has `site_score`, `site_analysis`, `site_weaknesses`, `outreach_angle` written to Supabase
- [ ] Re-running does not re-analyse already-scored prospects
- [ ] Log output shows score for each prospect as it completes
- [ ] `make setup && make dry-run` works from a clean clone
- [ ] `make analyse URL=https://example.com` produces a valid analysis to stdout

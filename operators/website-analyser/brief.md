# Website Analyser Operator — Build Brief

**For:** Sorted / ADX Engine
**From:** Renaldo
**Type:** Sorted Operator — Acquisition pipeline, analysis step

---

## 1. Operator Name

**Website Analyser**

---

## 2. Business Outcome

This operator takes a prospect's website URL, captures a screenshot, sends it to a vision model, and produces a structured site quality score + write-up. Results are written back to the `prospects` table. Renaldo can then review scored prospects in the dashboard and cherry-pick who to contact — with the angle already written.

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
| `OPENAI_API_KEY` | `.env` |
| `SUPABASE_URL` | `.env` |
| `SUPABASE_SERVICE_KEY` | `.env` |
| `SCREENSHOT_API_KEY` | `.env` (Screenshotone) |

---

## 6. Scoring Model

Six dimensions, each scored 0–2. Total out of 12, normalised to 1–10.

Low score = high opportunity for Sorted. A score of 3/10 is a better lead than 8/10.

| Dimension | Measures | 0 | 1 | 2 |
|---|---|---|---|---|
| `design_quality` | Does it look credible and current? | Pre-2015 / broken layout | Functional but generic | Clean, modern, intentional |
| `primary_cta` | Can you find what to do in 5 seconds? | No CTA | CTA buried or weak | Obvious, above fold |
| `mobile_readiness` | Does it work on a phone? | Completely broken | Partially works | Fully responsive |
| `content_quality` | Is the copy useful and real? | Empty / lorem ipsum | Thin but present | Real, specific, credible |
| `trust_signals` | Reviews, photos, credentials, awards | None | One or two | Multiple strong |
| `contact_clarity` | Phone/email/address findable? | Not findable | Present but not prominent | Immediately obvious |

---

## 7. Outputs — written to `prospects` table

| Column | Type | Description |
|---|---|---|
| `site_score` | integer 1–10 | Overall opportunity score |
| `site_analysis` | text | 2–3 sentence write-up of the site's current state |
| `site_weaknesses` | jsonb | Array of specific problem strings |
| `outreach_angle` | text | One-sentence hook for the cold outreach email |
| `screenshot_url` | text | URL/path of the captured screenshot |
| `analysed_at` | timestamptz | When analysis was run |

---

## 8. Decision Logic

- Only analyse prospects where `website_exists = true` and `site_score IS NULL`
- Skip records already analysed (idempotent — safe to re-run)
- If screenshot capture fails, log and skip — do not write partial results
- If vision API call fails, log and skip — do not write partial results

---

## 9. Execution Modes

```bash
make run              # Analyse all unanalysed prospects with websites
make analyse URL=...  # Analyse a single URL (ad-hoc)
make dry-run          # Fetch and screenshot, no DB writes
```

---

## 10. Model

**GPT-4o mini** with vision. Chosen for cost efficiency (~$0.003 per analysis). Quality is sufficient for judging local business site problems. Uses the same `OPENAI_API_KEY` as the asset-generator operator.

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

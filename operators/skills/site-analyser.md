# Skill: Site Analyser (Devin harness mode)

**When to use:** When asked to analyse a prospect website where Devin itself reads the screenshots and produces the analysis — for curated review, QA of vision-model scores, or small batches. For bulk runs use `main.py` + Haiku (the scale path) in `operators/website-analyser/implementation/`.

**Harness:** `operators/website-analyser/implementation/harness.py`
**Scoring doctrine:** `doctrine/scoring-for-modernization.md`. All arithmetic stays in `analyser/qualify.py`; all writes go through `storage/supabase.py` — you never compute scores or write to the DB yourself.

---

## Flow

All commands run from `operators/website-analyser/implementation/` with `./venv/bin/python`.

### 1. Prepare the bundle

```bash
./venv/bin/python harness.py prepare --id 1826
# or ad-hoc:
./venv/bin/python harness.py prepare --url https://example.com --name "Acme Ltd" \
    [--category "electrician"] [--location "Leeds"] [--place-id ...]
```

This fetches the prospect row (read-only), runs the tech profile, captures `desktop.png` (full-page) and `mobile.png` (above-fold), runs the Companies House check, renders the vision prompt, and writes `bundles/<slug>/bundle.json`.

### 2. Read and analyse

Read `bundle.json`. Apply `system_prompt` and the rendered `prompt` **verbatim** — do not paraphrase or summarise them. Read `desktop.png` and `mobile.png` (when present) with the image-reading tool and score per the prompt's dimension rubric.

### 3. Write `analysis.json`

Write `bundles/<slug>/analysis.json` using the exact Output-format schema in `analyser/prompt.py`:

```json
{
  "opportunity_dimensions": {
    "visual_modernity": <0|1|2>,
    "mobile_experience": <0|1|2>,
    "desire_creation": <0|1|2>,
    "content_structure": <0|1|2>,
    "trust_and_credibility": <0|1|2>
  },
  "business_quality_score": <1-10>,
  "business_quality_reasoning": "...",
  "service_price_point": <GBP>,
  "price_point_reasoning": "...",
  "modernity_gap": "...",
  "site_weaknesses": ["..."],
  "site_analysis": "...",
  "review_summary": "...",
  "outreach_angle": "...",
  "business_type": "..."
}
```

`opportunity_dimensions` (all 5 keys) and `business_quality_score` are mandatory — `commit` refuses without them. Write valid JSON only, no markdown fences.

### 4. Commit

```bash
./venv/bin/python harness.py commit --bundle bundles/<slug>/ --dry-run   # preview scores, no write
./venv/bin/python harness.py commit --bundle bundles/<slug>/             # qualify + write to prospects row
```

`commit` validates the analysis, runs `qualify()`, merges tech + Companies House fields into the record exactly like `main.py`, and calls `write_analysis`. Always `--dry-run` first to eyeball the gate output.

---

## Batch mode

For small curated batches, prepare many bundles at once:

```bash
./venv/bin/python harness.py prepare-batch --limit 25 [--reanalyse] [--maps-only] [--offset 0] [--no-ch] [--force]
```

- Selects prospects via the same query as `fetch_unanalysed` (website exists, unanalysed unless `--reanalyse`, `ChIJ*` place_ids with `--maps-only`).
- Writes one bundle per row at `bundles/<row_id>-<hostslug>/` and maintains `bundles/manifest.json` — rows already marked `prepared` are skipped on re-run (use `--force` to redo them). Per-row failures are logged and recorded as `failed` in the manifest; they never abort the batch.
- Then analyse each bundle as in steps 2–3: read `bundle.json` + screenshots, write `analysis.json` per the Output schema.
- Commit each bundle individually: `./venv/bin/python harness.py commit --bundle bundles/<id>-<hostslug>/ [--dry-run]`.

---

## Exceptions and limits

- **Site down:** if `prepare` reports `tech.site_down` (or the desktop capture fails because the site is unreachable), stop. Do not hand-write a site-down analysis — run `main.py` for that prospect so its `_site_down_record` path writes the correct record.
- **Harness mode is not the scale path.** It exists for curated review, spot-checking Haiku's scores, and small batches where a human-quality read matters. Bulk reanalysis (`--reanalyse` runs, hundreds of prospects) stays on `main.py` + the vision API.
- Never modify `qualify.py` thresholds or `write_analysis` from the harness — the gate and the write path are shared with `main.py`.

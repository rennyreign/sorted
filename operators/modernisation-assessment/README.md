# Modernisation Assessment Operator

Deterministic website assessment that produces a **Business Modernisation Score** (0–100) across five categories:

1. **Discoverability**
2. **Infrastructure**
3. **Trust & Brand**
4. **Customer Experience**
5. **Modernisation**

It is designed to create evidence that naturally leads to one conclusion: **investing in a new website is the right commercial decision**.

---

## What it does

- Crawls a website **once** and collects a shared evidence object (HTML, metadata, headings, links, forms, images, structured data, technologies, screenshots if configured).
- Runs five deterministic scorers against the evidence. No AI inspects the site.
- Builds a report with category scores, evidence, why it matters, recommended improvements, an executive summary, prioritised recommendations, a redesign brief and a mockup prompt.
- Optionally uses an LLM **after** scoring to narrate the executive summary and recommendations.

---

## Install

```bash
cd operators/modernisation-assessment/implementation
make setup
```

No API keys are required for local assessment. Optional keys:

- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` — for AI-generated narration
- `SCREENSHOT_API_KEY` — for ScreenshotOne screenshots
- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` — for batch `--write` mode

---

## Run locally

```bash
# Quick dry run against example.com
make dry-run

# Analyse a real business
make analyse URL=https://yourwebsite.com NAME="Your Business" CATEGORY="hair salon" LOCATION="Birmingham"

# Write report to a file
./venv/bin/python main.py --url https://yourwebsite.com --output report.json --pretty

# Capture screenshots (requires Playwright or ScreenshotOne)
./venv/bin/python main.py --url https://yourwebsite.com --screenshots --pretty
```

---

## Batch / Supabase mode

Apply `migration.sql` in Supabase, then:

```bash
cp .env.example .env
# fill in SUPABASE_URL and SUPABASE_SERVICE_KEY
make run
```

---

## Output

The report is a JSON object containing:

- `business_modernisation_score` — overall 0–100 score
- `categories` — five category objects with `score`, `evidence`, `why_it_matters`, `recommended_improvement`
- `why_a_new_website_solves_this` — problem/solution bridge leading to the mockup
- `executive_summary`, `business_interpretation`, `prioritised_recommendations`
- `redesign_brief` and `mockup_prompt`
- `evidence_summary` — compact traceability data

---

## Operator philosophy

- **Inspect once, read many times.** A single crawl creates the shared evidence state.
- **Deterministic inspection.** Scoring is rule-based heuristics, not AI guesswork.
- **AI as narrator only.** If an API key is provided, the LLM writes the executive summary and recommendations after the evidence is collected.
- **Commercial framing.** Every metric answers: *How does a new website help this business compete more effectively?*

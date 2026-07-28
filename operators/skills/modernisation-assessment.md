# Skill: Modernisation Assessment

**When to use:** When asked to score, analyse, or assess a prospect's existing website as a **Business Modernisation** opportunity, producing a 0–100 score and an evidence report.

---

## What this skill does

Evolves the old Website Analyser into a more comprehensive, deterministic assessment.

It produces:

1. A **Business Modernisation Score** (0–100) — how effectively the business can compete online.
2. Five category scores with evidence, "why this matters", and recommended improvements:
   - Discoverability
   - Infrastructure
   - Trust & Brand
   - Customer Experience
   - Modernisation
3. A **"Why a new website solves this"** bridge section.
4. An executive summary, prioritised recommendations, redesign brief, and mockup prompt.

---

## Key principle

The assessment exists to create evidence that naturally leads to one conclusion:

> "A modern website is the correct investment for this business."

This is still a website-selling tool, not a consulting product.

---

## How to run

```bash
cd operators/modernisation-assessment/implementation
make setup
make analyse URL=https://example.com NAME="Example Co" CATEGORY="plumber"
```

No API keys are required for deterministic scoring. Optional keys enable AI narration and screenshot capture.

---

## Evidence-first architecture

1. **Crawl once.** Collect HTML, metadata, headings, links, forms, images, structured data, technologies, and optional screenshots into a single shared JSON evidence object.
2. **Score deterministically.** The five category scorers are rule-based heuristics. They inspect the evidence; they do not use AI.
3. **Narrate after scoring.** If `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is provided and `--narrate` is used, an LLM writes the executive summary, business interpretation, and prioritised recommendations from the scored evidence.

---

## Output shape

```json
{
  "business_modernisation_score": 66,
  "categories": {
    "discoverability": { "score": 80, "evidence": [...], "why_it_matters": "...", "recommended_improvement": "..." },
    "infrastructure": { ... },
    "trust_and_brand": { ... },
    "customer_experience": { ... },
    "modernisation": { ... }
  },
  "why_a_new_website_solves_this": {
    "headline": "...",
    "problems": [...],
    "closing": "...",
    "solutions": [...]
  },
  "executive_summary": "...",
  "business_interpretation": "...",
  "prioritised_recommendations": [...],
  "redesign_brief": { ... },
  "mockup_prompt": "..."
}
```

---

## Rules

- Do not use AI to inspect the site. Use deterministic evidence collection and scoring.
- Use AI only for narration after all evidence and scores are computed.
- Every metric must answer: *How does a new website help this business compete more effectively?*
- If a metric cannot support the case for a better website, it does not belong in Version 1.
- Version 1 remains focused on one commercial outcome: selling a new website.

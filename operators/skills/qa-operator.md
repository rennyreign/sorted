# QA Operator

## Purpose

The QA operator validates a rendered website against the composition and the design doctrine. It is the gate between the Frontend Builder and the Design Review.

A build only passes if it is faithful, correct, and complete.

## Position in the pipeline

```text
Frontend Builder
  ↓
QA Operator
  ↓
Design Review
  ↓
Patch Notes
```

The QA operator does not critique taste. It checks that the renderer executed the design system correctly.

## Inputs

1. `composition.json` — the source of truth
2. The rendered site directory (e.g. `lrt-plumbing-site-v7/`)
3. The build log from the Frontend Builder
4. `sorted-skills/11-assembly-library/INDEX.md` — the approved assembly catalogue

## Output

`qa-report.json` containing:

- `passed` — boolean
- `score` — 0–10 (technical fidelity only, not taste)
- `checks` — array of every check performed
- `failures` — array of blocking issues
- `warnings` — array of non-blocking issues
- `recommendation` — PASS, FAIL, or HUMAN REVIEW REQUIRED

---

## Phase 1 — Technical QA (deterministic)

Run these checks automatically. Every failure is a hard block unless marked as a warning.

### 1. Build integrity

- [ ] `npm run build` completed successfully
- [ ] No TypeScript errors in the build output
- [ ] No 404 errors for critical assets in the build output
- [ ] `out/` or `dist/` directory exists and contains an `index.html`

### 2. Content correctness

- [ ] Phone number in rendered HTML matches `composition.contact.phone_display`
- [ ] Phone `href` matches `composition.contact.phone` (with `tel:` prefix)
- [ ] Business name appears in page title and at least once in the body
- [ ] Location text matches `composition.contact.location`
- [ ] Email appears if provided in `composition.contact.email`
- [ ] WhatsApp link uses `composition.contact.whatsapp` if configured
- [ ] No placeholder text remains (e.g., "Business Name", "Your headline here", "Company Logo")
- [ ] No hallucinated locations (e.g., Melbourne, London, New York) unless they appear in `composition.contact.location`

### 3. Asset integrity

- [ ] Every image referenced in the rendered HTML exists in `public/assets/`
- [ ] Logo image exists and is referenced
- [ ] Hero image exists and is referenced
- [ ] No broken image `src` attributes
- [ ] No `undefined` or `null` in image paths

### 4. Assembly fidelity

- [ ] Every section in `composition.sections` has a corresponding component in the rendered output
- [ ] Every section with `assembly_id` uses an assembly from the approved Assembly Library INDEX
- [ ] The section order in `app/page.tsx` matches `composition.sections` order
- [ ] No unplanned sections were added by the renderer

### 5. Metadata correctness

- [ ] `app/layout.tsx` or `app/page.tsx` exports metadata with `composition.metadata.title`
- [ ] Metadata description matches `composition.metadata.description`
- [ ] No generic or placeholder metadata (e.g., "Client Site", "Update this")

### 6. Structural correctness

- [ ] Exactly one `<h1>` on the homepage
- [ ] `<main>` landmark exists
- [ ] `<header>`, `<footer>`, and `<section>` landmarks exist
- [ ] No horizontal scroll on mobile viewport (390px)
- [ ] All buttons and links have visible focus states or hover states

---

## Phase 2 — Visual QA (AI-assisted)

Use a screenshot of the rendered site at 1280px and 390px. The QA operator (or a sub-agent) checks these visually.

### 1. Spacing system

- [ ] Section padding follows the spacing system (no invented values)
- [ ] Title alignment is consistent across sections
- [ ] Grid gaps match the system
- [ ] Card padding is consistent
- [ ] No section is visually disproportionate to its role

### 2. Typography hierarchy

- [ ] Hero headline is the largest type on the page
- [ ] Section headings are consistent in size and weight
- [ ] Body text is readable and consistent
- [ ] No unexpected `font-extrabold` outside the hero

### 3. Colour and material

- [ ] Background colours follow the section alternation plan
- [ ] Accent colour is used consistently
- [ ] No unexpected gradients or decorative effects
- [ ] Dark sections use light text, light sections use dark text

### 4. Layout integrity

- [ ] Hero is visually dominant
- [ ] Trust strip is compressed, not heavy
- [ ] Services section is readable and balanced
- [ ] Proof section shows real work, not placeholders
- [ ] Process section is compressed, not a visual climax
- [ ] About section balances image and text
- [ ] Testimonials look like real reviews, not generic cards
- [ ] CTA is visually distinct and ends the page clearly

### 5. Conversion clarity

- [ ] Primary CTA is visible within 5 seconds
- [ ] Phone number is visible on desktop without scrolling
- [ ] Phone number is reachable on mobile within one tap
- [ ] CTA hierarchy is consistent (hero, nav, cta section match)

---

## Phase 3 — Comparison against baseline

If a known-good baseline exists, compare the new build against it.

- [ ] New build is not worse than the baseline in any dimension
- [ ] New build improves on at least one dimension the iteration intended to improve
- [ ] No regression in content correctness
- [ ] No regression in asset integrity

If the new build is worse than the baseline, the recommendation is **FAIL**.

---

## Decision rules

| Outcome | Condition |
|---|---|
| **PASS** | All technical checks pass, no visual QA blockers, no baseline regressions |
| **FAIL** | Any technical check fails, or a visual QA blocker is found, or the baseline regressed |
| **HUMAN REVIEW REQUIRED** | Technical checks pass, but visual QA is uncertain or borderline |

A failing build must be discarded. The issue is fixed in the skill, template, or assembly library, then the build is retried.

---

## Relationship to the design review

The QA operator catches execution errors. The design review catches taste and strategy.

```text
QA Operator:     Did we build what was designed?
Design Review:   Is what was designed good enough?
```

Both produce patches, but they patch different layers:

- QA failures → Frontend Builder, Assembly Library, or schema
- Design failures → Decision Language, Design Language, or Assembly Library

---

## Example QA report

```json
{
  "passed": true,
  "score": 8.7,
  "recommendation": "PASS",
  "checks": [
    { "phase": "technical", "name": "build_integrity", "status": "pass" },
    { "phase": "technical", "name": "phone_number", "status": "pass", "expected": "07379 176466", "found": "07379 176466" },
    { "phase": "technical", "name": "location", "status": "pass", "expected": "Warwickshire", "found": "Warwickshire" },
    { "phase": "visual", "name": "spacing_consistency", "status": "pass" },
    { "phase": "visual", "name": "hero_dominance", "status": "pass" }
  ],
  "failures": [],
  "warnings": [
    { "name": "metadata_length", "message": "Page title is 62 characters, which may be truncated in search results." }
  ],
  "baseline_comparison": {
    "previous": "lrt-plumbing-site-v5",
    "current": "lrt-plumbing-site-v7",
    "regressions": [],
    "improvements": ["spacing consistency", "assembly fidelity"]
  }
}
```

---

## Implementation notes

The QA operator can run as:

1. A CLI script that reads the composition and scans the rendered output
2. A sub-agent that loads this skill and produces `qa-report.json`
3. A GitHub Action that blocks deploys on failure

For visual QA, the operator can use Playwright to capture screenshots and an LLM to evaluate them against the doctrine.

For technical QA, the operator should run deterministic checks directly without LLM interpretation.

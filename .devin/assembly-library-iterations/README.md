# Devin Assembly Library Iterations

## Purpose

This folder contains the instruction briefs passed to Devin for iterative testing of the Sorted component library, assembly library, Site Composer, Frontend Builder, and QA infrastructure.

The goal is not to produce one-off attractive websites.

The goal is to improve the Sorted manufacturing system until generated sites reach a respectable human-built standard.

Each iteration should test whether the current Sorted Skills system can:

1. Understand a business category.
2. Select the right visual and trust strategy.
3. Choose appropriate assemblies from the approved library.
4. Configure those assemblies without inventing unnecessary layout.
5. Render a credible website preview.
6. Score the result honestly.
7. Patch the system so the next output improves.

---

## Operating Context

Sorted is building a digital asset factory for small businesses.

The current infrastructure lives across:

- `sorted-skills/` — design doctrine, visual language, decision language, primitive library, assembly library.
- `operators/skills/site-composer.md` — skill-first analysis-to-composition execution path.
- `operators/skills/art-director.md` — business-analysis-to-creative-direction layer.
- `operators/skills/design-composer.md` — visual-token and section-archetype reasoning layer.
- `operators/site-composer-operator/` — scalable operator framework for producing `composition.json`.
- `operators/frontend-builder/` — renders compositions and assembly selections into a site.
- `operators/qa-operator/` — validates rendered output.
- `doctrine/sorted-company-segments.md` — priority manufacturing categories.

The current best output is the Tier A plumbing website preview. It proves the first emergency/local trades pattern, but the design still needs iteration before it consistently feels like a thoughtful human built it.

---

## The Main Objective

Raise the quality of generated websites across two dimensions:

### 1. Professional Score

Measures whether the website feels commercially usable and technically competent.

A high professional score means the site is:

- clear
- responsive
- coherent
- well-spaced
- readable
- trustworthy
- conversion-oriented
- free from broken details
- credible enough to show a real prospect

This score answers:

> Would a reasonable business owner believe this was produced by a competent professional website provider?

### 2. Taste Score

Measures whether the website feels considered, human, and aesthetically mature rather than generated, templated, or generic.

A high taste score means the site has:

- confident restraint
- appropriate visual rhythm
- strong section pacing
- good image judgement
- human-feeling copy
- category-specific trust signals
- no AI slop
- no overused SaaS patterns
- no decorative clutter
- no awkward generic stock feel

This score answers:

> Does this feel like a person with good design judgement made the decisions?

---

## Score Scale

Use a 10-point scale for both scores.

### Professional Score

| Score | Meaning |
|---|---|
| 1-3 | Not usable. Broken, confusing, or unprofessional. |
| 4-5 | Structurally present but not prospect-ready. |
| 6 | Usable but visibly basic. |
| 7 | Credible and commercially serviceable. |
| 8 | Strong professional standard. |
| 9 | Very polished, reliable, and prospect-ready. |
| 10 | Exceptional commercial execution. |

### Taste Score

| Score | Meaning |
|---|---|
| 1-3 | Generic, awkward, templated, or AI-looking. |
| 4-5 | Acceptable but flat or impersonal. |
| 6 | Reasonable but still lacking refinement. |
| 7 | Respectable human-level judgement. |
| 8 | Clearly considered and mature. |
| 9 | Strong design taste with category-specific nuance. |
| 10 | Exceptional, distinctive, and deeply appropriate. |

The near-term target is:

```txt
Professional Score: 8+
Taste Score: 7+
```

Do not chase Taste 10 before the system can reliably reach Professional 8.

---

## Iteration Method

Each iteration should include:

1. **Brief** — what Devin should test.
2. **Category** — the business type being manufactured.
3. **Starting point** — the current best output or existing composition.
4. **Expected transferable pattern** — what should carry over from previous outputs.
5. **Required category-specific changes** — what must change for the new business type.
6. **Generated output** — screenshots, composition, build artifacts.
7. **Professional score** — with reasons.
8. **Taste score** — with reasons.
9. **Patch notes** — what should change in skills, assemblies, tokens, prompts, or QA.
10. **Next recommendation** — what category or weakness to test next.

---

## Iteration Rules

- Improve the system, not just the screenshot.
- Prefer reusable pattern extraction over one-off fixes.
- Do not invent new assemblies when an existing assembly can be improved or configured.
- Do not add assemblies to the library until they are validated at desktop and mobile widths.
- Any new pattern must identify which future categories will reuse it.
- Capture every useful lesson as patch notes.
- Keep the manufacturing priority aligned with `doctrine/sorted-company-segments.md`.

---

## Current Manufacturing Priority

Start with Tier A / Tier 1 emergency and local trades:

- Plumbing
- Electrical
- HVAC
- Locksmith
- Roofing
- Drainage
- Boiler engineers
- Appliance repair

This tier has the highest reuse potential because these sites share:

- urgency
- local trust
- phone-forward conversion
- proof of competence
- service clarity
- reassurance
- simple process
- strong final CTA

The first reusable production cell should become:

```txt
Tier A Emergency / Local Trades
  -> business analysis
  -> creative direction
  -> composition
  -> assembly selection
  -> rendered preview
  -> QA
  -> professional score
  -> taste score
  -> patch notes
```

---

## Folder Convention

Each iteration brief should be named:

```txt
001-tier-a-electrician.md
002-tier-a-locksmith.md
003-tier-a-hvac.md
```

Completed iteration notes may be added beneath:

```txt
results/001-tier-a-electrician-result.md
```

Do not overwrite previous iteration briefs. They are part of the learning record.

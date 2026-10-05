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

## Internal vs External Scoring

The scores in this folder are **internal factory scores**.

They are not customer-facing features.

They exist to help Sorted improve the quality of its own generated assets and manufacturing system.

### Internal scores

Used by Renaldo, ChatGPT, Devin, Codex, and future build agents:

- `Professional Score`
- `Taste Score`
- `Manufacturability Score`

These scores judge the generated Sorted asset and the factory process behind it.

### External scores

Used on prospect-facing review pages:

- `Website Score`
- `Trust Score`
- `Modernisation Score`

These scores judge the prospect's current website and create the commercial reason to engage.

Do not expose `Professional Score`, `Taste Score`, or `Manufacturability Score` to prospects.

Prospects should only feel:

> This looks better.  
> This understands my business.  
> This feels like someone has already done the work.

The customer-facing score diagnoses their current digital presence.

The internal scores diagnose our generated asset and the strength of the factory.

---

## The Main Objective

Raise the quality of generated websites across three internal dimensions:

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

### 3. Manufacturability Score

Measures whether the iteration made the Sorted factory stronger.

A high manufacturability score means the iteration:

- increased reusable pattern clarity
- improved assembly reuse
- reduced bespoke judgement
- reduced custom logic
- improved determinism
- exposed reusable category rules
- improved patch notes for future runs
- made the next category easier to manufacture

This score answers:

> Did this make the factory better, not just the screenshot better?

---

## Score Scale

Use a 10-point scale for all three internal scores.

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

### Manufacturability Score

| Score | Meaning |
|---|---|
| 1-3 | One-off output. Little or no reusable learning. |
| 4-5 | Some reusable insight, but still too bespoke. |
| 6 | Useful pattern identified but not fully codified. |
| 7 | Reusable pattern documented and partly implemented. |
| 8 | Strong factory improvement with clear reuse path. |
| 9 | Major reduction in future labour or decision entropy. |
| 10 | Step-change improvement to the production line. |

The near-term target is:

```txt
Professional Score: 8+
Taste Score: 7+
Manufacturability Score: 7+
```

Do not chase Taste 10 before the system can reliably reach Professional 8.

Do not chase Manufacturability 10 before the system has repeatable evidence across several categories.

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
9. **Manufacturability score** — with reasons.
10. **Patch notes** — what should change in skills, assemblies, tokens, prompts, or QA.
11. **Next recommendation** — what category or weakness to test next.

---

## Iteration Rules

- Improve the system, not just the screenshot.
- Treat the scores as internal calibration, never as prospect-facing language.
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
  -> manufacturability score
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

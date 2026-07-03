# Site Composer Operator

**Status:** Prototype / skill-first implementation
**Canonical skill:** `operators/skills/site-composer.md`
**Design sub-skill:** `operators/skills/design-composer.md`
**Parent brief:** `Site Composer Operator.md`

---

## Purpose

The Site Composer Operator turns a structured website analysis into a complete design doctrine that downstream operators can render. It removes the founder bottleneck caused by manual mockup production before outreach.

The output is a rendered screenshot of a complete website, generated from analysis, suitable for the Sorted review page.

---

## Operator vs Skill

This directory is the **operator framework** — the portable, scalable version of the procedure.

The canonical execution path for Devin today is the **skill** at `operators/skills/site-composer.md`, which loads the **design-composer** sub-skill for visual reasoning.

| Layer | Location | Purpose |
|---|---|---|
| Skill | `operators/skills/site-composer.md` | Devin-orchestrated execution now |
| Design sub-skill | `operators/skills/design-composer.md` | Visual and structural design reasoning |
| Operator | `operators/site-composer-operator/` | Stateless, scalable procedure later |
| Schema | `composition.schema.json` | Validates the handoff artefact |
| Tokens | `design-system-tokens.json` | Standard palettes and typography |
| Component library | `components.md` | Archetype → component mapping |
| Example | `composition.example.json` | Reference composition for a fitness business |

Both layers produce the same artefact: `composition.json`.

---

## Inputs

- `site_analysis.json` — output from the Website Analyser
- Existing website URL or screenshot
- Business category / primary conversion action
- Client slug

## Output

```
operators/site-composer-operator/output/<slug>/
  composition.json
```

`composition.json` is structurally backward-compatible with `deconstruction.json` from the Mockup Deconstructor. The existing Asset Generator and Frontend Builder can consume it directly.

---

## Prototype pipeline

```
Prospect website
  ↓
Website Analyser  →  site_analysis.json
  ↓
Site Composer  →  composition.json
  ↓
Asset Generator  →  assets/ + manifest.json
  ↓
Frontend Builder  →  <slug>-site/
  ↓
Preview Generator  →  desktop screenshot + mobile screenshot
  ↓
Review page displays the generated screenshot
```

---

## Design principles

- One responsibility per operator
- Structured inputs and outputs
- No hidden reasoning — every decision is captured in `design_doctrine`, `visual_tokens`, and `section_archetypes`
- Trust → Enquiries → Customers logic governs every section
- Static site only for the preview. CMS is applied after Nod 2.

---

## Next steps

1. Prove the skill path with one real prospect.
2. Validate the generated screenshot against the existing review page flow.
3. Once the skill is reliable, extract the operator CLI implementation.

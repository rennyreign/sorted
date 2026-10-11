---
trigger: always_on
---

# Sorted Operator Context

For website manufacturing, first read `operators/skills/factory-operators.md` and the requested phase. For workspace tasks, use `operators/skills/workspace-build.md` plus the acquisition hub standard in `start-build.md`. Load the following broader references when the task needs their lifecycle/company context rather than repeating all context at every phase:

- `doctrine/sorted-operating-model.md` — Four Nods, the manufacturing model, SortedUpdates, dual execution modes
- `doctrine/operator-chain.md` — the state contract: artifact schemas, chain map, skill vs operator distinction
- `doctrine/sorted-overview.md` — vision, China-Phenomena, the acquisition pipeline
- `doctrine/sorted-brand-voice.md` — canonical brand voice: constructive confrontation, honest but fair, we don't sell we show
- `AGENTS.md` — agent rules, deployment discipline, tech stack

And from the ADX Engine mothership (`../adxEngine/doctrine/`):
- `operator-philosophy.md` — what operators are, the test, anatomy
- `agents-vs-operators.md` — the hierarchy, the architect rule
- `digital-manufacturing.md` — the manufacturing stack
- `workflow-deletion-principles.md` — the six non-negotiable principles

---

## How the chain works

The Sorted manufacturing chain runs in one of two modes:

**Orchestration agent (you - default):** Consume the supplied ChatGPT export pack. Validate, optimise/register assets, implement, independently inspect and correct. Local generation is dormant. Use bounded implementation delegation where available; evidence-backed boundaries matter more than agent count.

**Operator pipeline (scale):** Each step runs as a discrete stateless process via CLI or job queue. Use when building multiple sites concurrently or automating without a human in the loop.

Both modes produce identical artifacts. The skills are the fast path. The operators are the scale path. Same doctrine, same state shape, different runtime.

---

## Site Build Skills

Load these when building a client site:

| Skill | When to load | File |
|---|---|---|
| `site-build` | Compatibility router to supplied-pack factory | `operators/skills/site-build.md` |
| `factory-operators` | Intake, registry, safe resume and lifecycle contracts | `operators/skills/factory-operators.md` |
| `mockup-deconstructor` | Explicit missing-design fallback only | `operators/skills/mockup-deconstructor.md` |
| `asset-generator` | Explicit missing/replacement image fallback only | `operators/skills/asset-generator.md` |
| `workspace-build` | Human-approved acquisition handoff | `operators/skills/workspace-build.md` |
| `frontend-builder` | Step 3 only: JSON + assets → site | `operators/skills/frontend-builder.md` |

Use the canonical phase contract and original input/evidence for execution. `doctrine/operator-chain.md` remains the full lifecycle reference. The diagram update does not retire CMS, analytics, internal pages, systemisation or launch.

---

## Operator Build Standard

Every operator in `operators/` follows this structure:

```
operators/<name>/
  brief.md                          — filled build brief
  README.md                         — what it removes, setup, run
  implementation/
    src/                            — TypeScript source (active operators use Node.js/TS)
    dist/                           — compiled output (gitignored)
    .env.example                    — all required env vars documented
    package.json
    tsconfig.json
  docs/
    experience-artifact.md          — filled after first production run
```

The skill file (`operators/skills/<name>.md`) is the canonical specification. The implementation follows the skill.

---

## Active Chain Steps

| Operator | Skill | Status | Implementation |
|---|---|---|---|
| factory-orchestrator | `operators/skills/factory-operators.md` | Default | `operators/factory-orchestrator/` |
| mockup-deconstructor | `operators/skills/mockup-deconstructor.md` | Conditional fallback | `operators/mockup-deconstructor/implementation/` |
| asset-generator | `operators/skills/asset-generator.md` | Dormant supplied-pack fallback | `operators/asset-generator/implementation/` |
| frontend-builder | `operators/skills/frontend-builder.md` | Active | `operators/frontend-builder/implementation/` |
| Sorted Studio CMS | `.devin/workflows/add-decap-cms.md` | Post-Nod 2 | `templates/sorted-studio/` |
| sorted-updates | `operators/sorted-updates/README.md` | Distinct maintenance capability | `operators/sorted-updates/` |

## Acquisition Operators (pre-chain)

| Operator | Skill | Status | Implementation |
|---|---|---|---|
| prospect-finder | — | Active | `operators/prospect-finder/implementation/` |
| website-analyser | `operators/skills/website-analyser.md` | Active | `operators/website-analyser/implementation/` |

The acquisition chain runs before the build chain:
`prospect-finder → website-analyser → [you cherry-pick] → mockup (manual) → build chain`

## Other Operators

| Operator | Status | Location |
|---|---|---|
| quote-agent | In spec | `operators/quote-agent/` |

---

## Sorted Design System

**Always use this for any UI built inside the sorted repo — dashboards, operator pages, client pages, proposals.**

- Background: `#FAFAFA`, primary text: `#0A0A0A`, body text: `#525252` / `#737373`
- **No accent colour. Strictly monochrome.**
- Section labels: `font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3]`
- Headings: `font-extrabold tracking-tight text-[#0A0A0A]`
- Step counters: `font-mono text-[11px] text-[#C4C4C4] tabular-nums`
- Featured/hero card: `bg-[#0A0A0A] rounded-2xl p-8` with white text
- Supporting cards: `bg-white border border-black/[0.08] rounded-xl`
- Buttons: `bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-6 py-3 hover:bg-[#2a2a2a]`
- Inputs: `bg-white border border-black/[0.12] rounded-lg focus:border-black/[0.3]`
- Dividers: `border-t border-black/[0.08]`
- Reference: `app/brand/page.tsx`, `app/clients/savannah-villegas/page.tsx`, `app/proposals/party-world/page.tsx`
- **Do NOT use the ADX Engine dark navy/teal theme** (that is for adxEngine repo only)

---

## Sorted Supabase Project

- **URL:** `https://qweevancxedkkfxysnzq.supabase.co`
- **Tables:** `sorted_changes`, `sorted_messages`, `prospects`

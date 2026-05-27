# Client Agreement Template

Standardized agreement + timeline pages for Sorted client deliveries.

## Structure

```
app/clients/[client-slug]/
├── page.tsx          # Agreement page
└── checklist/
    └── page.tsx      # Interactive timeline
```

## Setup

1. Copy both `.template` files and rename (remove `.template`)
2. Replace all `{{PLACEHOLDER}}` values in the `CONFIG` object
3. Define checklist items with stages, tasks, dates, and initial status
4. Set password (convention: `[name][year]` e.g., `roye2026`)

## Key Features

- **Password protection** (30-day expiry via localStorage)
- **Goal + Strategy** sections with workflow steps
- **Deliverables** grouped by stage
- **Investment** (initial + monthly fees)
- **Timeline** with phases
- **Signature modal** with customizable terms
- **Interactive checklist** (click to cycle status: todo → in-progress → done)
- **Progress tracking** (per-stage + overall)

## Password Convention

`[firstname][year]` — all lowercase

Examples:
- `roye2026`
- `savannah2026`
- `natasha2026`

## Stage Colors (checklist)

| Stage | Color |
|-------|-------|
| Kickoff | Blue |
| Platform Setup | Purple |
| Build | Amber |
| Content | Pink |
| Launch | Green |
| Handover | Slate |

Add new stages in `stageColors` object.

## Terms Template

Standard 8-clause structure:

1. **Scope** — what Sorted provides
2. **Timeline** — phases and ongoing
3. **Workflow** — how content flows
4. **Payment** — amounts and schedule
5. **Access & Ownership** — passwords, account ownership
6. **Termination** — notice period (e.g., 10 days)
7. **Content Control** — takedown rights
8. **Governing Law** — jurisdiction (e.g., New Jersey)

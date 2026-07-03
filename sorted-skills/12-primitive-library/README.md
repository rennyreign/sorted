# Sorted Primitive Library

Layer 1 of the three-layer Sorted design system.

## Layers

1. **Primitive Library** (this) — tokens + primitive components
2. **Assembly Library** (`sorted-skills/11-assembly-library/`) — full page sections
3. **Decision Language** — `composition.json` `assembly_selection.style_slots`

## What's here

### Tokens (`src/tokens/`)
- `spacing.ts` — section padding presets, container, grid gaps, card padding
- `typography.ts` — font size, weight, line-height classes + helper functions
- `colors.ts` — semantic palette for light and dark themes
- `shadows.ts` — shadow and hover lift utilities
- `transitions.ts` — standard animation timings

### Components (`src/components/`)
- `Container` — standard max-w-[1400px] page container
- `SectionHeader` — eyebrow + title + subtitle block
- `Button` — primary / secondary / ghost variants
- `Card` — standard / featured variants with optional hover
- `Badge` — chip/label with accent color

## Style Slots

Every assembly in Layer 2 accepts these style slot props:

| Prop | Type | Default | Effect |
|---|---|---|---|
| `theme` | `'light' \| 'dark'` | `'light'` | Background and text colors |
| `density` | `'default' \| 'compressed' \| 'airy'` | `'default'` | Section vertical padding |
| `typography` | `'utility' \| 'editorial'` | `'utility'` | Heading style (future) |
| `photography` | `'documentary' \| 'editorial' \| 'none'` | `'documentary'` | Image treatment (future) |
| `accentColor` | hex string | `'#2563EB'` | Buttons, icons, links |

## Promotion rule

> An assembly enters the library only if it solves a problem that cannot be solved by configuring an existing assembly.

## Assembly versioning

Each assembly has a `meta.json`:
```json
{
  "id": "hero-utility-split",
  "family": "hero",
  "version": "1.1.0",
  "description": "Split-layout hero for trade/service businesses. Dark navy background.",
  "style_slots": ["theme", "density", "accentColor"],
  "intensity": "massive"
}
```

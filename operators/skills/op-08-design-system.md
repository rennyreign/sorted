# Skill: op-08-design-system

**Operator:** 8 — Design System Extraction
**Execution:** harness
**Trigger:** `design-system` is the next pending operator (after ui-systemisation passes)
**Input:** the site repo (systemised, visually approved homepage)
**Output:** `artifacts/design-system.json`

---

## What you do

Extract a reusable client-specific design grammar from the approved homepage. This becomes the manufacturing specification for subsequent pages (Operator 10).

You have vision. Read the approved homepage both visually and in code to extract the design system.

## What to extract

### Colour tokens
- Primary, secondary, accent colours
- Background colours (light/dark sections)
- Text colours (primary, secondary, muted)
- Border colours
- Extract as named tokens with hex values

### Typography
- Primary font family
- Secondary font family (if different)
- Type scale: each level with size, weight, line-height, letter-spacing
- Heading styles (h1, h2, h3, etc.)
- Body text style
- Label/eyebrow style

### Spacing
- Section padding (vertical)
- Container max-width and padding
- Element spacing within sections
- Gap values for grids/flex

### Containers
- Max-width values
- Padding values
- Centering behaviour

### Grid
- Column count
- Gap value
- Responsive breakpoints
- Behaviour at each breakpoint

### Button families
- Primary button (background, text, padding, radius, font)
- Secondary button (border, text, padding, radius, font)
- Any other button variants

### Cards
- Card structure (border, padding, radius, shadow)
- Card variants if any

### Image treatments
- Aspect ratios used
- Border radius on images
- Object-fit behaviour
- Any overlays or filters

### Borders
- Width, colour, style
- Radius values

### Shadows
- Shadow values used
- Where they're applied

### Navigation patterns
- Header structure
- Mobile nav behaviour
- Footer structure

### Section patterns
- Section types used (hero, services, testimonials, etc.)
- Layout patterns (full-bleed, two-column, grid, etc.)

### CTA treatments
- CTA button styles
- CTA placement patterns
- CTA copy patterns

### Interaction behaviour
- Hover states
- Transitions/animations
- Any JS-driven interactions

### Responsive rules
- Breakpoints used
- What changes at each breakpoint
- Mobile-specific patterns

## How to execute

### Step 1: Read the homepage code

Read `globals.css`, all section components, `Nav.tsx`, `Footer.tsx`, `layout.tsx`. Extract all design values.

### Step 2: Read the homepage visually

Open the mockup or a screenshot. Confirm the visual design matches what the code says. Note any visual details the code doesn't capture well.

### Step 3: Write design-system.json

Write a structured JSON artifact following the `DesignSystemArtifact` contract in `operators/factory-orchestrator/src/contracts.ts`.

Make it both machine-readable (for Operator 10 to consume) and human-readable (for documentation).

### Step 4: Mark passed

Mark `design-system` as passed in build state.

## Validation

- `design-system.json` exists and is valid JSON
- Contains all major sections (colours, typography, spacing, buttons, cards, etc.)
- Values match the actual approved homepage
- Token names are consistent and descriptive

## Failure states

- Homepage code is too inconsistent to extract a system → document what exists, note inconsistencies
- Can't determine a value → record as null and note it

## Why this matters

This is a strategically important operator. The design system artifact becomes the manufacturing specification for all subsequent pages. Internal pages (Operator 10) inherit this system rather than independently inventing visual rules.

```
HOMEPAGE APPROVED
  ↓
SYSTEMISED
  ↓
DESIGN GRAMMAR EXTRACTED
  ↓
PAGES 2-N INHERIT THE SYSTEM
```

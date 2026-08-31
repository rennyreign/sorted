# Skill: op-07-ui-systemisation

**Operator:** 7 — UI Systemisation
**Execution:** harness
**Trigger:** `ui-systemisation` is the next pending operator (after visual-qa passes)
**Input:** the site repo (visually approved)
**Output:** `artifacts/ui-systemisation.json`

---

## What you do

Convert the visually correct implementation into robust production architecture. The visual appearance is already approved. Your job is to improve the code quality without changing the appearance.

## What you do

1. **Replace fragile implementation** — inline styles → proper classes, hardcoded values → tokens, repeated patterns → components
2. **Introduce reusable components** — if the same card structure appears 3 times, make it a component
3. **Remove unnecessary duplication** — consolidate repeated CSS, merge similar utility classes
4. **Normalise component patterns** — consistent file structure, consistent export patterns, consistent naming
5. **Apply Sorted UI/library conventions** — use the existing component patterns from the Sorted repository
6. **Improve maintainability** — clearer prop names, better file organisation, remove dead code
7. **Preserve visual fidelity** — the site must look identical before and after systemisation

## How to execute

### Step 1: Audit the current code

Read through all generated component files. Identify:
- Duplicated patterns (same JSX structure repeated)
- Hardcoded values that should be tokens
- Inline styles that should be classes
- Inconsistent patterns (different naming, different file structure)
- Dead code or unused imports

### Step 2: Extract reusable components

For patterns that repeat:
- Create a shared component (e.g. `components/ui/Card.tsx`, `components/ui/Section.tsx`)
- Replace the duplicated code with the component
- Pass variant props where minor differences exist

### Step 3: Normalise tokens

Move hardcoded colours, spacing, font sizes into CSS variables in `globals.css` if they aren't already there. Reference tokens instead of magic numbers.

### Step 4: Clean up

- Remove unused imports
- Remove dead code
- Ensure consistent file naming (PascalCase for components, camelCase for utilities)
- Ensure consistent export patterns

### Step 5: Verify build + visual fidelity

```bash
cd <build-dir>/site
npm run build
```

Build must pass. Then visually verify the site still looks the same (quick screenshot comparison or visual check).

### Step 6: Write ui-systemisation.json

```json
{
  "changes": [
    {
      "file": "components/ui/Card.tsx",
      "change": "Created reusable Card component",
      "reason": "Card structure repeated in services, testimonials, and team sections"
    },
    {
      "file": "components/sections/Services.tsx",
      "change": "Replaced inline card markup with Card component",
      "reason": "Deduplication"
    }
  ],
  "components_introduced": ["Card", "SectionWrapper", "CTAButton"],
  "duplication_removed": 4,
  "visual_fidelity_preserved": true,
  "systemised_at": "<ISO timestamp>"
}
```

### Step 7: Mark passed

Mark `ui-systemisation` as passed in build state.

## Validation

- `npm run build` passes
- `ui-systemisation.json` exists and is valid JSON
- `visual_fidelity_preserved` is true
- No new TypeScript errors introduced

## Failure states

- Systemisation breaks the build → revert the specific change, retry
- Systemisation changes the visual appearance → revert, the visual is already approved
- Can't find improvement opportunities → that's fine, write an empty changes array and pass

## Critical rule

**Systemisation must not accidentally redesign the approved page.** The visual appearance is frozen. You are improving the code, not the design.

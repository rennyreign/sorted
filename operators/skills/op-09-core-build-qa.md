# Skill: op-09-core-build-qa

**Operator:** 9 — Core Build QA
**Execution:** harness
**Trigger:** `core-build-qa` is the next pending operator (after design-system passes)
**Input:** the site repo (systemised, design system extracted)
**Output:** `artifacts/core-build-qa.json`

---

## What you do

Verify the systemised core build. This is the gate that signs off the homepage before internal pages begin.

## Checks

Run each check and record pass/fail:

### 1. Visual fidelity
- Does the site still match the approved mockup?
- Quick screenshot comparison at 1440px and 390px
- No visual regressions from systemisation

### 2. Responsive behaviour
- 390px mobile: no horizontal scroll, layout works
- 768px tablet: layout works
- 1440px desktop: layout works

### 3. Component architecture
- Reusable components are properly structured
- Props are typed
- No fragile inline styles where tokens should be
- Consistent file organisation

### 4. Assets resolve
- No 404 images
- All asset-registry entries have corresponding files in public/
- Image paths in components match registry paths

### 5. Interactions function
- Navigation links work
- CTA buttons are clickable
- Mobile nav toggles (if applicable)
- Forms submit (if any)

### 6. Build passes
```bash
cd <build-dir>/site
npm run build
```
Zero errors. Zero warnings.

### 7. No systemisation regressions
- Compare against the visual-qa.json that passed — same discrepancies haven't reappeared
- Check the ui-systemisation.json changes — none of them broke anything

## How to execute

### Step 1: Run the build

```bash
cd <build-dir>/site
npm run build 2>&1
```

Record whether it passes.

### Step 2: Start dev server and screenshot

```bash
npm run dev --port 3099
```

Capture screenshots at 390px, 768px, 1440px. Compare against the mockup and against the last visual-qa screenshots.

### Step 3: Check assets

Grep all image src/href references in the components. Verify each path exists in `public/`.

### Step 4: Check interactions

Use Playwright or manual browser check:
- Click each nav link
- Click each CTA
- Toggle mobile nav
- Submit any forms

### Step 5: Write core-build-qa.json

```json
{
  "checks": [
    { "check": "visual_fidelity", "passed": true, "details": "Matches mockup at all viewports" },
    { "check": "responsive_390px", "passed": true },
    { "check": "responsive_768px", "passed": true },
    { "check": "responsive_1440px", "passed": true },
    { "check": "component_architecture", "passed": true, "details": "3 reusable components, consistent patterns" },
    { "check": "assets_resolve", "passed": true, "details": "12/12 assets found" },
    { "check": "interactions_function", "passed": true },
    { "check": "build_passes", "passed": true },
    { "check": "no_systemisation_regressions", "passed": true }
  ],
  "overall_passed": true,
  "build_output": "✓ Compiled successfully\n✓ Generating static pages (5/5)",
  "checked_at": "<ISO timestamp>"
}
```

### Step 6: Mark passed or failed

- If all checks pass: mark `core-build-qa` as passed. The core build is signed off.
- If any check fails: mark as failed. Fix the issue and re-run.

## Validation

- `core-build-qa.json` exists and is valid JSON
- `overall_passed` correctly reflects whether all checks passed
- Build output is recorded

## Failure states

- Build fails → fix errors, re-run
- Visual regression from systemisation → revert the specific systemisation change
- Asset 404 → check asset-registry, copy missing files
- Interaction broken → fix the component

## Notes

Only after this gate passes is the core build considered signed off. Internal pages (Operator 10) cannot begin until this passes.

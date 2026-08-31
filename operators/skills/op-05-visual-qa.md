# Skill: op-05-visual-qa

**Operator:** 5 — Visual QA
**Execution:** harness
**Trigger:** `visual-qa` is the next pending operator (after frontend-build or pixel-correction)
**Input:** `input/approved-mockup.png` + the rendered site (dev server)
**Output:** `artifacts/visual-qa.json`

---

## What you do

Independently compare the rendered website against the approved mockup. **You diagnose. You do not fix.**

You have vision. Use it to compare the rendered screenshots against the mockup.

## How to execute

### Step 1: Start the dev server

```bash
cd <build-dir>/site
npm run dev --port 3099
```

Wait for it to be ready.

### Step 2: Capture screenshots

Use Playwright to capture screenshots at multiple viewport widths:

- 390px (mobile)
- 768px (tablet)
- 1440px (desktop)

Save screenshots to `artifacts/regions/screenshots/`:
- `screenshot-390.png`
- `screenshot-768.png`
- `screenshot-1440.png`

### Step 3: Compare against mockup

Open the mockup image and each screenshot. Compare:

- Overall geometry and layout
- Section dimensions and proportions
- Spacing between sections
- Alignment of elements within sections
- Typography (size, weight, tracking, line height, wrapping)
- Image crop and placement
- Colours (background, text, accent)
- Component dimensions (buttons, cards, inputs)
- Visual hierarchy
- Positioning of elements
- Responsive behaviour (does the mobile layout work?)

### Step 4: Record discrepancies

For each discrepancy, record:

```json
{
  "id": "VQ-001",
  "location": "hero section, headline",
  "expected": "Headline is 48px, bold, left-aligned",
  "observed": "Headline is 36px, semibold, centered",
  "severity": "blocker",
  "confidence": 0.95,
  "recommended_correction": "Increase headline to 48px, font-weight to 700, align left",
  "viewport": "1440px"
}
```

**Severity levels:**
- `blocker` — visually wrong, must fix before proceeding
- `warning` — minor deviation, should fix but won't break the site
- `note` — observation, non-blocking

### Step 5: Write visual-qa.json

```json
{
  "iteration": 1,
  "mockup_path": "input/approved-mockup.png",
  "screenshot_paths": ["artifacts/regions/screenshots/screenshot-390.png", ...],
  "discrepancies": [ ... ],
  "blocker_count": 3,
  "warning_count": 2,
  "passed": false,
  "checked_at": "<ISO timestamp>"
}
```

`passed` is true only when `blocker_count === 0`.

### Step 6: Update build state

- If passed (zero blockers): mark `visual-qa` as passed. The orchestrator will skip pixel-correction and proceed to ui-systemisation.
- If failed (any blockers): mark `visual-qa` as failed. The orchestrator will route to pixel-correction (if iterations remain) or escalate.

### Step 7: Stop the dev server

```bash
# Kill the dev server
```

## Validation

- `visual-qa.json` exists and is valid JSON
- Screenshots exist at the recorded paths
- Every discrepancy has all required fields
- `passed` correctly reflects whether blocker_count is zero

## Failure states

- Dev server won't start → check build errors, fix and retry
- Playwright can't capture → check if port is correct, retry
- Vision comparison inconclusive → lower confidence, mark as warning not blocker

## Notes

- This operator diagnoses only. It does not modify code.
- The Visual QA ↔ Pixel Correction loop runs max 3 iterations (configured in build state).
- After 3 failed iterations, escalate to human review.
- Use your vision capability — do not call an external vision API.

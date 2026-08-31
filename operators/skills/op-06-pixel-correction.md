# Skill: op-06-pixel-correction

**Operator:** 6 — Pixel Correction
**Execution:** harness
**Trigger:** `visual-qa` failed and loop iterations remain
**Input:** `artifacts/visual-qa.json` (the discrepancies from Visual QA)
**Output:** `artifacts/pixel-correction.json`

---

## What you do

Correct the discrepancies identified by Visual QA. **You consume the QA artifact.** You do not independently decide what needs improvement.

## How to execute

### Step 1: Read the visual-qa.json

Read the discrepancies from the latest `visual-qa.json`. Focus on `blocker` severity first, then `warning`.

### Step 2: Fix each discrepancy

For each discrepancy, apply the `recommended_correction`:

- Open the relevant component file
- Make the targeted change
- Do not redesign the section — fix the specific discrepancy only

Common corrections:
- Spacing: adjust padding/margin values
- Typography: adjust font-size, font-weight, line-height, letter-spacing
- Dimensions: adjust width/height of elements
- Alignment: adjust flex/grid alignment, text-align
- Image placement: adjust object-fit, object-position, aspect-ratio
- Positioning: adjust absolute/relative positioning
- Colours: adjust background, text, border colours

### Step 3: Record corrections

For each discrepancy addressed, record:
- The discrepancy ID
- The file(s) modified
- A summary of the correction

### Step 4: Rebuild

```bash
cd <build-dir>/site
npm run build
```

Ensure the build still passes.

### Step 5: Write pixel-correction.json

```json
{
  "iteration": 1,
  "discrepancies_addressed": ["VQ-001", "VQ-002", "VQ-003"],
  "files_modified": ["components/sections/Hero.tsx", "components/sections/Services.tsx"],
  "corrections_summary": "Fixed hero headline size/weight/alignment. Fixed services card spacing. Fixed CTA button colour.",
  "corrected_at": "<ISO timestamp>"
}
```

### Step 6: Mark passed and loop back

Mark `pixel-correction` as passed. The orchestrator will route back to `visual-qa` for re-verification.

## Validation

- `pixel-correction.json` exists and is valid JSON
- All blocker discrepancies from the latest visual-qa.json are addressed
- `npm run build` still passes after corrections

## Failure states

- Correction breaks the build → revert and try a different approach
- Correction doesn't actually fix the issue → Visual QA will catch it on the next iteration
- Can't determine how to fix → escalate

## Notes

- You fix what Visual QA found. You do not independently decide what to improve.
- The loop runs max 3 iterations. If Visual QA still finds blockers after 3 correction rounds, escalate.
- Preserve the visual fidelity of sections that were correct. Don't break things while fixing others.

# Operator 5b — Human Vision QA

Before presenting the build for review, verify the internal-route checks in `operators/skills/stage-1-direction-confirmation.md`. Intentional pending pages are acceptable at this gate; broken links, unrelated anchor substitutes and invented approval status are not. Passing visual QA does not confirm the client direction.


**Type:** Human-in-the-loop quality gate
**Execution:** harness (but requires vision-capable model — user initiates model switch)
**Depends on:** Op 5 (visual-qa) passed
**Produces:** `artifacts/human-vision-qa.json`

---

## What this operator does

This is a **human-in-the-loop visual quality gate** between the automated structural QA (Op 5) and pixel correction (Op 6). It requires actually looking at the rendered website and comparing it to the approved mockup.

This step exists because text-only models cannot see images. The automated visual QA (Op 5) checks structure — horizontal scroll, image loading, CTA visibility, section presence — but cannot judge visual fidelity, spacing accuracy, colour matching, typography quality, or whether the site "looks right" against the mockup.

## When to run this

After Op 5 (visual-qa) has passed. The orchestrator will route to this operator automatically.

## How to run this

### Step 1 — Switch to a vision-capable model

The user initiates this switch. The harness cannot auto-switch models. Start a new session with a vision model (e.g., Claude with vision, GPT-4V, Gemini Pro Vision).

### Step 2 — Start the dev server

```bash
cd <build-dir>
npx serve out -p 3999
```

Open http://localhost:3999 in a browser.

### Step 3 — Compare to the mockup

The mockup is at `<build-dir>/input/approved-mockup.png`.

Screenshots from Op 5 are at `<build-dir>/artifacts/regions/screenshots/`:
- `screenshot-1440.png` (desktop)
- `screenshot-768.png` (tablet)
- `screenshot-390.png` (mobile)

### Step 4 — Check these things

**Layout fidelity:**
- Section order matches mockup
- Content alignment (left/center/right) matches
- Spacing between sections feels right
- Grid columns match (e.g., 3-card grid in services)

**Colour accuracy:**
- Primary/dark sections use the right navy
- Accent colours (orange buttons, blue links) match
- Background colours per section match
- Text colours (headings vs body vs muted) match

**Typography:**
- Font family is correct (Montserrat for LRT, etc.)
- Heading sizes feel proportional to mockup
- Body text is readable and not too large/small
- Line heights feel right

**Image quality:**
- Hero image looks professional and on-brand
- Service card images are relevant and well-cropped
- No distorted or stretched images
- Images don't look obviously AI-generated (unless that's acceptable)

**Component accuracy:**
- Navigation links match the mockup
- Buttons have correct text, colour, and shape
- Trust items/icons match
- Testimonial quote and author are correct
- Contact information is accurate
- Footer columns and links match

**Responsive behaviour:**
- Mobile layout stacks cleanly
- No horizontal scroll at any breakpoint
- Touch targets are large enough
- Mobile menu works (if applicable)

### Step 5 — Record the result

Create `artifacts/human-vision-qa.json`:

```json
{
  "reviewer": "vision-model-name",
  "reviewed_at": "ISO timestamp",
  "mockup_path": "input/approved-mockup.png",
  "screenshot_paths": [
    "artifacts/regions/screenshots/screenshot-1440.png",
    "artifacts/regions/screenshots/screenshot-768.png",
    "artifacts/regions/screenshots/screenshot-390.png"
  ],
  "discrepancies": [
    {
      "id": "HVQ-001",
      "location": "Hero section — heading size",
      "expected": "38px heading per manifest",
      "observed": "Appears closer to 32px",
      "severity": "minor",
      "recommended_correction": "Increase hero heading font-size"
    }
  ],
  "blocker_count": 0,
  "minor_count": 1,
  "note_count": 0,
  "passed": true,
  "notes": [
    "Overall layout matches mockup well",
    "Generated images look professional",
    "Minor spacing differences acceptable for Stage 1"
  ]
}
```

### Step 6 — Mark the operator

**If the build is accurate (zero blockers):**
```bash
node <sorted>/operators/factory-orchestrator/dist/cli.js mark-passed human-vision-qa <build-dir>
```

Or if you're confident without a full vision review:
```bash
node <sorted>/operators/factory-orchestrator/dist/cli.js mark-skipped human-vision-qa <build-dir>
```

**If issues need correction:**
```bash
node <sorted>/operators/factory-orchestrator/dist/cli.js mark-failed human-vision-qa <build-dir> "HVQ-001: heading too small, HVQ-002: wrong spacing"
```

This routes to Op 6 (pixel-correction), which fixes the issues, then routes back to human-vision-qa for re-verification.

## Severity levels

- **blocker** — site looks broken or significantly different from mockup. Must fix.
- **minor** — small discrepancy that doesn't break the design but should be corrected. Fix in pixel-correction.
- **note** — acceptable difference or known limitation (e.g., logo placeholder). No action needed.

## Skip conditions

You can skip this operator if:
- The automated visual QA (Op 5) found zero issues
- You've already reviewed the site in a browser and are confident it's accurate
- The build is a simple page where structural QA is sufficient

Mark as `skipped` and the orchestrator proceeds to Op 7 (ui-systemisation).

## Loop behaviour

If human-vision-qa fails, the orchestrator routes to pixel-correction (Op 6). After pixel-correction passes, it routes back to human-vision-qa for re-verification. This loop continues up to `max_iterations` (default: 3) as defined in the build state.

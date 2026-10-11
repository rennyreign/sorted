# Operator 5b — Human Vision QA

Before presenting the build for review, verify the internal-route checks in `operators/skills/stage-1-direction-confirmation.md`. Intentional pending pages are acceptable at this gate; broken links, unrelated anchor substitutes and invented approval status are not. Passing visual QA does not confirm the client direction.


**Type:** Independent agent visual quality gate, separate from human/client approval
**Execution:** read-only image-capable reviewer
**Depends on:** Op 5 (visual-qa) passed
**Produces:** `artifacts/human-vision-qa.json`

---

## What this operator does

This is an independent visual quality gate between structural QA and pixel correction. Inspect the rendered website and approved mockup. Diagnose without editing implementation; the builder consumes the discrepancy artifact and fixes it.

This step exists because text-only models cannot see images. The automated visual QA (Op 5) checks structure — horizontal scroll, image loading, CTA visibility, section presence — but cannot judge visual fidelity, spacing accuracy, colour matching, typography quality, or whether the site "looks right" against the mockup.

## When to run this

After Op 5 (visual-qa) has passed. The orchestrator will route to this operator automatically.

## How to run this

### Step 1 - Confirm Image Capability

Use the current model/tool when it can inspect local images. Record actual reviewer/model/tool identity and the tested source revision. Ask for a capable reviewer only when image inspection is unavailable; do not force a user switch or new session unnecessarily.

### Step 2 — Start the dev server

```bash
cd <build-dir>
python3 -m http.server 3999 --bind 127.0.0.1 --directory out
```

Reuse the already running job preview when possible. Select a free per-job port rather than restarting another client server. Check the current export, not stale captures.

### Step 3 — Compare to the mockup

Read its real path from `artifacts/input-contract.json`; the original media type/path is preserved. Read approved exceptions and any human amendments before judging.

Read current screenshot paths from the structural QA artifact. Include 1440, 768, 375 and 320px plus native reference width where useful. Capture after fonts/visible images settle; missing mobile mockups require responsive judgement, not invented pixel-exact ground truth.

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
- Actual rendered font face/weight matches the supplied/approved client typography
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
  "source_revision": "<current factory fingerprint>",
  "input_sha256": "<SHA256 of input-contract.json>",
  "reviewed_at": "ISO timestamp",
  "mockup_path": "input/approved-mockup.png",
  "screenshot_paths": [
    "artifacts/regions/screenshots/screenshot-1440.png",
    "artifacts/regions/screenshots/screenshot-768.png",
    "artifacts/regions/screenshots/screenshot-390.png"
  ],
  "discrepancies": [],
  "blocker_count": 0,
  "minor_count": 0,
  "note_count": 0,
  "passed": true,
  "notes": [
    "Overall layout matches mockup well",
    "Supplied image crops match the approved reference",
    "List actual approved accessibility/safety departures here"
  ]
}
```

### Step 6 — Mark the operator

This is a shape example, not a ready-made pass. Record each real discrepancy with ID, location, expected, observed, severity, confidence, evidence and recommended correction. A material font/crop/geometry/component mismatch is a blocker; a small unresolved correction is minor; an explicitly accepted departure is a note. Do not replace inspection with a confidence score.

Start the stage before reviewing. If the current build is accurate with zero blockers and all material corrections resolved:
```bash
node <sorted>/operators/factory-orchestrator/dist/cli.js mark-passed human-vision-qa <build-dir> --artifact artifacts/human-vision-qa.json
```

No skip based on confidence, simplicity or successful structural tests. Passing this stage does not record human approval.

**If issues need correction:**
```bash
node <sorted>/operators/factory-orchestrator/dist/cli.js mark-failed human-vision-qa <build-dir> "HVQ-001: heading too small, HVQ-002: wrong spacing"
```

This routes to pixel correction; corrections return to fresh structural and visual QA on the changed revision. Keep diagnosis and editing separate.

## Severity levels

- **blocker** — site looks broken or significantly different from mockup. Must fix.
- **minor** — small discrepancy that doesn't break the design but should be corrected. Fix in pixel-correction.
- **note** — acceptable difference or known limitation (e.g., logo placeholder). No action needed.

## Human Assessment

After the independent/core gates pass, present current evidence for explicit Renaldo/client assessment. Record its decision and revision separately; do not infer it from an agent pass, preview view, booking or payment link.

## Loop behaviour

Correction attempts are bounded by `max_iterations` (three). Exhaustion blocks/escalates; do not restart the counter or continue downstream. Source changes after acceptance invalidate affected evidence and approval.

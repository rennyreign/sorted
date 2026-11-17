# Post-Presentation Mockup Fidelity Gate

Standard sequence: **build -> present local preview -> one original-mockup QA
round -> workspace readiness decision**. This is internal manufacturing QA,
not client design approval (Nod 2). Applies to new builds and resumed builds
before a new workspace handoff.

Value: Trust and Operations. Gap: a successful build or a confident visual
summary can conceal a different composition. Observe improvement through
retained, aligned comparisons, explicit discrepancies, and a reproducible
workspace-readiness decision.

## Capture And Review

- Preserve the original raster and its input-contract hash. Never substitute a
  screenshot of an earlier implementation as the design reference.
- Present the initial local build before this review. Record the actual
  presentation time; it is not an approval timestamp.
- Use the intended desktop implementation width (normally 1440). Scale that
  capture uniformly to the original raster's width for a top-aligned
  side-by-side. Never stretch its height, align each section independently,
  or crop away cumulative layout drift to improve the result.
- Capture 1440, 768, 375 and 320px after fonts, visible images and page-enter
  animations settle, with scroll at zero. Disable animations for captures.
  Missing mobile mockups require responsive QA, not invented mobile fidelity.
- An independent image-capable reviewer checks every original design-IR
  section against the original raster. The raster governs composition;
  verified facts and explicit human amendments override incorrect claims.
  Design-IR estimates do not overrule what the raster actually shows.
- Save all evidence under the job's `artifacts/`. Use the current factory
  source fingerprint and SHA256 of input-contract bytes, not the Git SHA.

One round means one consolidated discrepancy report. If corrections are
requested, make one consolidated correction pass and re-capture/retest it.
If it still fails, report the remaining issues; do not silently start
unlimited rounds, relax the threshold, or erase failed evidence.

## What 98% Means

This is **fidelity-checklist adherence**, not pixel similarity, SSIM, a
calibrated perceptual probability, or a reviewer's confidence percentage.
Automated pixels alone cannot reliably compare reconstructed photographs
or safety-corrected business details.

For every original section, evaluate six equally weighted criteria:

| Dimension | Pass Condition |
|---|---|
| `layout` | Same column structure, content alignment and principal widths; no material displacement or changed wrapping caused by geometry. |
| `typography` | Same serif/sans roles, weight hierarchy, apparent scale and headline line breaks. An unavailable font is not automatically a pass. |
| `colour` | Same section surfaces, foreground roles and accent treatments; no material contrast/palette departure. |
| `imagery` | Correct supplied asset, subject scale, crop, focal point, aspect ratio, masks and inset placement; genuine logo geometry where shown. |
| `components` | Same visible controls, icons, card/list rules, labels and component proportions, subject to documented safety corrections. |
| `spacing` | Same density, padding, section height, gaps and margins after uniform width normalisation. |

Also evaluate `page:order` (all sections in the original order) and
`page:rhythm` (whole-page length and cumulative alignment). A section
without photography still checks its logo, icons or intentional absence
of media: no automatic N/A points.

Each criterion is `pass`, `minor_fail`, `material_fail`, or `unknown`.
Record expected, observed and evidence for each. A clearly visible change
to hierarchy, composition, logo, headline wrapping or component structure
is material, not a minor cosmetic miss. Minor means a small local detail
that does not change these relationships.

Score = `100 * pass count / required criterion count`, with no rounding
before the threshold decision. All criteria stay in the denominator.
For eight sections there are 50 criteria; 49 passes = 98%.

Automatic fidelity pass requires:

1. At least 98% adherence.
2. Zero material failures and zero unknowns.
3. Complete, unique coverage of every criterion (no omitted sections).
4. Current-revision passing structural/browser QA, with actual evidence.
5. Original reference hash, capture receipts and comparison still matching.

Do not silently mask or waive a missing logo, font, unverified location
photo, or integration. A safety correction (e.g. corrected address or
honestly disconnected form) can satisfy a criterion only when the report
cites its supplied/human authority and preserves the intended visual
structure. Missing inputs that materially change the appearance remain
failures. Never add exemptions merely to reach 98%.

## Automation

Write `artifacts/mockup-fidelity-review.json`:

```json
{
  "schema_version": 1,
  "reviewer": "actual image-capable reviewer identity",
  "presented_at": "actual ISO timestamp",
  "reviewed_at": "actual ISO timestamp",
  "source_revision": "factory fingerprint",
  "input_sha256": "input-contract SHA256",
  "reference_sha256": "original mockup SHA256",
  "structural_qa_path": "artifacts/browser-qa/current/visual-qa.json",
  "captures": [
    { "width": 1440, "path": "artifacts/review/home-1440.png", "sha256": "file SHA256" },
    { "width": 768, "path": "artifacts/review/home-768.png", "sha256": "file SHA256" },
    { "width": 375, "path": "artifacts/review/home-375.png", "sha256": "file SHA256" },
    { "width": 320, "path": "artifacts/review/home-320.png", "sha256": "file SHA256" }
  ],
  "comparison": { "path": "artifacts/review/comparison.png", "sha256": "file SHA256" },
  "criteria": [
    {
      "id": "hero:layout",
      "status": "material_fail",
      "expected": "Observed original geometry",
      "observed": "Observed rendered geometry",
      "evidence": "Comparison path and specific location or measured bounds"
    }
  ]
}
```

The example is incomplete and must fail. The evaluator derives required
IDs from the original design-IR section IDs; it never trusts a supplied
score or `passed` boolean.

```bash
node /absolute/path/to/sorted/scripts/manufacturing-mockup-gate.mjs /absolute/path/to/job
```

Exit 0 means fidelity eligibility; exit 1 means blocked. The command
prints a computed JSON decision without changing factory state. The
image-capable reviewer still supplies the observations; the decision is
automated, not an unattended vision service. Calibrate that service
against human-labelled comparisons before treating its observations as
reliable automatic measurement.

## Workspace Boundary

A passing result establishes **visual readiness for workspace setup**.
It does not impersonate human approval, write a human-assessment artifact,
or waive the approved commercial/creative workspace brief. Existing
factory human-assessment permissions stay separate. Prepare/setup the
workspace only within those boundaries; no CMS, deployment, ads
publication, email sending or payments are authorised by a score.

On failure, retain the report, present the comparison and one consolidated
correction list, and keep workspace manufacture blocked. Re-evaluate
after source changes: old scores never certify a new revision.

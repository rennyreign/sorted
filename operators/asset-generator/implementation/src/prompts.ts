// ─────────────────────────────────────────────────────────────
// Asset Generator — Shared Reconstruction Prompt
// Used for every image-conditioned reconstruction call (GPT edit
// of a real client photo, GPT edit of a mockup crop, Flux edit of
// a mockup crop). The goal is recovery, not reinterpretation —
// the model is fed the actual reference pixels and told to
// minimise creative change.
// ─────────────────────────────────────────────────────────────

export const RECONSTRUCTION_PROMPT = `# SORTED — Image Reconstruction Operator v2

The supplied image is the authoritative reference for a single photographic asset extracted from a website mockup.

## Objective

Produce a higher-resolution version of the supplied image with **minimum possible visual change**.

Prioritise **reference fidelity over image enhancement or creativity**.

## Critical Constraint

Do not redesign, restage, beautify or creatively reinterpret the photograph.

Do not generate a new photograph merely depicting the same subject.

The output should appear to be the **same photograph at higher resolution**.

## Preserve Exactly

Preserve as closely as possible:

* composition and framing
* subject position and scale
* body pose and orientation
* facial appearance
* clothing
* object position and scale
* camera position and perspective
* background geometry
* lighting and shadows
* depth of field
* colour and exposure
* photographic imperfections and natural texture

Do not crop, zoom, reposition or reframe the source.

Maintain exactly the supplied reference image's aspect ratio and spatial composition.

## Reconstruction

Only infer detail where the low resolution prevents detail from being recovered directly.

When inference is necessary, make the smallest plausible reconstruction consistent with surrounding pixels.

Do not add detail simply to make the image more attractive.

Preserve natural skin texture, fabric texture, photographic grain and realistic imperfections. Avoid smooth, illustrated, CGI, hyper-polished or synthetic rendering.

## Website Elements

If typography, buttons, icons, gradients or other website interface elements remain in the supplied crop, remove them and naturally reconstruct only the photographic information directly underneath them.

Otherwise leave visible photographic regions unchanged.

## Output

Return one standalone photograph.

No text.
No UI.
No graphics.
No new subjects.
No new objects.
No composition changes.
No alternative pose.
No alternative camera angle.
No stylistic reinterpretation.

**Success means this looks like the exact source photograph recovered at higher resolution, not a newly generated photograph inspired by it.**`;

export function buildReconstructionPrompt(context: { assetType: string; description: string }): string {
  return `${RECONSTRUCTION_PROMPT}\n\n## Context (for identification only — does not override the constraints above)\nAsset type: ${context.assetType}\nOriginal brief: ${context.description}`;
}

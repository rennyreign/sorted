# Image Reconstruction Operator v2

Standard for every image-conditioned reconstruction call in the asset-generator's cost-escalation ladder (`operators/asset-generator/implementation/src/prompts.ts`). Applies identically whether the reference is a real client-supplied photo, or the mockup's own cropped region.

## Why this exists

The asset-generator's default behaviour for a "recreate" asset used to be pure text-to-image generation from the deconstruction JSON's `description` field — no reference image was ever passed to the model. That produces plausible-looking but compositionally unrelated results, and for human subjects it means fabricating a new face from scratch even when a perfectly good reference (the mockup's own crop, or client-supplied photography) already exists.

The reconstruction operator fixes this: feed the model the actual reference pixels and instruct it to recover resolution and strip UI overlays, not reinterpret the photograph.

## The prompt

```
# SORTED — Image Reconstruction Operator v2

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

**Success means this looks like the exact source photograph recovered at higher resolution, not a newly generated photograph inspired by it.**
```

## Where it's used

| Path | Reference image | Model | Rung |
|---|---|---|---|
| Human, real client photo on file | The real photo | `gpt-image-1` (`images.edit`) | `gpt-human-edit` |
| Human, no real photo but mockup has a bbox | The mockup's own crop | `gpt-image-1` (`images.edit`) | `gpt-reconstruct` |
| Non-human, free extract/upscale insufficient | The mockup's own crop | `flux-2-flex` → `flux-2-max` (`input_image`) | `flux-flex` / `flux-max` |

Text-only fallback (no reference image available at all — rare) still uses the older description-based prompt, and is always flagged `ai_placeholder_human: true` or routed to `human_review`.

## Flagging

Any human asset not backed by a genuine client-supplied photo is marked `ai_placeholder_human: true` in the manifest, regardless of whether it was reconstructed from the mockup crop or fully generated — the mockup crop itself is very likely uncredentialed stock/AI imagery from the design phase, not licensed photography of the actual client's people. These assets need replacing once real photography exists.

## Icon exclusion

Assets with `type: "icon"` are excluded from the entire pipeline (cropping, upscaling, and generation) — the frontend-builder supplies icons itself via the Lucide React component map (string keys in JSON → component map in the page file, per `operators/skills/frontend-builder.md`). Icon descriptions frequently trip the human-keyword heuristic (e.g. "line icon of a person with upward arrow"), which was previously routing icons through expensive GPT generation for no benefit — excluding them up front sidesteps this and matches how icons are actually delivered.

## Doctrine references

- `operators/skills/asset-generator.md` — Step 2 execution detail, `--ladder` flag
- `operators/asset-generator/implementation/src/prompts.ts` — source of truth for the prompt text
- `operators/asset-generator/implementation/src/ladder.ts` — decision tree implementation

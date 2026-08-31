# Skill: asset-generator

**Type:** Step skill — Chain Step 2 of 3
**Trigger:** Loaded by `site-build` skill, or directly when user asks to generate assets
**External API:** Image generation model (flux-2-flex by default)
**Input:** `deconstruction.json` + mockup image
**Output:** `assets/` folder + `manifest.json`

---

## What this step does

Takes the asset list from the deconstruction JSON and produces a complete folder of production-ready WebP image assets. All assets are **generated fresh** via AI image generation — no mockup extraction. Mockup crops are low-resolution samples unsuitable for production.

Each asset is:

- **Generated** (AI image gen from description) — the standard path for all assets
- **Skipped** (logged for manual supply) — for logos, licensed stock images, and brand-supplied assets with `source: reuse` or `source: stock`

Every generated asset is resized to 5 variants: `original`, `lg` (1920px), `md` (1024px), `sm` (640px), `xs` (320px).

---

## Execution

### Standard run (Flux-2-Flex — default)

```bash
cd operators/asset-generator/implementation
node dist/cli.js \
  --mockup <mockup-image> \
  --deconstruction <path-to-deconstruction.json> \
  --output <output-dir> \
  --format webp \
  --verbose
```

The default model is `flux-2-flex`. No `--model` flag needed.

**Dry run first** to see what will be generated before spending API credits:
```bash
node dist/cli.js --mockup <mockup> --deconstruction <decon.json> --output <out> --dry-run --verbose
```

Then run live:
```bash
node dist/cli.js --mockup <mockup> --deconstruction <decon.json> --output <out> --verbose
```

### Alternative models

```bash
# Flux-2-Max (higher quality)
node dist/cli.js ... --model flux-2-max

# Gemini 2.5 Flash Image (cheapest)
node dist/cli.js ... --model gemini-2.5-flash-image

# GPT-image-1 (OpenAI)
node dist/cli.js ... --model gpt-image-1 --quality high

# Ladder mode (Gemini → Flux-2-Flex → Flux-2-Max)
node dist/cli.js ... --ladder
```

---

## Output path convention

```
output/<slug>/
  assets/
    <asset_id>/
      original.webp
      lg.webp
      md.webp
      sm.webp
      xs.webp
  manifest.json
  generation-log.json
```

---

## Skipped assets

Assets with `source: reuse` (logos, brand marks) and `source: stock` (licensed photography) are logged in `manifest.json` with `status: skipped` and need to be supplied manually.

After the run, check:
```bash
cat output/<slug>/manifest.json | grep '"status": "skipped"'
```

Place manually-supplied assets in the correct `assets/<asset_id>/` folder as `original.webp` and run the resize step if needed.

---

## Cost guidance

| Model | Approx. cost per image |
|---|---|
| flux-2-flex (default) | ~$0.07 (wide) |
| flux-2-max | ~$0.10 (wide) |
| gemini-2.5-flash-image | ~$0.039 |
| gpt-image-1 (high) | ~$0.25 (wide) |

Typical 7-asset build with flux-2-flex: ~$0.50.

Run dry-run first to count how many assets will be generated.

---

## Environment variables

| Variable | Required for |
|---|---|
| `FLUX_API_KEY` | Default model (flux-2-flex) and all flux-* models |
| `GEMINI_API_KEY` | gemini-2.5-flash-image and ladder's Gemini rung |
| `OPENAI_API_KEY` | gpt-image-1, dall-e-3, and ladder's human branch + similarity judge |

---

## Common failure modes

| Failure | Cause | Fix |
|---|---|---|
| Generation fails on an asset | API timeout, rate limit, or insufficient credits | Add credits / wait and re-run with `--skip-existing` |
| All assets fail | API key missing or no credits | Check `.env` for `FLUX_API_KEY`, add billing credits |
| All assets skipped | `source: reuse` on everything | Check deconstruction JSON — correct source values before re-running |
| WebP corrupt | Sharp processing error | Check `generation-log.json` for the specific asset error |

---

## Manifest reference

Full schema: `operators/asset-generator/implementation/src/types.ts`
Example output: `operators/asset-generator/implementation/examples/fitness-studio-manifest.json`

---

## Doctrine references

- `doctrine/operator-chain.md` — Artifact 2 schema, chain map

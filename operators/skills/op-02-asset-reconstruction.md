# Skill: op-02-asset-reconstruction

**Operator:** 2 — Asset Reconstruction
**Execution:** standalone (external image generation API calls)
**Trigger:** `asset-reconstruction` is the next pending operator
**Input:** `input/approved-mockup.png` + `artifacts/deconstruction.json`
**Output:** `artifacts/assets-raw/` (generated production images)

---

## What this operator does

Generates clean production imagery for the website. All assets are generated fresh via AI image generation models — **no mockup extraction**. Mockup crops are low-resolution samples from GPT-image mockups and are not suitable as production assets.

The standalone CLI at `operators/asset-generator/implementation/` handles this.

## How to execute

### Step 1: Prepare inputs

Ensure the following exist:
- `input/approved-mockup.png` — the mockup (used for reference/context only, not for extraction)
- `artifacts/deconstruction.json` — from Operator 1 (contains the `assets[]` array with type, description, aspect_ratio, etc.)

### Step 2: Run the asset generator CLI

**Default (Flux-2-Flex — standard image creator):**

```bash
cd operators/asset-generator/implementation
node dist/cli.js \
  --mockup <build-dir>/input/approved-mockup.png \
  --deconstruction <build-dir>/artifacts/deconstruction.json \
  --output <build-dir>/artifacts/assets-raw \
  --format webp \
  --verbose
```

The default model is `flux-2-flex`. No `--model` flag needed unless using a different model.

**Alternative models:**

```bash
# Flux-2-Max (higher quality, higher cost)
node dist/cli.js ... --model flux-2-max

# Gemini 2.5 Flash Image (cheapest paid option)
node dist/cli.js ... --model gemini-2.5-flash-image

# GPT-image-1 (OpenAI)
node dist/cli.js ... --model gpt-image-1 --quality high

# Ladder mode (Gemini → Flux-2-Flex → Flux-2-Max, judged by vision similarity)
node dist/cli.js ... --ladder
```

**Flags:**
- `--model flux-2-flex` — default, no flag needed
- `--format webp` — output format
- `--verbose` — see per-asset progress
- `--dry-run` — see what would happen without spending credits
- `--ladder` — cost-escalation decision tree (Gemini → Flux-2-Flex → Flux-2-Max)

### Step 3: Verify output

Check that `artifacts/assets-raw/` contains:
- A subdirectory for each asset with `original.webp` (and size variants)
- `manifest.json` listing all assets and their status

Verify:
- All `critical` priority assets have status `ok`
- At least 80% of all assets have status `ok`
- No asset has status `failed` without a documented reason

### Step 4: Mark passed

Mark `asset-reconstruction` as passed in build state.

## Generation models

| Model | Cost per image | Use case |
|---|---|---|
| `flux-2-flex` (default) | ~$0.07 (wide) | Standard production imagery |
| `flux-2-max` | ~$0.10 (wide) | Higher quality when flex isn't sufficient |
| `gemini-2.5-flash-image` | ~$0.039 | Cheapest option, good for simple assets |
| `gpt-image-1` (high) | ~$0.25 (wide) | OpenAI's image generation |

## Ladder mode (cost escalation)

The ladder tries the cheapest model first and escalates on failure:

1. **Gemini 2.5 Flash Image** (~$0.039) — cheapest paid rung
2. **Flux-2-Flex** (~$0.07) — standard generation
3. **Flux-2-Max** (~$0.10) — highest quality
4. **Human review** — all rungs failed, needs manual sourcing

Each rung is judged by a vision-model similarity judge. Only escalates on failure.

Human assets (people/faces) are always handled via GPT: reconstruct from a real client photo if available, otherwise generate from description (flagged for replacement).

## Environment variables

| Variable | Required for |
|---|---|
| `FLUX_API_KEY` | Default model (flux-2-flex) and all flux-* models |
| `GEMINI_API_KEY` | gemini-2.5-flash-image and ladder's Gemini rung |
| `OPENAI_API_KEY` | gpt-image-1, dall-e-3, and ladder's human branch + similarity judge |

## Validation

- `assets-raw/manifest.json` exists and is valid JSON
- All critical assets have files on disk
- No unexplained failures

## Failure states

- API key missing → check `.env` for `FLUX_API_KEY` (default), `GEMINI_API_KEY`, `OPENAI_API_KEY`
- API rate limit or insufficient credits → add credits and re-run
- All rungs fail for a critical asset → escalate (may need manual sourcing)
- Non-critical asset fails → proceed with placeholder, note in build state

## Doctrine references

- `doctrine/image-reconstruction-operator.md` — the reconstruction prompt standard
- `operators/asset-generator/implementation/src/ladder.ts` — the decision tree implementation

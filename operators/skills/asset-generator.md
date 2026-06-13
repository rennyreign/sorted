# Skill: asset-generator

**Type:** Step skill — Chain Step 2 of 3  
**Trigger:** Loaded by `site-build` skill, or directly when user asks to generate assets  
**External API:** Image generation model (gpt-image-1 by default)  
**Input:** `deconstruction.json` + mockup image  
**Output:** `assets/` folder + `manifest.json`

---

## What this step does

Takes the asset list from the deconstruction JSON and produces a complete folder of production-ready WebP image assets. Each asset is:

- **Generated** (AI image gen from description) — for assets where extraction would be too small or low quality
- **Extracted** (cropped directly from the mockup) — for assets that pass quality gates (minimum px dimensions)
- **Skipped** (logged for manual supply) — for logos, licensed stock images, and brand-supplied assets

Every generated or extracted asset is resized to 5 variants: `original`, `lg` (1920px), `md` (1024px), `sm` (640px), `xs` (320px).

---

## Execution

### Orchestration agent path (standard)

Use the operator CLI directly:

```bash
cd operators/asset-generator/implementation
node dist/cli.js \
  <mockup-image> \
  <path-to-deconstruction.json> \
  --verbose
# Output: output/<slug>/assets/ + output/<slug>/manifest.json
```

**Dry run first** to see what will be generated before spending API credits:
```bash
node dist/cli.js <mockup-image> <deconstruction.json> --dry-run --verbose
```

Review the dry-run output:
- Check `mode` assignments (recreate vs extract vs skipped)
- Check asset count — if fewer than expected, inspect `status: skipped` entries
- Confirm `critical` priority assets will all run

Then run live:
```bash
node dist/cli.js <mockup-image> <deconstruction.json> --verbose
```

### Operator pipeline path (scale)

The Node.js operator at `operators/asset-generator/implementation/` is the canonical implementation. It is stateless and idempotent — safe to retry with `--skip-existing` to resume interrupted runs.

---

## Output path convention

```
operators/asset-generator/implementation/output/<slug>/
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

## Quality gates (automatic)

The operator applies quality gates before deciding extract vs recreate:

| Asset type | Minimum crop size |
|---|---|
| Person / portrait | 400×400px in the mockup |
| Logo | 200×80px in the mockup |
| Hero / landscape | 800×400px in the mockup |
| Thumbnail / small | 200×200px in the mockup |

If the cropped region is too small → automatically switches to `recreate`. This is expected behaviour for thumbnails and small UI elements.

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

| Asset type | Approx. cost |
|---|---|
| gpt-image-1 generation | ~$0.04–0.08 per image |
| Extract (no API call) | $0 |
| Typical 10-asset build | ~$0.30–0.60 |

Run dry-run first to count how many `recreate` assets will be generated.

---

## Common failure modes

| Failure | Cause | Fix |
|---|---|---|
| Generation fails on an asset | API timeout or content policy | Re-run with `--skip-existing` — only failed assets re-generate |
| Extracted image is black/blank | `bbox` coordinates wrong in deconstruction | Set `mode_hint: recreate` in the deconstruction JSON for that asset and re-run |
| All assets skipped | `source: reuse` on everything | Check deconstruction JSON — correct source values before re-running |
| WebP corrupt | Sharp processing error | Check `generation-log.json` for the specific asset error |

---

## Manifest reference

Full schema: `operators/asset-generator/implementation/src/types.ts`  
Example output: `operators/asset-generator/implementation/examples/fitness-studio-manifest.json`

---

## Doctrine references

- `doctrine/operator-chain.md` — Artifact 2 schema, chain map

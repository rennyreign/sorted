# Skill: op-00-build-init

**Operator:** 0 — Build Initialisation
**Execution:** harness
**Trigger:** Manufacturing line starts, or `build-init` is the next pending operator
**Input:** approved mockup image + image manifest JSON
**Output:** `artifacts/build-init.json`

---

## What you do

1. Verify the mockup and manifest exist and are valid
2. The build directory and `build-state.json` should already be created by `factory init`
3. Read the image manifest and verify it contains asset entries
4. Copy the mockup and manifest into `input/` (already done by `factory init`)
5. Write `artifacts/build-init.json`:

```json
{
  "build_id": "<from build-state.json>",
  "client_id": "<from build-state.json>",
  "client_slug": "<from build-state.json>",
  "mockup_path": "<path to input/approved-mockup.png>",
  "manifest_path": "<path to input/image-manifest.json>",
  "build_dir": "<build directory>",
  "initialized_at": "<ISO timestamp>"
}
```

6. Mark `build-init` as passed in build state

## Validation

- Mockup file exists and is a valid image (png/jpg/webp)
- Manifest file exists and is valid JSON with at least an `assets` array
- `build-init.json` written to artifacts

## Failure states

- Mockup missing or corrupt → escalate
- Manifest missing or invalid JSON → escalate
- Manifest has no assets → warning (site may be text-only) but proceed

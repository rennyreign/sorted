# Skill: mockup-deconstructor

**Type:** Step skill — Chain Step 1 of 3  
**Trigger:** Loaded by `site-build` skill, or directly when user asks to deconstruct a mockup  
**External API:** Vision model (GPT-4.1 by default, Claude or Gemini optional)  
**Output:** `deconstruction.json` — structured representation of the mockup

---

## What this step does

Reads a website mockup image using a vision model and produces a structured JSON artifact that captures:

- Every section (type, layout, theme, copy blocks, asset references)
- Every visual asset needed (with descriptions precise enough to generate or source without the original image)
- All visible text, attributed to sections and typed
- Build notes: accent colour, font stack, animation level, implementation notes

This JSON is the single source of truth for all downstream steps. Everything the Asset Generator and Frontend Builder know about the site comes from this artifact.

---

## Execution

### Orchestration agent path (standard)

Call the OpenAI vision API directly with the mockup image and the deconstruction prompt.

**API call:**
- Model: `gpt-4.1` (recommended — best spatial reasoning on mockup images)
- Input: mockup image (base64 or URL) + system prompt from `operators/mockup-deconstructor/implementation/src/prompt.ts`
- Output: JSON matching the schema in `operators/mockup-deconstructor/implementation/src/schema.ts`

**Or use the operator CLI:**
```bash
cd operators/mockup-deconstructor/implementation
node dist/cli.js <mockup-image> --verbose
# Output: output/<slug>.json
```

### Operator pipeline path (scale)

The Node.js operator at `operators/mockup-deconstructor/implementation/` is the canonical implementation. Run it as a CLI process or invoke its public API (`src/index.ts`).

---

## Output path convention

```
operators/mockup-deconstructor/implementation/output/<slug>.json
```

---

## Validation before proceeding

After writing the JSON, verify:

- `sections` array has at least 3 entries
- `assets` array has at least 1 entry with `priority: "critical"`
- `copy` array has at least 1 `headline` type entry
- `build_notes.accent_color` is populated
- No section has an empty `copy_blocks` array unless it is a pure-image section

If validation fails, re-run with `--verbose` to inspect the raw model response.

---

## Common failure modes

| Failure | Cause | Fix |
|---|---|---|
| Empty sections array | Model returned partial JSON | Re-run; check image is readable |
| Assets missing `bbox` | Model couldn't localise elements | Acceptable for non-extractable assets; `mode_hint` will default to `recreate` |
| Copy attributed to wrong section | Model hallucinated section structure | Manually correct the JSON before proceeding — do not re-run the whole chain |
| Accent colour wrong | Brand colour not prominent in mockup | Manually set `build_notes.accent_color` in the JSON |

---

## Supported providers

| Provider | Model | Notes |
|---|---|---|
| OpenAI (default) | `gpt-4.1` | Best spatial layout reasoning |
| Anthropic | `claude-opus-4-5` | Strong copy extraction |
| Google | `gemini-2.5-flash` | Fast, cost-effective |

Override: `--provider anthropic` or `--provider gemini`

---

## Output schema reference

Full schema: `operators/mockup-deconstructor/implementation/src/schema.ts`  
TypeScript types: `operators/mockup-deconstructor/implementation/src/types.ts`  
Example output: `operators/mockup-deconstructor/implementation/examples/fitness-studio-mockup.json`

---

## Doctrine references

- `doctrine/operator-chain.md` — Artifact 1 schema, chain map

---
description: Scaffold a new Sorted client site repo from the template
---

# New Client Site — Scaffold Workflow

Run this before assigning any build task to Codex or Cascade.
This eliminates all infrastructure setup from the build task — the agent arrives at a working Next.js project and builds the client's site, not the boilerplate.

---

## Step 1 - Validate The Supplied Pack Locally

Use `operators/skills/factory-operators.md`. Resolve the slug, approved mockup, design-IR and supplied images. Run intake dry-run before scaffolding.

Do not create/link hosting or a remote repository as a prerequisite for Stage 1.

---

## Step 2 — Copy the scaffold into the client folder

```bash
# Replace [client-slug] with the actual folder name
~/Projects/sorted/operators/factory-orchestrator/scripts/start-build.sh [client-slug] /absolute/path/to/export-pack
```

---

## Step 3 - Initialise A Local Feature Branch

```bash
git init
git checkout -b feat/stage-1-build
git add -A
git commit -m "init: scaffold from sorted client-site template"
```

---

## Step 4 — Fill in the client brief

Open `client/brief.md` and fill in what you know:
- Business name, location, contact details
- Business type and primary conversion action
- Brand colours (if known)
- Pages required
- Any copy or assets available

The more complete the brief, the tighter the build task.

---

## Step 5 — Add the mockup and assets

Intake preserves originals in `input/`. Register/optimise supplied assets and consume their actual registry paths. Do not regenerate supplied imagery or overwrite original files.

---

## Step 6 - Build And Review Locally

Use existing approved dependencies, build the static export, and serve `out/` locally. Complete structural/independent visual QA and retain current-revision artifacts.

No preapproval remote pushes, Netlify sites, deploy hooks or production builds. A workspace screenshot is not a hosted interactive site; agree the review surface explicitly.

---

## Step 7 — Assign the Stage 1 build task

Hand Codex:
- The repo (it already contains `AGENTS.md` with full build instructions)
- The filled `client/brief.md`
- The mockup in `client/assets/`

The build instruction to Codex can be as simple as:

> "Build the Stage 1 site for [client name]. Read AGENTS.md and client/brief.md. The mockup is in client/assets/. Standard tier unless brief specifies Premium."

Codex does not need further instruction — `AGENTS.md` contains the full skill cascade, page patterns, copy rules, motion standards, and quality checklist.

---

## Step 8 — After build approval (Nod 2) — trigger Stage 2

Once the client approves the build, apply SortedUpdates:

**Workflow:** `.devin/workflows/add-decap-cms.md`

---

## Notes

- The scaffold already includes: Next.js, TailwindCSS v4, Nav, Footer, PageTransition, animation system, static export config
- Codex should customise these — not rebuild them
- `AGENTS.md` in the client repo is Stage 1 scoped — it explicitly tells Codex not to apply the CMS
- After Stage 2, add `decap-server` to `package.json` and follow the CMS workflow

# Sorted Operating System

Sorted is managed as an operating repo, not only a website repo.

Use this repo as the umbrella for client site builds, agent workflows, reusable references, delivery checklists, and business context.

## Repo roles

- `websites/` holds client website source material, mockups, assets, and build work.
- `websites/_template/` provides the repeatable client packet for every new site.
- `agents/` holds operator workflows, prompts, and build procedures.
- `references/` holds durable Sorted business context and delivery standards.
- `docs/` holds broader operating notes and longer-form process documentation.

## Relationship to taste-skill

- `taste-skill` is the reusable design/build intelligence library.
- `sorted` is the business operating repo.
- Use Taste Skill for visual taste, image-to-code work, frontend discipline, motion, and anti-slop rules.
- Use this repo for client-specific context, build artefacts, delivery state, and operational memory.

## Client site workflow

For each new client site:

1. Create a folder under `websites/` using a clean slug.
2. Copy the files from `websites/_template/`.
3. Add mockups and raw client assets into the client folder.
4. Fill in `brief.md` before build work begins.
5. Build the Standard version first unless Premium is explicitly requested.
6. Use `qa.md` before presenting the work.
7. Use `handoff.md` once the site is ready for owner review or launch.
8. Capture reusable lessons in `notes.md` after delivery.

## Standard vs Premium

Standard means close to the approved mockup, clean, responsive, credible, and fast to deliver.

Premium means the same business and structure, but with stronger visual treatment, richer motion, better image handling, more refined typography, and more memorable section rhythm.

Premium should never make a local business feel like a startup, agency, or software product unless that is genuinely appropriate.

## Naming rules

Use lowercase folder names with hyphens where practical.

Good:

- `websites/gracie-barra-halesowen/`
- `websites/precision-turbos/`
- `websites/west-midlands-property/`

Avoid spaces in new folder names. Existing folders can be cleaned up when convenient.

## Agent rule

Agents should treat this repo like the source of truth for Sorted delivery. Before building a client site, inspect:

- the client brief
- the mockups
- the available assets
- the relevant workflow under `agents/workflows/`
- the relevant standards under `references/sorted/`

Do not invent a new process when a local workflow already exists.
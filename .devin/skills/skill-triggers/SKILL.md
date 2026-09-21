---
name: skill-triggers
description: Reference list of all Sorted skills and the trigger phrases that invoke them. Use when the user asks "what skills do I have", "show me the skill triggers", "what can you do", "what commands are available", "how do I trigger a skill", or wants to see the full list of available skills and their trigger prompts.
---

# Sorted Skill Triggers

This is the master reference for every skill in the Sorted repository and the natural-language phrases that invoke each one. Say any of these phrases to trigger the corresponding skill.

---

## Website Builds

### Start a new website build
**Skill:** `start-build` — `.devin/skills/start-build/SKILL.md`
**Say:**
- "build a website"
- "start a new site"
- "manufacture a site"
- "start a build"
- "run the manufacturing line"
- "new client build"

### Run the manufacturing line (operator sequence)
**Skill:** `manufacturing-line` — `.devin/skills/manufacturing-line/SKILL.md`
**Say:**
- "run operators"
- "continue the build"
- "resume the build"
- "run the manufacturing line"
- "next operator"
- "progress the build"

### Deconstruct a mockup
**Skill:** `mockup-deconstructor` — `operators/skills/mockup-deconstructor.md`
**Say:**
- "deconstruct this mockup"
- "break down this mockup"
- "analyse this mockup image"

### Generate assets
**Skill:** `asset-generator` — `operators/skills/asset-generator.md`
**Say:**
- "generate assets"
- "create the assets"
- "generate images for this build"

### Build the frontend
**Skill:** `frontend-builder` — `operators/skills/frontend-builder.md`
**Say:**
- "build the frontend"
- "build the site from the deconstruction"
- "generate the code"

### Orchestrate full site build (all 3 steps)
**Skill:** `site-build` — `operators/skills/site-build.md`
**Say:**
- "build this client site"
- "run the full build chain"
- "build from mockup"

---

## CMS & Launch

### Apply SortedUpdates CMS
**Skill:** `add-cms` — `.devin/skills/add-cms/SKILL.md`
**Say:**
- "add the CMS"
- "apply SortedUpdates"
- "add Sorted Studio"
- "wire up the CMS"
- "make this site editable"
- "add Decap CMS"

### Sorted Studio CMS (detailed operator skill)
**Skill:** `sorted-studio-cms` — `operators/skills/sorted-studio-cms.md`
**Say:**
- "install Sorted Studio"
- "upgrade the CMS"
- "repair the CMS"
- "QA the CMS"

### Launch QA
**Skill:** `launch-qa` — `operators/skills/launch-qa.md`
**Say:**
- "run launch QA"
- "make this launch-ready"
- "verify production readiness"
- "final QA check"
- "is this ready to launch"

### Human Vision QA
**Skill:** `op-05b-human-vision-qa` — `operators/skills/op-05b-human-vision-qa.md`
**Say:**
- "run human vision QA"
- "visual QA check"
- "human quality gate"

---

## Analytics & Tracking

### Apply the standard website tracking profile
**Skill:** `website-tracking-profile` — `.devin/skills/website-tracking-profile/SKILL.md`
**Say:**
- "apply the analytics protocol"
- "add GTM and GA4 tracking"
- "add conversion tracking"
- "track CTA, phone and form conversions"
- "generate the GTM import"
- "add the website tracking profile"

The canonical GTM import contains **0 tags, 2 triggers, and 21 variables**. Tags are created manually in GTM because tag JSON schemas are version-sensitive.

---

## Sorted Ads

### Provision, configure, or QA the ads workspace
**Skill:** `sorted-ad-review` — `.devin/skills/sorted-ad-review/SKILL.md`
**Say:**
- "add a new ad client"
- "onboard a new ad account"
- "set up ads for a new client"
- "add a new tenant to the ads portal"
- "create an ad review link"
- "set up a campaign approval board"
- "change the review portal"
- "fix the ads workspace"

### Add a new client to the ads portal
**Onboarding steps (documented in the skill):**
1. Add tenant to `KNOWN_TENANTS` in `app/ads/components/TenantContext.tsx`
2. Add tenant to `TENANT_PASSWORDS` and `TENANT_ACCESS_CODES` in `app/review/page.tsx`
3. Ensure tenant exists in the central database (`ad_review_tenants` table)

---

## Acquisition & Prospecting

### Analyse a prospect's website
**Skill:** `website-analyser` — `operators/skills/website-analyser.md`
**Say:**
- "analyse this website"
- "score this prospect's site"
- "assess this website"

### Modernisation assessment
**Skill:** `modernisation-assessment` — `operators/skills/modernisation-assessment.md`
**Say:**
- "run a modernisation assessment"
- "score this as a modernisation opportunity"
- "assess this business for modernisation"

### Draft outreach email
**Skill:** `outreach-drafter` — `operators/skills/outreach-drafter.md`
**Say:**
- "draft an outreach email"
- "write a cold email to this prospect"
- "draft outreach"

---

## Sync & Maintenance

### Sync examples grid
**Skill:** `examples-sync` — `operators/skills/examples-sync.md`
**Say:**
- "sync the examples"
- "update the examples grid"
- "sync examples from the pipeline"

---

## Design Skills (always active, no explicit trigger needed)

These are applied automatically during builds:

| Skill | Purpose |
|---|---|
| `visual-hierarchy` | Section spacing, max-width, grid gaps |
| `color-system` | Palette structure, contrast, semantic mapping |
| `typography-scale` | Fluid sizing, weight relationships |
| `feedback-patterns` | Hover states, transitions |
| `micro-interaction-spec` | Page enter timing, animation curves |
| `design-system` | Whitespace, clean typography, restrained color |
| `state-machine` | Model complex UI behavior as finite state machines |

---

## How to use this reference

If you forget how to trigger a skill, just say:
- "what skills do I have"
- "show me the skill triggers"
- "what can you do"
- "how do I trigger a skill"

This reference will appear and you can find the phrase you need.

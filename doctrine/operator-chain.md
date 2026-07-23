# Operator Chain — State Contract

**Status:** Active doctrine
**Parent:** Sorted Operating Model
**Purpose:** Define the state that flows between every step in the Sorted chain, from prospect discovery through to a paid client. The chain runs identically whether executed by an orchestration agent or by discrete stateless operators.

---

## The Two Chains

The Sorted manufacturing chain is split into two sequential chains.

1. **Acquisition chain** — finds prospects, analyses their websites, scores them, and moves them into outreach and the CRM pipeline.
2. **Build chain** — converts a nodding prospect into a delivered, CMS-enabled website.

The acquisition chain runs first. The build chain runs after Nod 1.

---

## Chain 1 — Acquisition

### Step 1: Prospect Finder

The Prospect Finder scrapes Google Maps and other sources to produce a list of local business prospects with basic profile data.

**Output:** raw prospect list (name, address, phone, website URL, Google Maps category)

Skill: `operators/skills/prospect-finder.md`
Operator: `operators/prospect-finder/`

---

### Step 2: Website Analyser

The Website Analyser takes each prospect from the raw list, visits their website, and produces two outputs.

**Scoring formula:**

```
prospect_score = (opportunity_score x 0.6) + (business_quality_score x 0.4)
```

The opportunity score measures how poor the website is. The business quality score measures how viable and active the underlying business is. Weighting opportunity higher means prospects with genuinely poor websites surface first, as long as the business itself is real and worth approaching. A strong business with a bad website is the ideal target.

Full rationale: `doctrine/scoring-for-modernization.md`

**Output A: `site_analysis`**

Internal operator record. Contains the full technical and commercial breakdown of the prospect's website.

```
{
  prospect_id         string
  business_name       string
  website_url         string
  opportunity_score   number  (0-10)
  business_quality_score  number  (0-10)
  prospect_score      number  (0-10, computed)
  weaknesses[]        plain-English descriptions of specific failure points
  outreach_angle      string  — the single most compelling reason to reach out
  site_analysis       object  — full structured analysis (navigation, mobile, trust, speed, etc.)
  generated_at        ISO timestamp
}
```

**Output B: `review_summary`**

Prospect-facing sales copy. Written in second-person, plain English, advisory tone. No em-dashes. No technical jargon. This is what the prospect reads on their review page. It describes what is holding their business back and what a modernised website could change for them. It is written as if a knowledgeable advisor is talking to the business owner directly.

Example register:

> "Your website makes it difficult for people to find what they are looking for. On mobile, the text is hard to read and the contact button is buried. Customers who find you on Google are likely leaving before they get in touch."

Not:

> "Navigation is poor. Mobile UX is suboptimal. CTA visibility is low."

**`review_slug`**

Each prospect is assigned a `review_slug` automatically generated from their business name.

Format: lowercase, hyphen-separated, no special characters.

Examples:
- `luigianos-pizzeria`
- `abc-plumbing-services`
- `warwick-dental-practice`

The slug is used as the URL path for the prospect's review page: `sortmydigital.site/review/[slug]`

Skill: `operators/skills/website-analyser.md`

---

### Step 2b: Contact Enricher

The Contact Enricher visits each prospect's website and extracts contact information — email addresses from mailto links and contact pages, plus owner names and roles from About/Team pages.

**Output:** `email` (generic contact email), plus owner name candidates written for the Owner Identifier.

Operator: `operators/contact-enricher/`

---

### Step 2c: Owner Identifier

The Owner Identifier determines who owns or runs each prospect business. Uses Companies House (UK public registry, free) to find registered directors, and website scraping (About/Team pages) as a fallback for sole traders.

**Output:** `owner_name`, `owner_role`, `owner_source` written to the prospect record.

Operator: `operators/owner-identifier/`

---

### Step 2d: Email Enricher

The Email Enricher finds the business owner's direct email address using Hunter.io. Prefers Email Finder (name + domain → email) when an owner name is available, falls back to Domain Search (all emails at domain). Also verifies email deliverability.

This replaces generic `info@` addresses with the owner's actual email, dramatically improving open rates.

**Output:** `owner_email`, `owner_email_confidence`, `owner_email_status` written to the prospect record.

Operator: `operators/email-enricher/`

---

### Step 3: Operator Review (always manual)

The operator reviews the scored prospect list in the dashboard Prospects tab. Prospects are sorted by `prospect_score` descending. The operator reads the analysis panel for each candidate, decides who to approach, and clicks "Add to outreach" to move them into the CRM pipeline at `outreached` stage.

This step is always manual. No automation moves a prospect into the pipeline. The operator makes that decision.

---

### Step 4: Cold Email Outreach (always manual)

The operator sends a cold email to the prospect manually. The `outreach_angle` from the analysis panel provides the core hook.

The email includes a link to the prospect's review page:

```
sortmydigital.site/review/[slug]
```

The review page is already live at the time of outreach. The prospect can click the link immediately.

---

### Step 5: Review Page

Lives at `sortmydigital.site/review/[slug]`.

The review page is a static SPA shell. The slug is read from the URL. Data is fetched client-side from Supabase using the slug as the lookup key.

The page shows:

- Business name
- Score displayed as `[score x 10] / 100` (e.g. a `prospect_score` of 6.4 displays as 64/100)
- Weaknesses translated into plain business-owner language. Not technical. Not patronising. Examples:
  - "People can't find what they're looking for" not "navigation is poor"
  - "Your site is hard to use on a phone" not "mobile UX is suboptimal"
  - "There's no clear way to get in touch" not "CTA placement is ineffective"
- The `review_summary` assessment written by the analyser
- A blurred mockup of what their new site could look like

When the prospect clicks "Reveal your new website", two things happen:

1. The mockup un-blurs and displays in full.
2. The `crm_status` for this prospect updates to `mockup_revealed` in Supabase automatically. No manual action required.

**Mockup upload**

The blurred mockup image is uploaded by the operator via the Pipeline drawer in the dashboard. The operator pastes the mockup URL into the field in the drawer and saves. That URL is then stored in Supabase against the prospect record and served on the review page.

---

## Chain 2 — Build

The build chain begins after the prospect responds and Nod 1 is obtained.

### The Two Execution Modes

The build chain has two runtime modes. The doctrine, state shape, and output quality are identical in both. Only the runtime differs.

**Mode 1 — Orchestration Agent (default)**

An orchestration agent (Devin) runs the full chain in a single session. It loads the doctrine, executes each step using its native capabilities, and calls external APIs (vision models, image generation) only when a capability is needed that it does not hold natively.

```
Agent session
  |-- reads doctrine + skills
  |-- Step 1: calls vision API -> writes deconstruction.json
  |-- Step 2: calls image gen API -> writes assets/ + manifest.json
  |-- Step 3: writes TSX directly -> runs next build
  `-- hands off output repo
```

When to use: any single-client build. Default mode. Fast, cheap, low coordination overhead.

**Mode 2 — Operator Pipeline (scale)**

Each step runs as a discrete stateless process. Steps consume a defined input artifact and produce a defined output artifact. Steps can run in parallel when inputs are independent. The pipeline is orchestrated by a job queue, not an agent.

```
Job queue
  |-- dispatch: mockup.jpg -> mockup-deconstructor -> deconstruction.json
  |-- dispatch: deconstruction.json + mockup.jpg -> asset-generator -> manifest.json + assets/
  `-- dispatch: deconstruction.json + manifest.json + assets/ -> frontend-builder -> site repo
```

When to use: multiple concurrent builds. Automated pipelines. Runs without a human in the loop.

---

### Build Chain Artifacts

#### Artifact 1 — `deconstruction.json`

Produced by: Mockup Deconstructor
Consumed by: Asset Generator, Frontend Builder

```
{
  page_type        string
  sections[]       id, type, layout, theme, copy_blocks[], asset_refs[]
  assets[]         id, description, source, mode_hint, bbox, aspect_ratio, priority
  components[]     inferred component names for the Sorted library
  copy[]           all visible text, attributed to section + typed
  build_notes      accent_color, font_stack, layout_system, animation_level, notes[]
  meta             mockup_file, model_used, generated_at, operator_version
}
```

Full TypeScript types: `operators/mockup-deconstructor/implementation/src/types.ts`
Zod schema: `operators/mockup-deconstructor/implementation/src/schema.ts`

#### Artifact 2 — `manifest.json` + `assets/`

Produced by: Asset Generator
Consumed by: Frontend Builder

```
manifest.json
{
  mockup          source image path
  deconstruction  source JSON path
  generated_at    ISO timestamp
  assets[]
    id            matches deconstruction asset id
    mode          recreate | extract | source | reuse
    status        ok | skipped | failed
    files
      original    path to full-res WebP
      lg          1920px variant
      md          1024px variant
      sm          640px variant
      xs          320px variant
    meta          format, width, height, source_model, prompt_used
}

assets/
  <asset_id>/
    original.webp
    lg.webp
    md.webp
    sm.webp
    xs.webp
```

Full schema: `operators/asset-generator/implementation/src/types.ts`

#### Artifact 3 — Client site repo

Produced by: Frontend Builder
Consumed by: Human review, Netlify deploy

```
<slug>-site/
  app/
    globals.css      brand tokens in @theme
    layout.tsx       client metadata + viewport
    page.tsx         section assembler
  components/
    Nav.tsx
    Footer.tsx
    sections/
      <Section>.tsx  one file per content section
  public/
    assets/          all WebP variants copied in
  client/
    brief.md         auto-populated from deconstruction
  build-log.json     per-file generation log with token usage
  package.json
  next.config.mjs
  tsconfig.json
```

---

### Build Chain Map

```
mockup.jpg
    |
    v
+-------------------------+
|  MOCKUP DECONSTRUCTOR   |  Vision model (GPT-4.1 / Claude / Gemini)
|  skill: mockup-         |  Reads: mockup.jpg
|         deconstructor   |  Writes: deconstruction.json
+-------------------------+
    |
    v
deconstruction.json
    |
    |----------------------+
    v                      v
+----------------------+   (passes through to step 3)
|  ASSET GENERATOR     |  Image gen model (gpt-image-1)
|  skill: asset-       |  Reads: mockup.jpg + deconstruction.json
|         generator    |  Writes: assets/ + manifest.json
+----------------------+
    |
    v
manifest.json + assets/
    |
    v
+-------------------------+
|  FRONTEND BUILDER       |  Code gen model (claude-sonnet-4-5)
|  skill: frontend-       |  Reads: deconstruction.json + manifest.json + assets/
|         builder         |  Writes: complete Next.js site repo
+-------------------------+
    |
    v
<slug>-site/  ->  npm run build  ->  Nod 2 review
```

---

### Build Chain Execution Rules

**For the orchestration agent**

1. Load `doctrine/operator-chain.md` at session start. Know the state shape before touching anything.
2. Run steps sequentially. The asset generator needs the deconstruction JSON before it can run.
3. Write each artifact to the canonical path before proceeding to the next step.
4. If a step fails, diagnose against the artifact schema before retrying.
5. Do not skip the build verification step. `npm run build` passing is the quality gate.

**For the operator pipeline**

1. Each operator reads its input artifact path from the job payload.
2. Each operator writes its output artifact to the path specified in the job payload.
3. Operators are stateless. They carry no memory between runs.
4. Retries are safe. Operators are idempotent given the same input.
5. The job queue is responsible for sequencing. Operators do not know about each other.

---

## CRM Pipeline

The CRM pipeline tracks every prospect from outreach to payment. It is managed via the drag-and-drop kanban board in the dashboard Pipeline tab.

### Stages

```
new -> outreached -> responded -> mockup_revealed -> build -> quote -> paid -> lost
```

| Stage | Description |
|---|---|
| `new` | Prospect added to pipeline but not yet contacted |
| `outreached` | Cold email sent. Review page link included. |
| `responded` | Prospect has replied. Conversation started. |
| `mockup_revealed` | Prospect clicked "Reveal your new website" on the review page. Auto-set. |
| `build` | Build work underway. |
| `quote` | Quote presented. Awaiting Nod 3. |
| `paid` | Payment received. Delivery in progress. |
| `lost` | Prospect dropped out at any stage. |

`mockup_revealed` is the only stage that sets itself automatically, triggered by the prospect's action on the review page. All other stage moves are manual.

### Pipeline Drawer

Clicking a card on the kanban board opens a drawer. The drawer shows:

- Review page link (`sortmydigital.site/review/[slug]`)
- Mockup URL input field (paste URL, save to push to Supabase and display on the review page)
- Advance stage button
- Mark lost button

### Metrics Bar

The dashboard Pipeline tab displays a metrics bar:

- Active count (all non-lost, non-paid prospects)
- Response rate (responded / outreached)
- Reveal rate (mockup_revealed / outreached)
- Convert rate (paid / outreached)

---

## Skill vs Operator

|  | Skill | Operator |
|---|---|---|
| What it is | Markdown doctrine loaded by the orchestration agent | Standalone Node.js / Python process |
| Runtime | Agent session | Job queue / CLI |
| State | Files on disk, read/written by the agent | Files on disk, read/written by the process |
| When to use | Single build, agent in the loop | Scale, automation, no agent |
| Source of truth | `operators/skills/<name>.md` | `operators/<name>/implementation/` |

Both execute the same doctrine. The skill is the fast path. The operator is the scale path.

---

## Adding a New Step

When adding a new step to the chain:

1. Define the input artifact shape. What does it consume, and from which upstream step?
2. Define the output artifact shape. What does it produce, and what shape?
3. Write the skill file first: `operators/skills/<name>.md`
4. The skill is the canonical specification. The operator implementation follows the skill, not the other way around.
5. Update this document with the new artifact and chain map entry.

---

## Current Chain Version

### Acquisition Chain

| Step | Skill / Operator | Status |
|---|---|---|
| Prospect Finder | `operators/prospect-finder/` | Active |
| Website Analyser | `operators/skills/website-analyser.md` | Active |
| Contact Enricher | `operators/contact-enricher/` | Active |
| Owner Identifier | `operators/owner-identifier/` | Active |
| Email Enricher | `operators/email-enricher/` | Active |
| Operator Review | Manual | Always manual |
| Cold Email Outreach | `operators/outreach-sender/` | Active |
| Review Page | `sortmydigital.site/review/[slug]` | Active |

### Build Chain

| Step | Skill | Operator | Status |
|---|---|---|---|
| Mockup Deconstructor | `operators/skills/mockup-deconstructor.md` | `operators/mockup-deconstructor/` | Active |
| Asset Generator | `operators/skills/asset-generator.md` | `operators/asset-generator/` | Active |
| Frontend Builder | `operators/skills/frontend-builder.md` | `operators/frontend-builder/` | Active |
| SortedUpdates CMS | `.devin/workflows/add-decap-cms.md` | `operators/sorted-updates/` | Active |
| Playwright Tests | | | Planned |
| Client Quote Page | | | Active |

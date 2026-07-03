# Workflow: Site Composer Prototype Run

**Purpose:** Run the first end-to-end analysis-to-screenshot prototype for a single prospect.

**Prerequisites:**
- One prospect with a website and a completed website analysis
- `operators/skills/site-composer.md` loaded
- `operators/skills/design-composer.md` loaded
- `operators/skills/asset-generator.md` loaded
- `operators/skills/frontend-builder.md` loaded

**Goal:** Produce a rendered screenshot of a complete homepage that can replace a manually created mockup on the Sorted review page.

---

## Step 1 — Confirm the prospect

Choose a single prospect with a clear local business category. Fitness, personal training, or a premium trade are the best first candidates because they have obvious trust signals and a founder face.

Record:

- Client slug: `<slug>`
- Business name
- Business category
- Website URL
- Primary conversion action
- Any known contact details

---

## Step 2 — Verify the analysis

Locate the website analysis output:

```
operators/website-analyser/implementation/output/<slug>-analysis.json
```

Confirm it contains:

- `site_score`
- `site_analysis`
- `site_weaknesses`
- `business_type`
- `outreach_angle`

If the analysis is missing or weak, re-run the Website Analyser first.

---

## Step 3 — Run the Site Composer

Load `operators/skills/site-composer.md`.

Using the analysis as input, produce:

```
operators/site-composer-operator/output/<slug>/composition.json
```

Validate the output against the schema in `operators/site-composer-operator/composition.schema.json`.

Mandatory checks:

- [ ] `sections` has at least 5 sections
- [ ] `hero_1` exists with a headline and CTA
- [ ] A trust or proof section exists
- [ ] A services or offer section exists
- [ ] A contact or final CTA section exists
- [ ] Primary CTA appears in nav, hero, and final CTA
- [ ] `assets` has at least one `critical` priority asset
- [ ] `design_doctrine` has `trust_strategy` and `conversion_strategy`
- [ ] `visual_tokens` has `palette`, `typography`, `spacing`, and `photography`
- [ ] `section_archetypes` maps every section to a known archetype
- [ ] `cta_hierarchy` is explicit with labels, hrefs, and placements
- [ ] `contact` object exists with `phone`, `phone_display`, `email`, and `location`
- [ ] `metadata` object exists with `title` and `description`
- [ ] `build_notes.accent_color` is a valid hex colour
- [ ] No lorem ipsum or placeholder copy

If validation fails, fix the specific issue. Do not proceed.

---

## Step 4 — Generate assets

Run the Asset Generator using the composition as the deconstruction input:

```bash
cd operators/asset-generator/implementation
node dist/cli.js \
  <website-screenshot-or-placeholder> \
  ../../site-composer-operator/output/<slug>/composition.json \
  --output ../../site-composer-operator/output/<slug> \
  --verbose
```

Use `--dry-run` first to count generated assets and expected cost.

After the run, confirm `manifest.json` shows all `critical` assets as `ok`.

---

## Step 5 — Render the site

Run the Frontend Builder using the composition and the generated assets:

```bash
cd operators/frontend-builder/implementation
node dist/cli.js \
  ../../site-composer-operator/output/<slug>/composition.json \
  ../../site-composer-operator/output/<slug>/manifest.json \
  ../../site-composer-operator/output/<slug>/assets \
  --slug <slug> \
  --output ../../site-composer-operator/output/<slug>-site \
  --verbose
```

Then verify the build:

```bash
cd ../../site-composer-operator/output/<slug>-site
npm run build
```

Fix any TypeScript or CSS errors before continuing.

---

## Step 6 — Generate the screenshot

Start the dev server and capture a desktop screenshot.

```bash
cd operators/site-composer-operator/output/<slug>-site
npm run dev --port 3099
```

Use Playwright or a browser screenshot tool to capture the homepage at 1280px and 390px viewports.

Save the screenshots to:

```
operators/site-composer-operator/output/<slug>/
  preview-desktop.png
  preview-mobile.png
```

---

## Step 7 — Evaluate the output

Compare the generated screenshot against the original website analysis.

Ask:

- Does it look more credible than the existing site?
- Is the primary CTA obvious within 5 seconds?
- Does the copy sound like the business, not a generic template?
- Are the generated images appropriate for the business type?
- Would a business owner recognise this as their improved site?

If the answer is no, the failure is almost always in the `design_doctrine` or `copy` sections. Fix the composition and re-run the render step. Do not regenerate the entire site blindly.

---

## Step 8 — Record the result

Write a short run record:

```
operators/site-composer-operator/output/<slug>/run-record.md
```

Include:

- What worked
- What failed
- What was manually corrected
- Cost and time estimate
- Whether the screenshot is ready for review-page use

---

## Success criteria for the first prototype

- [ ] Composition validates against the schema
- [ ] Site builds with zero errors
- [ ] Screenshot exists at desktop and mobile sizes
- [ ] Screenshot is credible enough to send to a real prospect
- [ ] The entire loop required no manual design work on the mockup

Once this is achieved, the next task is to connect the generated screenshot to the review page automatically.

---

## Doctrine checks

- [ ] The preview is a static site only. No CMS. No Decap config.
- [ ] The output follows the Sorted page pattern.
- [ ] Copy is plain English and local in tone.
- [ ] No startup language or generic AI design patterns.
- [ ] The workflow respects the skills-first doctrine: this is a skill, not a full operator CLI.

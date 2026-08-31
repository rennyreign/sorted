# Skill: op-10-internal-pages

**Operator:** 10 — Internal Page Builder
**Execution:** harness
**Trigger:** `internal-pages` is the next pending operator (after core-build-qa passes)
**Input:** mockups for each internal page + `artifacts/design-system.json`
**Output:** `artifacts/internal-pages.json` + additional pages in the site repo

---

## What you do

Manufacture the remaining website pages from their supplied mockups, using the established design system.

Each internal page follows the same sub-chain as the homepage:
```
MOCKUP → REGIONS → ASSETS → BUILD → VISUAL QA → CORRECTION → PASS
```

But internal pages inherit the established design system rather than independently inventing visual rules.

**Objective:** visual diversity with structural consistency.

## How to execute

### Step 1: Identify internal pages

Determine which internal pages are needed. Common pages:
- About
- Services (detail)
- Contact
- Team
- Gallery
- Pricing
- Booking
- Privacy
- Terms

For each page, you need:
- A mockup image (provided by Renaldo + ChatGPT)
- The page name/slug

If no internal page mockups are provided, skip this operator (mark as `skipped`).

### Step 2: Register pages in build state

Update `build-state.json` with the list of internal pages (page_id, page_name, mockup_reference, status: pending).

### Step 3: Build each page

For each internal page, run the sub-chain:

#### 3a. Region decomposition (reuse Operator 1 skill)
- Read the page mockup
- Decompose into regions
- Write `artifacts/internal-pages/<page_id>/regions.json`

#### 3b. Asset reconstruction (reuse Operator 2)
- If the page needs new images, run the asset generator
- If the page reuses homepage assets, reference the existing registry
- Write to `artifacts/internal-pages/<page_id>/assets/`

#### 3c. Frontend build
- Read the design-system.json
- Write the page component(s) inheriting the design system
- Add the route to the site repo (e.g. `app/about/page.tsx`)
- Use the same stack constraints as Operator 4

#### 3d. Visual QA (reuse Operator 5 skill)
- Screenshot the rendered page
- Compare against the page mockup
- Record discrepancies

#### 3e. Pixel correction (reuse Operator 6 skill)
- Fix discrepancies
- Re-verify

#### 3f. Mark page as passed

### Step 4: Build verification

After all pages are added:
```bash
cd <build-dir>/site
npm run build
```

All routes must generate successfully.

### Step 5: Write internal-pages.json

```json
{
  "pages": [
    {
      "page_id": "about",
      "page_name": "About Us",
      "status": "passed",
      "qa_iterations": 1,
      "path": "/about"
    },
    {
      "page_id": "services",
      "page_name": "Services",
      "status": "passed",
      "qa_iterations": 2,
      "path": "/services"
    }
  ],
  "all_passed": true,
  "completed_at": "<ISO timestamp>"
}
```

### Step 6: Mark passed

Mark `internal-pages` as passed in build state.

## Validation

- `internal-pages.json` exists and is valid JSON
- All pages have status `passed`
- `npm run build` passes with all routes generating
- Each page inherits the design system (consistent typography, colours, spacing)

## Failure states

- Page mockup missing → skip that page, note in build state
- Page fails visual QA after 3 iterations → escalate that page
- Build fails after adding pages → fix the specific page causing the error

## Notes

- Reuse existing operators (1, 2, 5, 6) for each page rather than duplicating logic
- The design system is the contract — pages should look like they belong to the same site
- Visual diversity comes from content and layout variations, not from different design rules

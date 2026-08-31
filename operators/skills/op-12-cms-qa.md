# Skill: op-12-cms-qa

**Operator:** 12 — CMS QA
**Execution:** harness
**Trigger:** `cms-qa` is the next pending operator (after cms-integration passes)
**Input:** the site repo with CMS installed
**Output:** `artifacts/cms-qa.json`

---

## What you do

Test the actual customer editing workflows using Playwright browser automation. Verify that the CMS works end-to-end from the customer's perspective.

## How to execute

### Step 1: Start the dev server

```bash
cd <build-dir>/site
npm run dev --port 3099
```

### Step 2: Run Playwright tests

Use Playwright to test each workflow:

#### Test 1: CMS access
- Navigate to `http://localhost:3099/cms/`
- Verify the Studio shell loads
- Verify the Sorted wordmark + green dot appears
- Verify site identity (initial mark + name) appears

#### Test 2: Navigation
- Click each page tab
- Verify each shows its sections
- Click each section
- Verify each opens an editor with at least one editable control

#### Test 3: Text editing
- Edit a text field
- Verify the value updates
- Save (local mode: "Save draft")
- Verify the file changed on disk

#### Test 4: Image field
- Find an image field
- Verify thumbnail displays
- Verify path input is populated

#### Test 5: List field (if applicable)
- Find a list field
- Verify inline cards show summary previews
- Test add/remove items

#### Test 6: Save and persistence
- Make a test edit
- Save
- Reload the page
- Verify the edit persisted

#### Test 7: Build regeneration
- After saving, run `npm run build`
- Verify `studio-content.json` regenerates
- Verify build passes

#### Test 8: Frontend rendering
- After save + build, check the frontend page
- Verify the edited content appears on the live site

#### Test 9: Reset behaviour
- If a reset script exists, test it
- Verify content returns to baseline

### Step 3: Record results

For each test, record pass/fail and details.

### Step 4: Restore test edits

Undo any test edits before completing. The site should be in its baseline state.

### Step 5: Write cms-qa.json

```json
{
  "tests": [
    { "test": "cms_access", "passed": true, "details": "Studio shell loads correctly" },
    { "test": "navigation", "passed": true, "details": "All pages and sections accessible" },
    { "test": "text_editing", "passed": true },
    { "test": "image_field", "passed": true },
    { "test": "list_field", "passed": true },
    { "test": "save_persistence", "passed": true },
    { "test": "build_regeneration", "passed": true },
    { "test": "frontend_rendering", "passed": true },
    { "test": "reset_behaviour", "passed": true }
  ],
  "overall_passed": true,
  "tested_at": "<ISO timestamp>"
}
```

### Step 6: Mark passed

Mark `cms-qa` as passed in build state.

## Validation

- `cms-qa.json` exists and is valid JSON
- All tests have a pass/fail recorded
- `overall_passed` correctly reflects whether all tests passed
- Test edits were restored

## Failure states

- CMS doesn't load → check file paths, check build
- Save doesn't work → check local proxy or Git Gateway config
- Build fails after edit → check studio-content.json generation
- Reset doesn't work → check reset script

## Notes

- Use Playwright for browser automation — it's already available as a skill
- Test on both desktop and mobile layouts
- The CMS is customer-facing infrastructure — it must work reliably

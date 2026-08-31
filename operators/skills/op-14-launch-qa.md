# Skill: op-14-launch-qa

**Operator:** 14 — Launch QA
**Execution:** harness
**Trigger:** `launch-qa` is the next pending operator (after analytics passes)
**Input:** the site repo (CMS-enabled, analytics-tracked)
**Output:** `artifacts/launch-qa.json`

---

## What you do

Perform final production-readiness validation. This is the final quality gate. A failure prevents deployment.

Follow the existing `operators/skills/launch-qa.md` skill — it defines the full gate specification. This operator wraps it into the manufacturing line.

## How to execute

### Step 1: Load the launch-qa skill

Read `operators/skills/launch-qa.md` in full. It defines 11 gates:

1. Visual QA (multi-viewport)
2. Functional QA (all user actions)
3. Performance (Lighthouse)
4. Images (format, size, alt text, loading)
5. SEO (title, meta, canonical, sitemap, structured data)
6. Accessibility (semantic HTML, contrast, keyboard nav)
7. Analytics (events fire)
8. Security and production hygiene (HTTPS, no secrets, no staging URLs)
9. Recovery (baseline commit, reset path)
10. Ownership (domain, registrar, CMS access, integrations)
11. Crawl (no 404s, no broken links, no placeholders)

### Step 2: Determine the test URL

- If deploying to Netlify: use the deploy preview URL
- If testing locally: `http://localhost:3099`
- Confirm the canonical domain with the user

### Step 3: Run each gate

Execute each gate per the launch-qa skill:

**Visual QA:**
- Screenshot at 390px, 768px, 1440px, 1920px
- Check navigation, hero, typography, spacing, no horizontal overflow

**Functional QA:**
- Test every nav link, CTA, phone/email/WhatsApp link, form, booking flow
- Forms must be tested end-to-end (submission → thank-you → destination confirmed)

**Performance:**
- Run Lighthouse (mobile)
- Targets: Performance 90+, Accessibility 90+, Best Practices 95+, SEO 95+
- Core Web Vitals: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1

**Images:**
- Check formats (SVG for logos, WebP for photos)
- Check sizes (hero <300KB, content photos <150KB)
- Check alt text on all meaningful images
- Check LCP image is not lazy-loaded

**SEO:**
- Unique title, meta description, canonical URL
- H1/H2 hierarchy
- robots.txt, sitemap.xml
- Open Graph metadata
- Favicon

**Accessibility:**
- Semantic landmarks, one H1, input labels, alt text
- Keyboard navigation, visible focus states
- Contrast 4.5:1 for normal text

**Analytics:**
- Verify conversion events fire (form_submit, phone_click, etc.)

**Security:**
- HTTPS, HTTP→HTTPS redirect
- No secrets in bundle
- No staging URLs or localhost references
- Console errors = 0

**Recovery:**
- Baseline commit recorded
- Reset script works

**Ownership:**
- Document domain, registrar, Netlify owner, CMS access, analytics property

**Crawl:**
- Crawl all routes
- Fail for: 404/500, broken images, broken links, HTTP on HTTPS, staging URLs, placeholder href="#", lorem ipsum, example@example.com

### Step 4: Write launch-qa.json

Follow the format from the launch-qa skill:

```json
{
  "client": "<client-slug>",
  "status": "PASS",
  "tested_url": "<URL>",
  "canonical_domain": "<domain>",
  "checked_at": "<ISO timestamp>",
  "branch": "<branch>",
  "commit": "<SHA>",
  "gates": {
    "visual": "PASS",
    "functional": "PASS",
    "performance": "PASS",
    "images": "PASS",
    "seo": "PASS",
    "accessibility": "PASS",
    "analytics": "PASS",
    "security": "PASS",
    "recovery": "PASS",
    "ownership": "PASS",
    "crawl": "PASS"
  },
  "issues": []
}
```

Issues that fail:
```json
{
  "id": "SEO_001",
  "severity": "BLOCKER",
  "gate": "seo",
  "page": "/",
  "expected": "Canonical URL matches production domain",
  "actual": "Canonical points to deploy preview",
  "owner": "frontend-builder",
  "evidence": "HTML head inspection"
}
```

### Step 5: Mark passed or failed

- `PASS` — all gates pass, no blockers → mark `launch-qa` as passed
- `FAIL` — any blocker remains → mark as failed, fix issues, re-run
- `PASS_WITH_WARNINGS` — all blockers resolved, warnings explicitly acceptable → mark as passed with notes

## Validation

- `launch-qa.json` exists and is valid JSON
- All 11 gates have a status
- `issues` array lists all failures with severity
- `status` correctly reflects gate results

## Failure states

- Any BLOCKER issue → cannot deploy, must fix first
- Lighthouse can't run → check if site is accessible, check headless Chrome
- Crawl finds broken links → fix the links or redirects

## Notes

- This is the final quality gate. Take it seriously.
- QA reports issues. QA does not silently fix issues. Route failures to the responsible operator.
- Refer to `operators/skills/launch-qa.md` for the full detailed specification.

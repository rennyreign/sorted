# Skill: launch-qa

**Type:** Finalization / QA skill  
**Trigger:** User asks to make a client site launch-ready, run final QA, verify production readiness, or move a site from `CMS_CONFIGURED` / `BUILD_COMPLETE` to `LAUNCH_READY`  
**Output:** Launch QA report at `client/qa/launch-report.json` and `client/qa/launch-report.md`

---

## Purpose

This skill turns finalization from informal finishing touches into a deterministic launch gate.

A site is not `LAUNCH_READY` because it looks complete. It is `LAUNCH_READY` only when the required gates pass and a recoverable baseline is recorded.

```text
BUILD_COMPLETE
  ↓
CMS_CONFIGURED
  ↓
LAUNCH_QA
  ├── FAIL → issue JSON → specialist operator → LAUNCH_QA again
  └── PASS → BASELINE_COMMIT → LAUNCH_READY
```

---

## Before starting

Confirm or infer:

- Client slug.
- Repo branch under test.
- URL under test: deploy preview, staging URL, or production candidate.
- Expected canonical domain.
- Primary conversion action: call, email, WhatsApp, form, booking, checkout, purchase, join class, or request quote.
- Expected analytics events.
- Expected CMS path and handoff requirements, if Stage 2 applies.

If any expectation is unknown, record it as `UNKNOWN` in the report and decide whether it blocks launch. Do not silently assume form destinations, analytics IDs, ownership records, or domain rules.

---

## Required gates

### 1. Visual QA

Test at these viewport widths where practical:

- 390px mobile
- 768px tablet
- 1440px laptop/desktop
- 1920px wide desktop

Check:

- Navigation.
- Hero crop and primary CTA visibility.
- Typography wrapping.
- Section spacing.
- Sticky or fixed elements.
- Forms, modals, booking widgets, cookie notices, and floating CTAs.
- No horizontal overflow.

### 2. Functional QA

Exercise every user action:

- Internal navigation links.
- Primary and secondary CTAs.
- Phone, email, and WhatsApp links.
- Forms.
- Booking flows.
- Ecommerce flows where relevant.
- CMS login path where Stage 2 applies.

Forms must be tested end-to-end:

```text
TEST LEAD
  ↓
submission accepted
  ↓
thank-you state displayed
  ↓
destination email / CRM / storage confirmed
  ↓
analytics event confirmed
```

### 3. Performance

Use mobile Lighthouse as the default gate:

- Performance target: 90+
- Accessibility target: 90+
- Best Practices target: 95+
- SEO target: 95+

Core Web Vitals targets:

- LCP ≤2.5s
- INP ≤200ms
- CLS ≤0.1

Do not promise 100/100. Scores fluctuate; blocking decisions should prioritize material user-facing failures and Core Web Vitals.

### 4. Images

Image delivery rules:

- Logos and icons should be SVG where practical.
- Photography should prefer AVIF/WebP with fallback where practical.
- Every meaningful image needs useful alt text.
- Every image needs dimensions or a stable aspect ratio.
- The primary hero/LCP image must not be lazy-loaded.
- The primary hero/LCP image should use eager loading and high fetch priority where the implementation allows it.
- Below-fold images should lazy-load.
- Responsive `srcset` / `sizes` or equivalent generated variants should be used where practical.

Sorted image budget:

| Asset | Target |
|---|---:|
| Logo/icon | SVG wherever possible |
| Small thumbnail | ~20–60 KB |
| Normal content photo | ~50–150 KB |
| Large section image | ~100–200 KB |
| Hero/LCP image | ideally ~150–300 KB |
| Full-screen photography | generally <400 KB |
| 1 MB+ image | QA warning |
| 2 MB+ image | fail unless explicitly justified |

The practical rule is:

> No browser downloads substantially more image than it can use.

### 5. SEO

Check:

- Unique `<title>`.
- Meta description.
- Canonical URL.
- Sensible H1/H2 hierarchy.
- Descriptive URLs.
- `robots.txt`.
- `sitemap.xml`.
- Correct index/noindex behavior.
- Open Graph metadata.
- Twitter/social metadata where relevant.
- LocalBusiness / Organization / Service structured data where relevant.
- Favicon and site icons.
- 404 page.
- Redirects from important old URLs if replacing an existing site.

### 6. Accessibility

Check:

- Semantic landmarks.
- One logical H1.
- Input labels.
- Useful alt text.
- Keyboard navigation.
- Visible focus states.
- Appropriate ARIA only where necessary.
- Contrast meets the Sorted 4.5:1 guardrail for normal text.
- Buttons are buttons and links are links.

### 7. Analytics

Verify meaningful conversion events actually fire. Examples:

- `form_submit`
- `phone_click`
- `email_click`
- `whatsapp_click`
- `booking_started`
- `booking_completed`
- `checkout_started`
- `purchase`

Analytics installed but unverified is not a pass.

### 8. Security and production hygiene

Check:

- HTTPS.
- HTTP → HTTPS redirect.
- `www` / non-`www` canonicalization.
- No secrets in the client bundle.
- Production API endpoints.
- No staging domains or localhost references.
- No accidental source maps if policy says to disable them.
- Console errors = 0 on critical pages.
- Dependency audit reviewed where practical.
- Form spam protection where relevant.

### 9. Recovery

After all launch gates pass:

- Confirm the feature branch is merged intentionally.
- Record the passing commit SHA.
- Create `baseline-v1` or `baseline/<client-slug>` tag.
- Confirm reset script or recovery path still works where SortedUpdates applies.

### 10. Ownership

Document:

- Domain registrar and canonical domain.
- Netlify/project owner.
- CMS access model.
- Analytics property.
- Form destination.
- Booking, payment, CRM, email, and third-party integrations.
- Sorted reset responsibility.

### 11. Crawl

Crawl internal routes and fail for:

- 404 / 500.
- Broken image.
- Broken internal link.
- HTTP asset on HTTPS page.
- Staging URL.
- `localhost`.
- Placeholder `href="#"`.
- `lorem ipsum`.
- `example@example.com`.
- Accidental `noindex`.
- Orphan pages where discoverability matters.

---

## Issue ownership

Route failures to the smallest responsible operator:

| Gate | Default owner |
|---|---|
| Visual | frontend-builder |
| Functional | frontend-builder or integration owner |
| Performance | frontend-builder |
| Images | asset-generator |
| SEO | frontend-builder |
| Accessibility | frontend-builder |
| Analytics | analytics/integration owner |
| Security | deployment/integration owner |
| Recovery | launch owner |
| Ownership | launch owner |
| Crawl | frontend-builder |

QA reports issues. QA does not silently fix issues.

---

## Output files

Write:

```text
client/qa/launch-report.json
client/qa/launch-report.md
```

If `client/qa/` does not exist, create it.

Minimum JSON report:

```json
{
  "client": "client-slug",
  "status": "PASS",
  "tested_url": "https://deploy-preview.example.netlify.app",
  "canonical_domain": "https://example.com",
  "checked_at": "2026-08-07T12:00:00Z",
  "branch": "feat/stage-1-build",
  "commit": "UNKNOWN",
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

Issue object:

```json
{
  "id": "SEO_001",
  "severity": "BLOCKER",
  "gate": "seo",
  "page": "/",
  "asset": null,
  "expected": "Canonical URL matches production domain",
  "actual": "Canonical points to deploy preview",
  "owner": "frontend-builder",
  "evidence": "HTML head inspection"
}
```

Severity:

- `BLOCKER` — cannot launch.
- `WARNING` — can launch only with deliberate acceptance.
- `NOTE` — non-blocking observation.

---

## Launch decision

Return `PASS` only when every blocking gate passes.

Return `FAIL` when any blocker remains.

Return `PASS_WITH_WARNINGS` only when all blockers are resolved and remaining issues are explicitly acceptable for launch.

---

## References

- `sorted-os/03-sites/qa.md`
- `sorted-os/03-sites/launch.md`
- `sorted-os/07-operators/qa-operator.md`
- Google Core Web Vitals thresholds: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 — https://web.dev/articles/defining-core-web-vitals-thresholds
- Google image SEO guidance: standard `<img>`/`picture`, responsive images, supported formats including AVIF/WebP/SVG, and image speed/quality — https://developers.google.com/search/docs/appearance/google-images
- Google sitemap guidance — https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- web.dev image performance guidance: do not lazy-load likely LCP images; use `fetchpriority="high"` only for truly important images — https://web.dev/learn/images/performance-issues
- MDN performance guidance: use WOFF/WOFF2 and `font-display: swap` — https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Best_practices

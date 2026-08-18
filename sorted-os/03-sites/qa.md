# Quality Assurance

QA is a manufacturing gate, not subjective finishing polish. The site is not launchable because it looks complete; it is launchable only when required gates pass.

## Stage 1 Build Gate

- `npm run build` passes with no TypeScript or CSS errors.
- All approved sections are present in the correct order.
- No broken asset paths or placeholder copy.
- The hero and primary CTA are clear immediately.
- The site is safe at a 375px viewport with no horizontal scrolling.

## Stage 2 CMS Gate

- Every visible string, image, and media asset is supplied through typed content loaders and JSON.
- Every loader field has a matching CMS field.
- Loader fallbacks exactly match approved handoff content.
- Sorted Studio loads at `/cms/`; stock Decap remains fallback-only at `/cms/decap.html`.
- Existing content controls work, saved test edits are restored, build passes, and focused CMS smoke tests pass.

## Launch QA Gate

The Launch QA Operator blocks `CMS_CONFIGURED → LAUNCH_READY` until these gates pass:

| Gate | Requirement |
|---|---|
| Visual QA | Desktop, tablet, and mobile screenshots checked at 390px, 768px, 1440px, and 1920px where practical. |
| Functional QA | Every link, button, form, booking action, phone link, email link, WhatsApp link, ecommerce action, and CMS login path tested. |
| Performance | Mobile Lighthouse target: Performance 90+, Accessibility 90+, Best Practices 95+, SEO 95+. Core Web Vitals targets: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. |
| Images | Responsive sources, modern formats where practical, dimensions/aspect ratios declared, hero/LCP image prioritized, below-fold images lazy-loaded. |
| SEO | Unique titles, meta descriptions, canonical URL, robots, sitemap, structured data, Open Graph, social metadata, favicon, 404, and clean heading hierarchy. |
| Accessibility | Semantic landmarks, one logical H1, labels, useful alt text, visible focus states, keyboard operation, buttons/links used correctly, and 4.5:1 contrast guardrail. |
| Analytics | Analytics installed and meaningful conversion events verified, not merely configured. |
| Security | HTTPS, canonical host, no exposed secrets, production endpoints, dependency status reviewed, form protection in place where relevant. |
| Recovery | Feature branch merged intentionally, known-good commit recorded, `baseline-v1` or `baseline/<client-slug>` tag created after pass. |
| Ownership | Domain, CMS, analytics, forms, integrations, and reset responsibility documented. |
| Crawl | No broken links, broken images, staging URLs, `localhost`, `href="#"`, accidental `noindex`, lorem ipsum, or placeholder contact details. |

QA produces a machine-readable issue list. QA does not silently fix failures; specialist operators or the responsible builder fix the issues, then QA runs again.

Source: `operators/skills/site-build.md`, `operators/skills/launch-qa.md`, `doctrine/all-content-is-editable.md`, `doctrine/sorted-studio-cms.md`.

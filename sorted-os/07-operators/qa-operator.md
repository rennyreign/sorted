# Quality Assurance Operator

The QA role enforces the manufacturing standard rather than offering subjective polish alone.

QA has three operating modes:

1. **Stage 1 Build QA** — verifies the static client site before Nod 2.
2. **Stage 2 CMS QA** — verifies SortedUpdates and all editable content controls.
3. **Launch QA** — verifies the final production candidate before `LAUNCH_READY`.

## Responsibility Boundary

QA does not become the builder. It identifies blocking issues, records evidence, and returns a structured failure report. The relevant specialist operator fixes the issue, then QA runs again.

This preserves the one-responsibility rule:

```text
QA Operator → issue JSON
Specialist Operator → fix
QA Operator → re-test
```

## Launch QA Inputs

- Client slug.
- Repository URL and branch.
- Deploy preview, staging URL, or production-candidate URL.
- Expected canonical domain.
- Primary conversion action.
- Expected forms, booking flows, ecommerce actions, and analytics events.
- CMS path and expected login/handoff state where Stage 2 applies.

## Launch QA Output

The operator writes a launch report at the canonical project path:

```text
client/qa/launch-report.json
client/qa/launch-report.md
```

Minimum JSON shape:

```json
{
  "client": "client-slug",
  "status": "PASS",
  "tested_url": "https://example.netlify.app",
  "canonical_domain": "https://example.com",
  "checked_at": "2026-08-07T12:00:00Z",
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

Failure report issue shape:

```json
{
  "status": "FAIL",
  "issues": [
    {
      "id": "IMAGE_WEIGHT_001",
      "severity": "BLOCKER",
      "gate": "images",
      "page": "/",
      "asset": "/hero.jpg",
      "expected": "Hero/LCP image delivered under 400 KB unless justified",
      "actual": "1842 KB",
      "owner": "asset-generator",
      "evidence": "Network panel asset transfer size"
    }
  ]
}
```

## Blocking Gates

- Visual responsive QA.
- Functional links, CTAs, forms, booking, ecommerce, phone, email, and WhatsApp paths.
- Performance and Core Web Vitals targets.
- Image delivery budget and responsive image behavior.
- Technical SEO baseline.
- Accessibility baseline.
- Analytics and conversion events.
- Security and production hygiene.
- Recovery baseline.
- Ownership documentation.
- Crawl integrity.

QA blocks handoff when a required gate fails. It also restores any test content edits before work is committed or delivered.

Source: `operators/skills/site-build.md`, `operators/skills/launch-qa.md`, `doctrine/all-content-is-editable.md`, `doctrine/sorted-studio-cms.md`.

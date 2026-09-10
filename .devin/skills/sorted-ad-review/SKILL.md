---
name: sorted-ad-review
description: Provision, configure, populate, upgrade, or QA Sorted Ad Review portals for client advertising approvals. Always use when a client needs an /ads portal, campaign approval board, ad review link, or visual changes to the review experience. The Edgbaston Tuition Centre portal is the mandatory interface standard. Never create a separate client-specific portal UI and never use this workflow to publish ads to Meta or Google.
---

# Sorted Ad Review

There is one uniform Sorted Ad Review product. Tenants may change data and identity, not the interface.

Read and follow these repository sources before acting:

1. `operators/skills/sorted-ad-review/SKILL.md`
2. `operators/skills/sorted-ad-review/references/doctrine.md`
3. `operators/skills/sorted-ad-review/references/interface-standard.md`
4. `operators/skills/sorted-ad-review/references/campaign-contract.md` when creating or revising campaigns

The live Edgbaston Tuition Centre `/ads/` portal is the visual and interaction acceptance benchmark. `apps/ad-review/` is the maintained central implementation. Never build or style another client-local portal. Client repositories own only the thin `/ads/` transport to their central tenant workspace.

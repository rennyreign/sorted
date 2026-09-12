---
name: sorted-ad-review
description: Provision, configure, populate, upgrade, or QA the Sorted Ads workspace for client advertising approvals. Always use when a client needs an ad campaign board, campaign approval workflow, ad review link, or visual changes to the ads experience. All clients live under one portal at sortmydigital.site/ads/ with an account selector. Never create a separate client-specific portal UI and never use this workflow to publish ads to Meta or Google.
---

# Sorted Ads

There is one Sorted Ads product. All client accounts live under a single portal at `sortmydigital.site/ads/`. An account selector dropdown switches between accounts (e.g., School of Skill, Edgbaston Tuition). Clients do not log in — they receive shared preview links.

Read and follow these repository sources before acting:

1. `operators/skills/sorted-ad-review/SKILL.md`
2. `operators/skills/sorted-ad-review/references/doctrine.md`
3. `operators/skills/sorted-ad-review/references/interface-standard.md`
4. `operators/skills/sorted-ad-review/references/campaign-contract.md` when creating or revising campaigns

The Sorted Ads workspace at `sortmydigital.site/ads/` is the sole interface. Never build or style a separate client-specific portal. Client accounts are tenants within the single portal, not separate deployments.

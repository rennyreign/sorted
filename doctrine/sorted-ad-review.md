# Sorted Ad Review doctrine

Canonical doctrine: `operators/skills/sorted-ad-review/references/doctrine.md`

Canonical interface contract: `operators/skills/sorted-ad-review/references/interface-standard.md`

The Edgbaston Tuition Centre `/ads/` portal is the mandatory visual and interaction benchmark. `apps/ad-review/` is the maintained multi-tenant implementation. Client repositories own only a thin route to that central product and must not create separate portal interfaces.

# Factory Reset — Sorted Delivery Standard

Every site Sorted ships includes a factory reset capability. This is a product feature, not a support process.

---

## What it is

The factory reset restores all CMS-editable content to the exact state it was in at handoff — the moment Sorted signed off the build and the client received access.

Design, code, and structure are unaffected. Only content files are restored.

---

## How it works

At handoff, the git SHA of the delivery commit is recorded in two places:

1. `content/site/general.json` → `handoffSha` field (visible in Site Settings CMS)
2. `scripts/reset.sh` → `HANDOFF_SHA` variable (operator-executed)

When a reset is needed, Sorted runs:

```bash
# Dry run — see what would change
bash scripts/reset.sh

# Execute the reset
bash scripts/reset.sh --execute
git push origin main
```

Netlify detects the commit and deploys. The site is restored within ~60 seconds.

---

## When to use it

- Client has made content changes that are too far from the approved build
- Client requests a "start over" on their content
- Site content is incoherent or broken after experimental edits
- Warranty case: content damage within the agreed support window

---

## Delivery checklist

Every Sorted site ships with:

- [ ] `scripts/reset.sh` committed with the correct `HANDOFF_SHA`
- [ ] `content/site/general.json` contains `handoffSha` and `handoffDate`
- [ ] The handoff commit is tagged: `git tag handoff/<client-slug> <sha>`

---

## Tagging the handoff commit

At delivery, run:

```bash
git tag handoff/savannah-villegas da8cdc3
git push origin --tags
```

This makes the handoff state permanently and visibly marked in the repo history. The reset script can reference the tag name instead of a SHA if preferred:

```bash
HANDOFF_SHA="handoff/savannah-villegas"
```

---

## Doctrine alignment

Factory reset is the technical implementation of the **loader fallback defaults** principle.

The fallback defaults in `lib/content.ts` represent the approved content. The JSON files in `content/` represent what the client has changed. A reset brings the JSON files back in line with the fallback state.

> The product owner holds the reset key. The client holds the content layer. Design is never at risk.

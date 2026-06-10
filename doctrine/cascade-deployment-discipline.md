# Cascade Deployment Discipline

**Status:** Active doctrine  
**Parent:** Sorted Operating Model  
**Purpose:** Eliminate wasteful Netlify credit burn through branch-based development workflow

---

## The Problem

Every push to `main` on a Sorted client site triggers a Netlify build + deploy. During active development:

- Micro-commits for iterative work = dozens of builds per session
- Live site shows broken/incomplete work to visitors
- Netlify build credits consumed on non-production code
- No separation between "work in progress" and "client-ready"

This is expensive and unprofessional.

---

## The Solution: Branch-Based Development

All Sorted client sites follow this deployment discipline:

```
feature/work-description  →  Deploy Preview (free)  →  PR  →  merge  →  main  →  Production
```

### Branch Naming

```
feat/bodysharp-restructure
feat/sandra-cms-wiring
fix/gbhalesowen-nav-link
chore/warwickshire-content-update
```

### The Rule

**Never push directly to `main`. Ever.**

- Create a feature branch for any work
- Netlify auto-creates Deploy Previews for all branches (free)
- Review on Deploy Preview URL, not production
- Merge to `main` only when work is complete and tested
- `main` deploys are production releases only

---

## Workflow by Phase

### Phase 1: Active Development (Branch)

```bash
# Start work
git checkout -b feat/bodysharp-restructure

# Iterate freely — commit as often as needed
git add .
git commit -m "feat: add join/cohort page structure"
git push origin feat/bodysharp-restructure
```

Netlify automatically:
- Builds the branch
- Creates a Deploy Preview URL
- Does NOT affect the live site
- Costs zero build credits (branch deploys are free/unmetered)

### Phase 2: Review (Deploy Preview)

```
https://deploy-preview-42--bodysharp-fitness.netlify.app
```

- Share preview URL for internal review
- Test responsive, interactions, copy
- Iterate on branch with more commits
- Live site remains untouched

### Phase 3: Release (Merge to Main)

```bash
# When ready for production
git checkout main
git merge --no-ff feat/bodysharp-restructure
git push origin main
```

Netlify:
- Builds `main`
- Deploys to production URL
- Consumes one build credit (acceptable for releases)

---

## Per-Project Setup

### 1. Branch Protection (GitHub)

In each client repo settings:

```
Settings → Branches → Add rule
- Branch name pattern: main
- Require a pull request before merging: ✓
- Require status checks to pass: ✓ (Netlify deploy preview)
- Include administrators: ✓
```

### 2. Netlify Settings

```
Site settings → Build & deploy → Deploy contexts
- Production branch: main
- Deploy previews: Automatically build deploy previews for all pull requests ✓
- Branch deploys: None (we use PR previews, not branch deploys)
```

### 3. Local Dev Script

Add to each client site's `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "preview": "open https://deploy-preview-\$(git branch -r | grep 'feat' | head -1 | sed 's/.*preview-//')--\$(git remote get-url origin | sed 's/.*netlify.com\\/\\(.*\\)\\/.*/\\1/').netlify.app"
  }
}
```

Or simply: `npm run dev` for local, check Deploy Preview URL in PR.

---

## Emergency Override

If a critical fix must reach production immediately:

```bash
git checkout main
git cherry-pick <commit-hash>
git push origin main
```

This is the only exception. Document the reason in commit message.

---

## Impact

| Before (Direct to Main) | After (Branch Discipline) |
|------------------------|---------------------------|
| 20-50 builds per dev session | 1 build per dev session (preview) |
| Live site shows broken work | Live site always production-ready |
| High credit burn | Near-zero credit burn during dev |
| No review step | Built-in review via Deploy Preview |
| Risk of client seeing WIP | Client sees only approved releases |

---

## Agent Rules Update

**All Sorted client site AGENTS.md files must include:**

```markdown
## Deployment Discipline

**Never push directly to `main`.**

- Work in feature branches: `feat/description`
- Netlify Deploy Previews build automatically (free)
- Review on preview URL before merging
- Merge to `main` only for production releases
- `main` deploys consume credits — make them count
```

---

## Verification Checklist

Before starting work on any Sorted client site:

- [ ] Branch protection enabled on `main`
- [ ] Working on feature branch, not `main`
- [ ] Deploy Preview building successfully
- [ ] Only merge when work is client-ready

**The discipline is the product.**

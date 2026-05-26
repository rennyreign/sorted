---
description: Scaffold a new Sorted client site repo from the template
---

# New Client Site — Scaffold Workflow

Run this before assigning any build task to Codex or Cascade.
This eliminates all infrastructure setup from the build task — the agent arrives at a working Next.js project and builds the client's site, not the boilerplate.

---

## Step 1 — Create the client repo on GitHub

Create a new **private** repo on GitHub: `rennyreign/[client-slug]`
e.g. `rennyreign/sandra` or `rennyreign/roye-music`

Do not initialise with a README — keep it empty.

---

## Step 2 — Copy the scaffold into the client folder

```bash
# Replace [client-slug] with the actual folder name
cp -r ~/Projects/sorted/templates/client-site/. ~/Projects/[client-slug]/
```

---

## Step 3 — Initialise git and push

```bash
git init
git add -A
git commit -m "init: scaffold from sorted client-site template"
git remote add origin https://github.com/rennyreign/[client-slug].git
git push -u origin main
```

---

## Step 4 — Fill in the client brief

Open `client/brief.md` and fill in what you know:
- Business name, location, contact details
- Business type and primary conversion action
- Brand colours (if known)
- Pages required
- Any copy or assets available

The more complete the brief, the tighter the build task.

---

## Step 5 — Add the mockup and assets

Place the mockup image(s) in `client/assets/`.
Place the logo (if available) in `client/assets/` and `public/`.

---

## Step 6 — Deploy to Netlify

Connect the repo to Netlify before handing to Codex:
- Netlify → Add new site → Import from Git → select the repo
- Build command: `npm run build`
- Publish directory: `out`
- Enable Netlify Image CDN

This gives Codex a live preview URL to reference during the build.

---

## Step 7 — Assign the Stage 1 build task

Hand Codex:
- The repo (it already contains `AGENTS.md` with full build instructions)
- The filled `client/brief.md`
- The mockup in `client/assets/`

The build instruction to Codex can be as simple as:

> "Build the Stage 1 site for [client name]. Read AGENTS.md and client/brief.md. The mockup is in client/assets/. Standard tier unless brief specifies Premium."

Codex does not need further instruction — `AGENTS.md` contains the full skill cascade, page patterns, copy rules, motion standards, and quality checklist.

---

## Step 8 — After build approval (Nod 2) — trigger Stage 2

Once the client approves the build, apply SortedUpdates:

**Workflow:** `.windsurf/workflows/add-decap-cms.md`

---

## Notes

- The scaffold already includes: Next.js, TailwindCSS v4, Nav, Footer, PageTransition, animation system, static export config
- Codex should customise these — not rebuild them
- `AGENTS.md` in the client repo is Stage 1 scoped — it explicitly tells Codex not to apply the CMS
- After Stage 2, add `decap-server` to `package.json` and follow the CMS workflow

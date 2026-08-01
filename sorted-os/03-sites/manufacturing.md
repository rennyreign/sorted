# Manufacturing

The Sites build chain begins after Nod 1.

1. **Mockup Deconstructor** converts the approved mockup into `deconstruction.json`.
2. **Asset Generator** produces image assets and `manifest.json`.
3. **Frontend Builder** produces the Next.js client-site repository.
4. **Build verification** requires `npm run build` to pass before Nod 2 review.
5. **SortedUpdates** is applied after Nod 2 as Stage 2 delivery work.

Artifacts are written to canonical paths and act as resumable checkpoints. A failed step is diagnosed and rerun at that step rather than restarting the whole chain.

The site stack is Next.js static export and Tailwind CSS v4. The build uses real content and assets, Lucide icons, existing dependencies, and a mobile-safe primary CTA.

Source: `doctrine/operator-chain.md`, `operators/skills/site-build.md`, `operators/skills/frontend-builder.md`.

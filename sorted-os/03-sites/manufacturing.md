# Manufacturing

The Sites build chain begins after Nod 1 and ends only when the site reaches `LAUNCH_READY`.

1. **Mockup Deconstructor** converts the approved mockup into `deconstruction.json`.
2. **Asset Generator** produces image assets and `manifest.json`.
3. **Frontend Builder** produces the Stage 1 Next.js client-site repository.
4. **Build verification** requires `npm run build` to pass before Nod 2 review.
5. **SortedUpdates** is applied after Nod 2 as Stage 2 delivery work.
6. **Launch QA Operator** verifies the final site against deterministic launch gates.
7. **Baseline commit/tag** records the approved production-ready state.

Artifacts are written to canonical paths and act as resumable checkpoints. A failed step is diagnosed and rerun at that step rather than restarting the whole chain.

The site stack is Next.js static export and Tailwind CSS v4. The build uses real content and assets, Lucide icons, existing dependencies, and a mobile-safe primary CTA.

## State Model

```text
BUILD
  ↓
BUILD_COMPLETE
  ↓
CMS_CONFIGURED
  ↓
LAUNCH_QA
  ├── FAIL → issue JSON → specialist operator → LAUNCH_QA again
  └── PASS → BASELINE_COMMIT → LAUNCH_READY → DOMAIN → LIVE
```

`BUILD_COMPLETE` means the site exists and builds. It does not mean it can launch. A site becomes `LAUNCH_READY` only when the Launch QA Operator passes the full finalization sequence.

Source: `doctrine/operator-chain.md`, `operators/skills/site-build.md`, `operators/skills/frontend-builder.md`, `operators/skills/launch-qa.md`.

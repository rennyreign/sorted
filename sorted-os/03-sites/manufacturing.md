# Manufacturing

The Sites build chain begins after Nod 1 and ends only when the site reaches `LAUNCH_READY`.

1. **ChatGPT export pack** supplies approved mockup, reconstructed images and design-IR/asset manifests.
2. **Intake and asset registry** validate/preserve originals, optimise images and resolve production paths. Local generation is dormant unless specifically needed.
3. **Frontend Builder** produces the Stage 1 Next.js client-site repository.
4. **Build verification** requires build, structural and independent visual QA, followed by systemisation/design extraction/core QA and separate human assessment.
5. **Workspace manufacture** consumes the human-approved pricing/offer/creative brief using acquisition hub v2; it does not authorise publishing.
6. **Internal pages and SortedUpdates** continue after the required direction/Nod 2 gates as delivery work.
7. **CMS QA and analytics** verify editing/ownership and meaningful measurement.
8. **Launch QA Operator** verifies the final site against deterministic launch gates.
9. **Baseline commit/tag and authorised deployment** record and verify the production-ready release.

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

Canonical execution: `operators/skills/factory-operators.md`, `operators/skills/workspace-build.md`. Full lifecycle: `doctrine/operator-chain.md`, `operators/skills/launch-qa.md`. The omitted diagram stages remain relevant.

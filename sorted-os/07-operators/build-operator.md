# Build Operator

The Build Operator consumes approved mockup, supplied design-IR, validated asset registry and verified client facts/unknowns to create a Next.js static client site. ChatGPT reconstructs images before export; local generation is a dormant fallback.

It must use the existing stack and conventions: Tailwind CSS v4, Lucide React, no new packages, real copy, resolved assets, and server components unless client behaviour is necessary. The output is a site repository with brand tokens, metadata, section components, assets, client brief, and build log.

Build success is mandatory but does not prove fidelity. Current structural, independent visual and core evidence are required; human/client approval remains separate. CMS work is not part of this operator's Stage 1 output.

Source: `doctrine/operator-chain.md`, `operators/skills/frontend-builder.md`, `operators/skills/site-build.md`.

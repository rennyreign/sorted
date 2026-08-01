# Build Operator

The Build Operator consumes `deconstruction.json`, `manifest.json`, and generated assets to create a complete Next.js static client site.

It must use the existing stack and conventions: Tailwind CSS v4, Lucide React, no new packages, real copy, resolved assets, and server components unless client behaviour is necessary. The output is a site repository with brand tokens, metadata, section components, assets, client brief, and build log.

`npm run build` passing is mandatory before the build can move to Nod 2 review. CMS work is not part of this operator's Stage 1 output.

Source: `doctrine/operator-chain.md`, `operators/skills/frontend-builder.md`, `operators/skills/site-build.md`.

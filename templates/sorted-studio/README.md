# Sorted Studio Template

Canonical client-facing CMS shell for SortedUpdates.

This template is copied into client site repos by:

```bash
npm run studio:upgrade -- --target ../warwickshire-str --slug warwickshire-str
```

Preview the file operations first:

```bash
npm run studio:upgrade -- --target ../warwickshire-str --slug warwickshire-str --dry-run
```

Rules:
- `/cms/` is Sorted Studio.
- `/cms/decap.html` is stock Decap fallback for Sorted only.
- Client `content/` and `public/cms/studio-manifest.json` are preserved by default.
- `scripts/build-studio-content.mjs` is copied into the client repo.
- Client `package.json` is patched so `npm run build` regenerates `studio-content.json` before `next build`.

Current template version: `0.3.0`

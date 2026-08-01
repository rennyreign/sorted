# Quality Assurance

## Stage 1 Build Gate

- `npm run build` passes with no TypeScript or CSS errors.
- All approved sections are present in the correct order.
- No broken asset paths or placeholder copy.
- The hero and primary CTA are clear immediately.
- The site is safe at a 375px viewport with no horizontal scrolling.

## Stage 2 CMS Gate

- Every visible string, image, and media asset is supplied through typed content loaders and JSON.
- Every loader field has a matching CMS field.
- Loader fallbacks exactly match approved handoff content.
- Sorted Studio loads at `/cms/`; stock Decap remains fallback-only at `/cms/decap.html`.
- Existing content controls work, saved test edits are restored, build passes, and focused CMS smoke tests pass.

Source: `operators/skills/site-build.md`, `doctrine/all-content-is-editable.md`, `doctrine/sorted-studio-cms.md`.

# Manual image editor — release handoff

Release: interface 1.1.0, 11 September 2026.

## Routes and access

| Client | Tenant | Working route |
| --- | --- | --- |
| School of Skill | `school-of-skill` | https://sortmydigital.site/ad-previewer/portal/school-of-skill/ |
| Edgbaston Tuition Centre | `edgbaston` | https://edgbaston-tuition-centre.netlify.app/ads/ |

School of Skill's public website `/ads/` route is not published yet. Use the direct central route; this release does not publish its wider website branch. Edgbaston embeds the shared portal using the installer's iframe fallback. Both use the same central production service.

Reviewer codes retain review-only permissions. Named, expiring editor codes additionally allow client-scoped image selection, upload, cropping, history restoration and releasing manual protection. Use **Switch access** to enter an editor code, then **Change image** on an ad.

Private local credentials (never commit their contents):

- `.ad-review/school-of-skill/editor-code`
- `.ad-review/edgbaston/editor-code`

Editor identity: Renaldo. Codes expire 31 December 2026.

## Behaviour

The client image library is the default selection surface; uploading is secondary. Photo positioning previews the actual ad frame. Finished artwork preserves its intended aspect ratio. Saves create immutable revisions requiring fresh approval for the changed creative. Manual selections are server-protected against harness changes, including image replacement, crop/ratio changes and removal of the protected ad. Only editors can release protection.

Existing review history, concept reopening, refresh controls and newer School of Skill campaign revisions are retained. No real ad image selections or approvals were changed during release verification.

Live authenticated ingestion is configured for both tenants. Agents must GET the latest campaign, asset library and image locks, then POST with `base_revision`. HTTP 409 requires a fresh read and reconciliation. Campaign changes require no client website rebuild.

## Release source

- Sorted PR: https://github.com/rennyreign/sorted/pull/75
- Main merge: `541cac4df165719aafa913c8c854cc0b69f5bece`
- Central deployment: https://github.com/rennyreign/sorted/actions/runs/34542518957
- Edgbaston PR: https://github.com/rennyreign/edgbaston-tuition-site/pull/1
- Production migration: `20260910180000_ad_previewer_editor.sql` (applied and recorded).
- Installer: `scripts/install-sorted-ad-review.mjs --mode iframe`.

The original workspace contains unrelated uncommitted work and older branch ancestry. Final integration was isolated in `/private/tmp/ad-review-release.ePV4A5` and merged through PR 75, preserving newer main UI and campaign work. Do not merge the preliminary `feat/ad-previewer-manual-images` branch into main; use main or `feat/ad-previewer-editor-release` as the canonical implementation.

## Verification

- CI: interface contracts and PostgreSQL revision/concurrency/permissions regression tests pass.
- Local real PHP API and PostgreSQL: editor/reviewer separation, tenant isolation, stale revisions/approvals, multipart uploads, history and immutable protection pass.
- Desktop/mobile browser: selection, crop, save, reload, restoration, upload, conflicts, unlock, Escape dismissal and reviewer restrictions pass.
- Production asset URLs checked. Temporary upload verified private storage, signed access and tenant isolation, then the exact verification asset was removed. No client data removed.
- Final main deployment succeeded. Live desktop/mobile smoke checks pass for both client routes, including editor authentication, image selection/preview, preserved ad details/history, refresh controls and no browser script errors. Real client ads were not saved or changed by these smoke checks.
- The Sorted Ad Review skill guided the shared-service implementation, immutable revisions, separate editor access and server-enforced protection.

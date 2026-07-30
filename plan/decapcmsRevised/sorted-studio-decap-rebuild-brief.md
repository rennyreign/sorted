# Sorted Studio — Decap CMS Rebuild Brief

**Audience:** Codex / implementation agent  
**Status:** Build specification  
**Product:** Sorted Studio  
**Objective:** Replace the generic Decap CMS experience with a polished, branded, reusable website-management interface that can be inherited by every Sorted website repository.

---

## 1. Product Intent

Build a client-facing website management application that looks and behaves like a native Sorted product rather than a traditional CMS.

The user should never need to understand:

- Git
- Markdown
- YAML
- JSON
- repository structures
- deployment pipelines
- Decap terminology such as “collections” and “entries”

The user should feel that they are managing **their website**, not operating a content database.

The product name is **Sorted Studio**.

Core promise:

> The easiest website in the world to own.

The implementation must retain Decap CMS as the Git-backed content engine wherever practical, while replacing or wrapping the default user experience with the Sorted interface.

---

## 2. Strategic Architecture Decision

Do **not** build a separate bespoke CMS backend in version one.

Use Decap for:

- Git-backed content persistence
- authentication/backend connection
- reading and writing repository content
- media handling
- content schemas
- publish workflows
- revision history through Git

Build Sorted Studio as a reusable application layer around Decap.

### Important technical constraint

Decap supports custom widgets, custom previews, editor components, manual initialisation and a custom mount element. However, a complete replacement of every part of the standard Decap shell is not exposed as a simple, stable theming API.

Therefore, implement this in two stages:

1. **Stage 1 — Productised Decap shell:** Custom mount, global CSS, custom widgets, custom previews, branded navigation and constrained editor experience.
2. **Stage 2 — Headless/custom shell where required:** Replace specific default Decap screens with Sorted-owned React views while retaining Decap’s backend and content abstractions, or maintain a controlled Decap fork if complete shell ownership proves necessary.

Do not make the first release dependent on a deep, difficult-to-maintain fork.

---

## 3. Reference Interface

The target desktop experience is the supplied Sorted Studio mockup:

- persistent left navigation
- website selector and publish status in the top bar
- page section list in a secondary panel
- focused field editor in the centre panel
- real website preview on the right
- black primary controls
- fluorescent Sorted accent
- warm white background
- subtle grey borders
- generous spacing
- rounded cards and fields
- no visible Markdown or raw configuration

The interface should follow the existing Sorted website design language:

- bold black typography
- fluorescent yellow-green accent
- warm white and pale neutral surfaces
- compact black pill buttons
- strong hierarchy
- deliberately simple language
- minimal decorative chrome

Reference assets supplied with the project:

- `sorted-design-system.png`
- Sorted Studio CMS mockup image
- `Sorted Overview.md`

---

## 4. Core Product Principles

### 4.1 Constrained freedom

Clients may edit approved content and assemble approved components. They may not create arbitrary HTML, CSS or unsupported layouts.

### 4.2 Website language, not CMS language

Use:

- Website
- Pages
- Sections
- Media
- Forms
- Brand
- Styles
- SEO
- Users
- Publish changes

Avoid:

- Collections
- Entries
- Front matter
- Commits
- Branches
- Repository
- Schema

### 4.3 Structured data only

All editable content must map to a known schema. Avoid unrestricted rich-text areas unless explicitly required.

### 4.4 Preview before publish

Every meaningful edit should be visible in a preview before it is published.

### 4.5 Reusable by default

No client-specific UI code should be added to the Sorted Studio core package. Site differences must be expressed through a site manifest, schemas, component definitions and design tokens.

### 4.6 Safe global evolution

All client sites use the same core CMS package, but global changes must be versioned, testable and capable of staged rollout. Do not silently update every live client dashboard from an unpinned remote script.

---

## 5. Proposed System Shape

Create two layers.

### Layer A — Shared product package

Package name:

```text
@sorted/studio
```

Responsibilities:

- application shell
- navigation
- design system
- reusable field components
- Decap initialisation
- config compiler
- preview bridge
- media experience
- publish controls
- role-aware navigation
- telemetry hooks
- error boundaries
- migration utilities

### Layer B — Per-site configuration

Every website repository contains a small configuration layer:

```text
sorted-studio/
  site.manifest.ts
  collections.ts
  components.ts
  permissions.ts
  migrations.ts
```

This layer describes the website without reimplementing the CMS.

---

## 6. Recommended Repository Structure

### Shared package repository

```text
sorted-studio/
  apps/
    playground/
    docs/
  packages/
    studio/
      src/
        app/
        shell/
        navigation/
        editor/
        preview/
        media/
        publishing/
        auth/
        widgets/
        decap/
        config/
        tokens/
        telemetry/
        migrations/
      package.json
    studio-ui/
      src/
        button/
        input/
        card/
        tabs/
        modal/
        toast/
        sortable-list/
        colour-picker/
        image-picker/
        device-switcher/
    studio-types/
    studio-test-kit/
  examples/
    gym-site/
    trades-site/
    hospitality-site/
```

### Per-client website repository

```text
client-site/
  app/ or src/
  content/
    pages/
    globals/
    settings/
  public/
    uploads/
  admin/
    index.html
    studio-entry.tsx
  sorted-studio/
    site.manifest.ts
    collections.ts
    components.ts
    permissions.ts
  package.json
```

The `/admin` entry point imports `@sorted/studio` and passes in the site manifest.

---

## 7. Site Manifest Contract

Create a typed manifest similar to:

```ts
import type { SortedStudioManifest } from '@sorted/studio';

export const siteManifest: SortedStudioManifest = {
  site: {
    id: 'gympro-fitness',
    name: 'GymPro Fitness',
    productionUrl: 'https://gymprofitness.co.uk',
    logo: '/brand/logo.svg',
    framework: 'nextjs',
  },
  backend: {
    provider: 'git-gateway',
    branch: 'main',
  },
  content: {
    pagesDirectory: 'content/pages',
    globalsDirectory: 'content/globals',
    mediaFolder: 'public/uploads',
    publicMediaPath: '/uploads',
  },
  capabilities: {
    pages: true,
    sections: true,
    media: true,
    forms: true,
    popups: false,
    brand: true,
    styles: true,
    seo: true,
    integrations: false,
    users: true,
  },
  preview: {
    mode: 'iframe',
    localUrl: 'http://localhost:3000',
    productionUrl: 'https://gymprofitness.co.uk',
  },
  theme: {
    accent: '#DFFF00',
  },
};
```

The package must validate the manifest at runtime and build time using a shared schema, preferably Zod.

Invalid manifests must fail with a readable developer-facing error rather than producing a broken editor.

---

## 8. Content Model

Use structured page files, preferably JSON, YAML or front matter plus structured fields.

Recommended page shape:

```json
{
  "title": "Home",
  "slug": "/",
  "seo": {
    "title": "GymPro Fitness",
    "description": "Personal training and group fitness."
  },
  "sections": [
    {
      "id": "hero-home",
      "type": "hero",
      "variant": "hero-03",
      "enabled": true,
      "content": {
        "eyebrow": "Stronger every day",
        "heading": "Train smarter. Live stronger.",
        "subheading": "Personal training, group classes and expert coaching.",
        "primaryCta": {
          "label": "Book a free trial",
          "href": "/contact"
        }
      },
      "appearance": {
        "alignment": "left",
        "overlay": 0.6,
        "backgroundImage": "/uploads/hero-gym.jpg"
      }
    }
  ]
}
```

### Rules

- Every section requires a stable unique `id`.
- Every section has a registered `type`.
- `variant` must match an allowed component variant.
- Content and appearance must be separated where practical.
- Unsupported data must be rejected by schema validation.
- Section migrations must preserve existing client content.

---

## 9. Component Registry

Create a reusable component registry that connects:

1. website component
2. CMS field schema
3. thumbnail
4. preview renderer
5. default content
6. validation schema
7. migration version

Example:

```ts
registerSortedComponent({
  type: 'hero',
  variants: [
    {
      id: 'hero-03',
      label: 'Image right',
      thumbnail: '/studio-thumbnails/hero-03.webp',
      schema: hero03Schema,
      fields: hero03Fields,
      defaults: hero03Defaults,
      preview: Hero03Preview,
      version: 1,
    },
  ],
});
```

A website repository should only expose components that it actually supports.

---

## 10. Primary User Experience

### 10.1 App shell

#### Left navigation

Groups:

**Overview**

- Overview

**Content**

- Pages
- Sections
- Media
- Forms
- Popups

**Design**

- Brand
- Styles
- Components

**Settings**

- Site settings
- SEO
- Integrations
- Users

Navigation items must be enabled or hidden by manifest capabilities and permissions.

#### Top bar

Include:

- current website name
- site selector when user has access to multiple sites
- publication status
- desktop/mobile preview toggle
- preview action
- save state
- user avatar/menu

#### Bottom status bar

Include:

- save state
- last published time
- publish button
- publish dropdown for advanced options

### 10.2 Pages view

Display website pages as clear cards or a compact list.

Each item should include:

- page title
- path
- status
- last changed time
- open/edit action
- preview action

Do not display source filenames unless in developer mode.

### 10.3 Page editor

Use a three-column desktop layout:

1. section outline
2. selected section fields
3. live preview

#### Section outline

Must support:

- select section
- enable/disable section
- drag to reorder
- add section
- duplicate section
- remove section
- open section settings

#### Field editor

Group fields by meaning:

- Content
- Buttons
- Media
- Layout
- Appearance
- Advanced

Use plain labels and short helper text.

#### Live preview

The right panel should show the real site or a high-fidelity component renderer.

Provide:

- desktop/mobile toggle
- refresh
- open preview in new tab
- loading state
- preview error state
- selected-section highlight where technically feasible

### 10.4 Add-section experience

Opening “Add section” should display a visual component library.

Filters:

- recommended
- hero
- trust
- services
- gallery
- testimonials
- pricing
- FAQ
- contact
- CTA

Each option must include:

- thumbnail
- plain-English name
- one-line purpose
- variants

Users should not see internal component IDs.

### 10.5 Brand view

Editable values:

- primary logo
- alternate logo
- favicon
- primary colour
- accent colour
- neutral palette
- heading font
- body font
- button style
- corner radius

Site-specific rules may lock selected fields.

### 10.6 Styles view

Expose safe global controls only:

- spacing density
- section spacing
- card radius
- border style
- button radius
- image treatment
- heading scale

All controls must map to website design tokens. Never generate arbitrary CSS from client input.

### 10.7 Media view

Provide:

- grid/list views
- upload
- drag-and-drop
- alt text
- focal point where supported
- basic crop metadata
- search
- file type and size validation
- usage references where feasible

### 10.8 SEO view

Expose:

- site title template
- site description
- social share image
- indexing status
- per-page title and description
- canonical URL where needed
- basic structured-data fields

Do not overwhelm the client with advanced technical fields by default.

---

## 11. Preview Architecture

Implement a preview bridge rather than relying only on Decap’s default preview pane.

### Preferred approach

Render the actual website in an iframe and send unsaved editor state using `postMessage`.

Flow:

```text
Sorted Studio editor
  -> normalises current form state
  -> sends PREVIEW_STATE message
  -> website preview route receives state
  -> website renders components with temporary state
```

Message contract:

```ts
type PreviewMessage = {
  type: 'SORTED_STUDIO_PREVIEW_STATE';
  siteId: string;
  pagePath: string;
  payload: unknown;
  timestamp: number;
};
```

Security requirements:

- strict origin allowlist
- validate message shape
- ignore unknown site IDs
- never execute code from content fields
- sanitise rich text

### Fallback approach

Where a live iframe is unavailable, use Decap custom preview templates using the same component registry.

---

## 12. Save and Publish Behaviour

Separate the concepts of:

- local unsaved field changes
- saved draft
- published live change

Recommended labels:

- `Unsaved changes`
- `All changes saved`
- `Draft saved`
- `Publishing…`
- `Published`
- `Publish failed`

When editorial workflow is enabled:

- Save creates/updates an unpublished entry or branch/PR through Decap.
- Publish merges/publishes using the configured backend workflow.
- Deploy preview should be surfaced where available.

Prevent duplicate publish submissions.

Show readable errors and preserve the user’s input on failure.

---

## 13. Authentication and Roles

Support at least:

- `owner`
- `editor`
- `contributor`
- `sorted_admin`

Suggested permissions:

### Owner

- all client-facing controls
- user management
- publishing

### Editor

- content, media and SEO
- publishing
- no users/integrations

### Contributor

- content edits
- draft save
- no publishing

### Sorted admin

- all capabilities
- developer tools
- recovery tools
- raw content inspection

Do not rely only on hidden navigation. Enforce permissions at action level.

---

## 14. Replication Across New Website Repositories

Every new site must inherit Sorted Studio through the website starter/template.

### Bootstrap command

Create a CLI package:

```text
@sorted/studio-cli
```

Example commands:

```bash
npx @sorted/studio-cli init
npx @sorted/studio-cli validate
npx @sorted/studio-cli migrate
npx @sorted/studio-cli doctor
```

### `init`

Should:

- install `@sorted/studio`
- create the admin entry point
- create starter manifest files
- create content directories
- create initial global settings
- add scripts
- verify backend configuration

### `validate`

Should verify:

- manifest validity
- component registry validity
- missing content files
- invalid section variants
- duplicate section IDs
- broken media paths
- unsupported schema versions

### `migrate`

Should apply versioned content migrations safely and provide a summary.

### `doctor`

Should diagnose:

- authentication misconfiguration
- backend connection problems
- preview origin mismatch
- missing environment variables
- package/version mismatch

---

## 15. Global Change Strategy

The goal is one product shared across all sites without unsafe uncontrolled global mutation.

### Primary model: versioned shared package

Each site pins a version:

```json
{
  "dependencies": {
    "@sorted/studio": "1.4.2"
  }
}
```

Global changes are released through semantic versioning.

- patch: fixes and safe visual refinements
- minor: backward-compatible features
- major: breaking manifest/content changes

### Fleet update automation

Create a central list of managed repositories and an update workflow that:

1. detects a new `@sorted/studio` version
2. opens update pull requests across selected client repos
3. runs tests and visual checks
4. deploys previews
5. allows staged approval
6. merges automatically only for approved low-risk patch releases

Use Renovate, Dependabot, a GitHub App or a custom GitHub Action.

### Release channels

Support:

- `stable`
- `candidate`
- `canary`

Example:

```json
{
  "@sorted/studio": "1.5.0-candidate.2"
}
```

Use a handful of internal/demo sites as canaries before fleet rollout.

### Emergency rollback

Every site must be able to revert to its previous package lockfile and deployment.

Maintain a fleet dashboard or machine-readable registry containing:

- repository
- customer/site ID
- current Studio version
- schema version
- deployment provider
- last successful update
- update status

### Do not use as the default

Avoid loading the complete application from an unversioned central CDN URL. That enables instant global changes but creates a single global failure domain and removes controlled rollback.

A CDN may be used for immutable, versioned assets only.

---

## 16. Design System Tokens

Create a token package rather than scattering values.

Starter tokens:

```ts
export const sortedStudioTokens = {
  colour: {
    background: '#FAFAF7',
    surface: '#FFFFFF',
    surfaceMuted: '#F4F4EF',
    text: '#0B0B0B',
    textMuted: '#686868',
    border: '#E7E7E1',
    accent: '#DFFF00',
    success: '#48B02C',
    danger: '#D92D20',
  },
  radius: {
    small: 8,
    medium: 12,
    large: 18,
    pill: 999,
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    6: 24,
    8: 32,
    12: 48,
  },
};
```

Use CSS custom properties generated from the tokens.

Accessibility:

- visible focus states
- keyboard-operable sortable controls
- WCAG-conscious contrast
- labelled inputs
- semantic buttons
- meaningful error messages
- reduced-motion support

---

## 17. State Management

Use clear separation between:

- persisted entry data
- unsaved form state
- preview state
- UI state
- backend/publish state

Do not let iframe preview state become the source of truth.

Recommended tools:

- React
- TypeScript
- Zod
- React Hook Form or equivalent
- dnd-kit for accessible section ordering
- Decap CMS app/API for backend operations

Avoid adding a large state framework unless necessary. If direct interaction with Decap’s Redux internals is required, isolate it behind an adapter so the rest of Sorted Studio is not coupled to Decap internals.

---

## 18. Decap Adapter Boundary

Create an interface such as:

```ts
export interface CmsAdapter {
  initialise(config: CompiledCmsConfig): Promise<void>;
  getCurrentUser(): Promise<StudioUser | null>;
  loadEntry(collection: string, slug: string): Promise<StudioEntry>;
  saveEntry(entry: StudioEntry): Promise<SaveResult>;
  publishEntry(entry: StudioEntry): Promise<PublishResult>;
  listMedia(): Promise<StudioMedia[]>;
  uploadMedia(file: File): Promise<StudioMedia>;
  subscribe(event: CmsEvent, handler: CmsEventHandler): () => void;
}
```

Implement:

```text
DecapCmsAdapter
```

The rest of the product must depend on `CmsAdapter`, not scattered direct calls to Decap globals.

This makes a future backend replacement possible without rebuilding the interface.

---

## 19. Error Handling and Recovery

Provide explicit states for:

- session expired
- backend unavailable
- failed content fetch
- failed save
- failed publish
- preview unavailable
- malformed site content
- unsupported schema version
- media upload rejected

Sorted admin recovery tools should include:

- open deployment
- view raw entry
- copy diagnostics
- validate current page
- restore previous Git version through an approved workflow

Never expose destructive recovery tools to normal client roles.

---

## 20. Testing Requirements

### Unit tests

- manifest validation
- config compilation
- content normalisation
- component registry
- permission checks
- migrations
- preview message validation

### Integration tests

- authenticate
- load page
- edit text
- reorder section
- add section
- upload media
- save draft
- publish
- preview unsaved data

### Visual regression tests

Use Playwright screenshots for:

- overview
- page editor
- add-section modal
- media library
- mobile viewport
- error states

### Fleet compatibility tests

Create fixture repos representing at least:

- service business
- gym
- hospitality
- property/accommodation
- ecommerce-light brochure site

A shared package release must pass all fixtures before publication.

---

## 21. Performance Targets

Desktop-first initial targets:

- shell interactive within 2.5 seconds on a typical broadband connection
- navigation response under 150 ms after load
- field-to-preview update under 300 ms where local preview is available
- no full app reload after ordinary field changes
- lazy-load media and advanced panels
- avoid shipping website production dependencies into the CMS bundle unless required

---

## 22. Security Requirements

- pin and audit dependencies
- enforce strict preview origins
- sanitise any rendered rich text
- validate uploaded file types and sizes
- do not expose backend tokens to client code beyond supported Decap authentication flows
- use least-privilege repository access
- enforce role permissions server/backend-side where available
- never interpolate client content into executable code
- add Content Security Policy compatible with required auth and preview domains

---

## 23. Analytics and Product Telemetry

Add privacy-conscious events behind a configurable adapter:

- studio_opened
- page_opened
- section_added
- section_reordered
- media_uploaded
- draft_saved
- publish_started
- publish_succeeded
- publish_failed
- preview_failed

Do not record field content, personal data or uploaded media names by default.

Use telemetry to identify confusing areas of the product, not to profile client content.

---

## 24. Phased Delivery

### Phase 1 — Reusable branded foundation

Deliver:

- package architecture
- custom admin mount
- Sorted shell and navigation
- design tokens
- site manifest
- Decap config compiler
- pages list
- branded entry editor
- custom previews
- publish states
- one complete demo site

### Phase 2 — Visual page builder

Deliver:

- section outline
- drag-to-reorder
- add-section library
- component registry
- variant thumbnails
- live iframe preview bridge
- global brand/style controls

### Phase 3 — Fleet operation

Deliver:

- CLI
- package release workflow
- fleet repository registry
- automated update PRs
- canary/candidate/stable channels
- migration framework
- compatibility test suite

### Phase 4 — Product expansion

Potential later modules:

- forms submissions
- enquiries
- analytics
- reviews
- CRM
- integrations
- assistants/automations

These modules should appear inside the same shell but must not block the CMS rebuild.

---

## 25. MVP Acceptance Criteria

The MVP is complete when:

1. A new Next.js website repo can add Sorted Studio with one documented setup process.
2. The dashboard uses the Sorted visual system and does not resemble stock Decap in normal client usage.
3. A client can open a page, edit hero content, change an image, reorder sections and preview the result.
4. A client can save and publish without seeing Git or Markdown terminology.
5. Content is committed to the configured repository through Decap.
6. The same `@sorted/studio` package runs in at least three structurally different demo websites.
7. Site-specific differences are controlled through typed manifests and registries.
8. A package update can be released and applied to demo sites by automated pull request.
9. Existing content survives package upgrades and registered migrations.
10. Automated tests cover the critical edit-save-preview-publish flow.

---

## 26. Non-Goals for Version One

Do not build:

- a general-purpose Webflow replacement
- arbitrary drag-anywhere canvas editing
- unrestricted custom CSS controls
- a new database-backed CMS backend
- real-time multi-user collaboration
- complex workflow automation
- CRM functionality
- analytics reporting
- ecommerce product management
- a full Decap fork unless evidence proves it is required

---

## 27. Codex Execution Instructions

Before implementation:

1. Inspect the current website starter repository.
2. Inspect its existing Decap setup, content paths, authentication and deployment provider.
3. Identify whether Decap is loaded from CDN or npm.
4. Inventory current page/component schemas.
5. Confirm how previews currently render.
6. Produce an implementation plan and file map before changing code.

During implementation:

- preserve existing content
- avoid rewriting the website frontend unnecessarily
- add tests with each major module
- keep Decap-specific code behind the adapter
- document every required environment variable
- include migration notes
- provide screenshots of the final desktop and mobile CMS states

Final output must include:

- working code
- setup instructions for a new repo
- upgrade instructions for existing repos
- architecture notes
- test commands
- release process
- known limitations

---

## 28. Official Decap Capabilities to Use

The implementation may rely on these documented Decap mechanisms:

- custom widgets
- custom preview templates and styles
- variable-type widgets for page-building structures
- manual initialisation
- custom mount element
- CMS events
- Git Gateway or GitHub backend
- editorial workflow
- deploy preview links

Official documentation:

- https://decapcms.org/docs/custom-widgets/
- https://decapcms.org/docs/customization/
- https://decapcms.org/docs/variable-type-widgets/
- https://decapcms.org/docs/architecture/
- https://decapcms.org/docs/editorial-workflows/
- https://decapcms.org/docs/deploy-preview-links/
- https://decapcms.org/docs/git-gateway-backend/

---

## Final Product Standard

The implementation is successful when a local business owner logs in and thinks:

> “This is my website dashboard.”

—not:

> “This is an open-source CMS somebody configured for me.”

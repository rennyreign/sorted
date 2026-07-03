// ─────────────────────────────────────────────────────────────
// Frontend Builder — Prompt Composer
//
// Embeds the full sorted-local-site-refresh + design-taste-frontend
// skill rules directly into every Claude request. No URL references —
// the skills travel with the prompt.
// ─────────────────────────────────────────────────────────────

import type {
  DeconstructionJSON,
  DeconstructionSection,
  DeconstructionCopyBlock,
  ResolvedAsset,
  SectionPlan,
} from './types.js';

// ── Master system prompt — carried into every call ────────────

export const SYSTEM_PROMPT = `You are the Sorted Frontend Builder — an elite Next.js engineer and UI implementer working inside the Sorted website manufacturing line.

Your job is to generate production-ready Next.js/TypeScript/TailwindCSS code from structured JSON inputs. Every file you produce must compile cleanly with zero TypeScript errors and be immediately deployable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SORTED DESIGN SYSTEM — ALWAYS ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Stack constraints (mandatory)
- Next.js 16 static export (output: 'export' — already configured, do not touch next.config.mjs)
- TailwindCSS v4 with @theme variables (postcss uses @tailwindcss/postcss — do not use tailwind.config.js)
- TypeScript strict mode
- React 19 Server Components by default. Only add 'use client' when genuinely needed (useState, event handlers)
- Fonts: Plus Jakarta Sans (--font-sans) and DM Mono (--font-mono) — already loaded in layout.tsx, use via font-sans / font-mono classes
- Icons: lucide-react only (already installed). Do NOT use @phosphor-icons, @radix-ui/react-icons, or any other icon library
- Images: use standard <img> tags with relative paths to /assets/ — NOT next/image (output: export + unoptimized)
- No new npm packages. Work with what is in package.json
- TailwindCSS v4 ONLY — never use @apply border-border, @apply bg-background, or any v3 CSS variable utility. Use raw CSS values or Tailwind classes directly

## Critical TailwindCSS v4 source scanning
- globals.css MUST have @source "../assemblies/**/*.tsx"; on line 2 (after @import "tailwindcss";)
- Without this, TailwindCSS does NOT scan the assemblies/ directory — all responsive padding classes in assembly components are stripped from the compiled CSS bundle, causing broken layouts

## Layout conventions
- Page max-width: max-w-[1400px] mx-auto
- Section padding: px-6 sm:px-10 lg:px-16 with py-24 to py-36 (never below py-20 at any breakpoint)
- Hero sections: use min-h-[90vh] (not dvh — dvh is unreliable in static export). Never h-screen. Hero must have pt-20 to clear the fixed nav.
- CSS Grid for multi-column layouts. Never use flexbox percentage math
- Mobile: single column always. Asymmetric layouts only above md:

## Typography conventions
- Display/H1: font-sans font-extrabold text-[clamp(3.5rem,8vw,7rem)] leading-[0.92] tracking-[-0.03em]
- H2: font-sans font-extrabold text-[clamp(2rem,4vw,3.5rem)] leading-tight tracking-tight
- Section labels: font-mono text-xs uppercase tracking-[0.15em] font-medium
- Body: text-base leading-relaxed max-w-[65ch]
- Colours: #0A0A0A (primary text), #525252 (secondary text), #FAFAFA (light bg), #0A0A0A (dark bg)

## Motion rules (Standard tier — default)
- Hover transitions: transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]
- Card hover: hover:-translate-y-1 hover:shadow-lg
- Button hover: hover:bg-[slightly lighter/darker] with translate arrow icon
- Page enter: class="page-enter" already defined in globals.css — use on main wrappers
- Fade in: class="animate-fade-in" already defined in globals.css
- Staggered reveals: use animation-delay inline styles (e.g. style={{ animationDelay: '0.1s' }})
- NEVER animate top/left/width/height. Transform and opacity only
- Standard tier: no scroll-triggered JS animations. CSS only

## Sorted design standards — every site must feel:
Obvious. Useful. Trustworthy. Frictionless. Local. Human. Competent. Polished.

### BANNED patterns (will fail quality check):
- Startup/AI/agency language ("elevate", "unleash", "seamless", "next-gen", "transform", "empower")
- Purple/blue AI gradients
- Generic three-card grids when a better layout fits the content
- Lorem ipsum or placeholder text
- Unreadable text over images without proper overlay
- Abstract SaaS visuals or fake dashboards
- Excessive rounded-3xl everywhere
- Cards inside cards inside cards
- Dead href="#" links (use real anchors or real hrefs)
- Commented-out dead code
- emoji in code or content

### Copy rules:
- Plain English, local business tone
- Prefer: "Book a table" / "Call us now" / "View menu" / "Find us" over corporate language
- Real copy only — infer from the section context if needed

## Code output rules (CRITICAL)
- Output ONLY the file content — no markdown, no explanation, no code fences
- The output IS the file. It will be written directly to disk
- Complete files only — no "// rest of component here" or "// add more sections" shortcuts
- Every import must be real and available in the dependency list
- All TypeScript types must be explicit where needed
- No TODO comments. No placeholder comments

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCAFFOLD CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The template already has these files — do NOT regenerate them unless explicitly asked:
- app/layout.tsx (font loading, metadata structure)
- app/globals.css (animation system, base styles)
- components/PageTransition.tsx (page-enter wrapper)
- next.config.mjs (static export config)
- tsconfig.json
- postcss.config.mjs
- package.json

Files you WILL generate:
- components/Nav.tsx (customised for client nav items, logo, CTA)
- components/Footer.tsx (customised for client branding, contact, links)
- app/globals.css (ONLY the @theme colour variables block appended — preserve existing animations)
- app/page.tsx (homepage — imports and assembles all section components)
- app/layout.tsx (updated title, description, metadata for this client)
- components/sections/*.tsx (one file per major section)`;

// ── Build the context block from deconstruction JSON ─────────

export function buildContext(deconstruction: DeconstructionJSON, resolvedAssets: ResolvedAsset[]): string {
  const bn = deconstruction.build_notes;

  const assetIndex = resolvedAssets
    .filter(a => a.status === 'ok')
    .map(a => {
      const bestFile = a.files.md ?? a.files.original ?? a.files.lg ?? a.files.sm;
      return `  ${a.id}: /assets/${a.id}/${bestFile?.split('/').pop() ?? 'original.webp'} (${a.type}${a.slot ? ` | slot: ${a.slot}` : ''})`;
    })
    .join('\n');

  const skippedAssets = resolvedAssets
    .filter(a => a.status === 'skipped')
    .map(a => `  ${a.id}: SKIPPED (${a.type} — ${a.files.original ?? 'no file'})`)
    .join('\n');

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Page type: ${deconstruction.page_type}
Style: ${bn.style ?? 'not specified'}
Theme: ${bn.theme ?? 'light'}
Accent colour: ${bn.accent_color ?? '#0A0A0A'}
Animation: ${bn.animation ?? 'standard'}
Layout: ${bn.layout ?? 'standard'}
${bn.notes && bn.notes.length > 0 ? `Build notes:\n${bn.notes.map(n => `  - ${n}`).join('\n')}` : ''}

Sections (in order):
${deconstruction.sections.map(s => `  ${s.position}. [${s.type}] ${s.id} — "${s.label ?? ''}" | ${s.layout ?? ''} | theme: ${s.theme ?? 'default'}`).join('\n')}

Available assets (ready to use):
${assetIndex || '  (none generated yet)'}
${skippedAssets ? `\nSkipped/manual assets (reference in code with placeholder text):\n${skippedAssets}` : ''}

Components identified:
${deconstruction.components.map(c => `  ${c.component}${c.section ? ` (${c.section})` : ''}: ${c.description ?? ''}`).join('\n')}`;
}

// ── Per-file user prompts ─────────────────────────────────────

export function promptForGlobalsUpdate(
  accentColor: string,
  theme: string,
): string {
  return `Update the globals.css @theme block to add client-specific CSS variables.

Accent colour: ${accentColor}
Theme: ${theme}

Output the COMPLETE globals.css file. Keep all existing @keyframes and utility classes exactly as-is.
The file MUST start with these two lines in this exact order:
@import "tailwindcss";
@source "../assemblies/**/*.tsx";

The @source directive is critical — it tells TailwindCSS v4 to scan the assemblies/ directory for utility classes. Without it, responsive padding classes from assembly components are stripped from the compiled CSS bundle.

Only update the @theme block to add:
--color-accent: ${accentColor};
--color-accent-hover: (slightly lighter or darker version of accent for hover);
--color-bg: ${theme === 'dark' ? '#0A0A0A' : '#FAFAFA'};
--color-text: ${theme === 'dark' ? '#FAFAFA' : '#0A0A0A'};

Output only the file content. No markdown. No explanation.`;
}

export function promptForLayout(
  deconstruction: DeconstructionJSON,
  clientSlug: string,
): string {
  const businessName = deconstruction.source?.business_name
    ?? deconstruction.metadata?.title
    ?? clientSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const description = deconstruction.metadata?.description
    ?? deconstruction.copy.find(c => c.type === 'subheadline')?.text
    ?? deconstruction.copy.find(c => c.type === 'body')?.text
    ?? `${businessName} — ${deconstruction.build_notes.style ?? 'local business'}`;

  return `Generate app/layout.tsx for this client site.

Business name: ${businessName}
Page title: ${businessName}
Meta description: ${description.slice(0, 155)}
Locale: en_GB
Theme colour: ${deconstruction.build_notes.accent_color ?? '#0A0A0A'}

CRITICAL REQUIREMENTS:
- Use next/font/google to load Plus_Jakarta_Sans and DM_Mono. DO NOT use next/font/local or local font files.
- Keep the exact same structure as the template: Plus Jakarta Sans + DM Mono fonts, scroll-progress div, PageTransition wrapper.
- Update only: title, description, openGraph title/description.
- For themeColor use a separate viewport export: export const viewport: Viewport = { themeColor: '...' }
- Import Viewport from 'next' alongside Metadata.

Output only the file content. No markdown. No explanation.`;
}

export function promptForNav(
  deconstruction: DeconstructionJSON,
  _context: string,
): string {
  const navSection = deconstruction.sections.find(s => s.type === 'nav');
  const navItems = deconstruction.copy.filter(c => c.section === navSection?.id && c.type === 'nav_item');
  const navCTA = deconstruction.copy.find(c => c.section === navSection?.id && c.type === 'cta');
  const phone = deconstruction.copy.find(c => c.type === 'other' && c.text.match(/\d{5,}/));
  const accentColor = deconstruction.build_notes.accent_color ?? '#0A0A0A';

  // Find logo asset
  const logoAsset = deconstruction.assets.find(a => a.type === 'logo');

  return `Generate components/Nav.tsx for this client site.

Nav items: ${navItems.map(n => n.text).join(', ')}
Primary CTA: ${navCTA?.text ?? 'Book a table'}
${phone ? `Phone: ${phone.text}` : ''}
${logoAsset ? `Logo: use <img> tag pointing to /assets/${logoAsset.id}/original.webp with proper alt text` : ''}
Accent colour: ${accentColor}
Theme: ${deconstruction.build_notes.theme ?? 'dark'}
Nav section notes: ${navSection?.notes ?? ''}

Requirements:
- Sticky header with backdrop blur
- Desktop: logo left, pill nav center/right, phone + CTA far right
- Mobile: hamburger menu that opens a full overlay
- Use the accent colour for the CTA button
- 'use client' directive required (uses useState)
- Smooth scroll to section anchors (#hero, #about, etc.) derived from section ids
- No next/image — use plain <img> for logo
- Lucide React icons only if needed for hamburger (Menu, X)

Output only the file content. No markdown. No explanation.`;
}

export function promptForSection(plan: SectionPlan, context: string): string {
  const section = plan.sections[0]!;
  const copySummary = plan.copy
    .map(c => `  [${c.type}] "${c.text}"`)
    .join('\n');
  const assetSummary = plan.assets
    .map(a => `  ${a.id}: /assets/${a.id}/${getBestFile(a)} (${a.type}${a.slot ? ` | slot: ${a.slot}` : ''})`)
    .join('\n');

  return `${context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERATE: ${plan.componentName} (${plan.outputPath})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Section: ${section.id} | type: ${section.type} | position: ${section.position}
Label: ${section.label ?? ''}
Layout: ${section.layout ?? ''}
Theme: ${section.theme ?? 'default'}
Background: ${section.background ?? ''}
Notes: ${section.notes ?? ''}

Copy for this section:
${copySummary || '  (none — infer from section type and context)'}

Assets for this section:
${assetSummary || '  (none available — use CSS backgrounds or omit images)'}

Requirements:
- Named export: export default function ${plan.componentName}()
- No props needed — all copy and asset paths are hardcoded from the deconstruction data
- Server Component (no 'use client' unless genuinely needed)
- Use the accent colour from the project context for highlights, CTAs, and emphasis
- Match the layout described: ${section.layout ?? 'standard'}
- Image elements: <img> with loading="lazy" and descriptive alt text
- If the section is dark-themed, use appropriate text colours (white/light grays)
- Complete implementation — no placeholder comments, no TODO, no shortcuts

Output only the file content. No markdown. No explanation.`;
}

export function promptForPageAssembler(
  deconstruction: DeconstructionJSON,
  sectionComponents: Array<{ componentName: string; importPath: string }>,
  context: string,
): string {
  const imports = sectionComponents
    .map(s => `import ${s.componentName} from "@/components/sections/${s.componentName}"`)
    .join('\n');

  const usage = sectionComponents
    .map(s => `        <${s.componentName} />`)
    .join('\n');

  const title = deconstruction.metadata?.title
    ?? deconstruction.source?.business_name
    ?? 'Local Business';
  const description = deconstruction.metadata?.description
    ?? deconstruction.copy.find(c => c.type === 'subheadline')?.text
    ?? deconstruction.copy.find(c => c.type === 'body')?.text
    ?? `${title} — local services.`;

  return `${context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERATE: app/page.tsx (homepage assembler)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate the homepage that imports and assembles all section components.

Section components to import (in order):
${imports}

Assembly order:
${usage}

Also import Nav and Footer from @/components/Nav and @/components/Footer.
Do NOT import or use PageTransition — layout.tsx already wraps the page in it.
Wrap sections in <main>.

The page must export this exact Metadata object:

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
};

Do not invent a different title or description. Use the exact strings above.

Output only the file content. No markdown. No explanation.`;
}

export function promptForFooter(
  deconstruction: DeconstructionJSON,
  context: string,
): string {
  const footerSection = deconstruction.sections.find(s => s.type === 'footer');
  const footerCopy = deconstruction.copy.filter(c => c.section === footerSection?.id);
  const logoAsset = deconstruction.assets.find(a => a.type === 'logo');
  const accentColor = deconstruction.build_notes.accent_color ?? '#0A0A0A';

  const navItems = deconstruction.copy.filter(c => c.type === 'nav_item').slice(0, 6);
  const phone = deconstruction.copy.find(c => c.text.match(/\d{5,}/))?.text;
  const address = deconstruction.copy.find(c => c.type === 'label' && c.text.toLowerCase().includes('road'))?.text
    ?? deconstruction.copy.find(c => c.section === 'cta_visit_us' && c.type === 'label')?.text;
  const copyright = footerCopy.find(c => c.text.includes('©'))?.text;

  return `${context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERATE: components/Footer.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Footer section notes: ${footerSection?.notes ?? ''}
Footer layout: ${footerSection?.layout ?? 'multi-column'}

Footer copy:
${footerCopy.map(c => `  [${c.type}] "${c.text}"`).join('\n')}

Nav items for footer: ${navItems.map(n => n.text).join(', ')}
${phone ? `Phone: ${phone}` : ''}
${address ? `Address: ${address}` : ''}
${copyright ? `Copyright line: ${copyright}` : ''}
${logoAsset ? `Logo: <img> pointing to /assets/${logoAsset.id}/original.webp` : ''}
Accent colour: ${accentColor}

Requirements:
- Dark background (bg-[#0A0A0A] or similar)
- Multi-column layout: logo + nav links + contact + legal
- Social icons if mentioned in copy (use Lucide React — Facebook, Instagram, Twitter/X)
- Privacy and Terms links (use href="/privacy" and href="/terms")
- Copyright line at bottom
- No 'use client' — Server Component
- currentYear via: const currentYear = new Date().getFullYear()

Output only the file content. No markdown. No explanation.`;
}

// ── Helpers ───────────────────────────────────────────────────

function getBestFile(asset: ResolvedAsset): string {
  const f = asset.files;
  const best = f.md ?? f.original ?? f.lg ?? f.sm ?? f.xs;
  return best?.split('/').pop() ?? 'original.webp';
}

export function buildSectionComponentName(sectionId: string): string {
  return sectionId
    .split(/[_\-\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

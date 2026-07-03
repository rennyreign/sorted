// ─────────────────────────────────────────────────────────────
// Frontend Builder — Assembly Wrapper Generators
//
// Each assembly ID maps to a deterministic wrapper that imports the
// assembly component and passes the section's content as typed props.
//
// These wrappers are the bridge between the composition (copy, assets,
// contact data) and the pre-defined assembly templates.
// ─────────────────────────────────────────────────────────────

import type { DeconstructionSection, DeconstructionCopyBlock, ResolvedAsset, DeconstructionJSON, StyleSlots } from './types.js';
import { copyForSection, assetsForSection, findCopyByType, findAssetByType, getAssetPath } from './assembly-library.js';

export interface WrapperInput {
  section: DeconstructionSection;
  componentName: string;
  copy: DeconstructionCopyBlock[];
  assets: ResolvedAsset[];
  deconstruction: DeconstructionJSON;
  styleSlots?: StyleSlots;
}

export interface WrapperResult {
  importPath: string;
  wrapper: string;
}

export function generateWrapper(input: WrapperInput): WrapperResult | undefined {
  const { section, componentName } = input;
  const assemblyId = section.assembly_id;
  if (!assemblyId) return undefined;

  const [family] = assemblyId.split('-');
  const importPath = `@/assemblies/${family}/${assemblyId}/component`;
  const importName = `${componentName}Assembly`;

  const wrapper = WRAPPER_GENERATORS[assemblyId]?.(input) ?? WRAPPER_GENERATORS[family]?.(input);
  if (!wrapper) return undefined;

  return { importPath, wrapper: formatWrapper(importName, importPath, wrapper) };
}

// ── Output formatting ─────────────────────────────────────────

function formatWrapper(importName: string, importPath: string, body: string): string {
  const normalisedBody = body.replace(/<(\/?)(\w+Assembly)\b/g, `<$1${importName}`);
  return `import ${importName} from '${importPath}';

export default function AssemblyWrapper() {
${indent(normalisedBody, 2)}
}
`;
}

function indent(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return text.split('\n').map(line => (line ? pad + line : line)).join('\n');
}

// ── Style slot helper ─────────────────────────────────────────

function buildSlotProps(
  styleSlots: StyleSlots | undefined,
  keys: (keyof StyleSlots)[],
): string {
  if (!styleSlots) return '';
  return keys
    .filter(k => styleSlots[k] !== undefined)
    .map(k => `\n      ${k}={${JSON.stringify(styleSlots[k])}}`)
    .join('');
}

function effectiveStyleSlots(section: DeconstructionSection, styleSlots: StyleSlots | undefined): StyleSlots {
  const sectionTheme = section.theme === 'dark' || section.theme === 'light'
    ? section.theme
    : undefined;

  return {
    ...styleSlots,
    theme: sectionTheme ?? styleSlots?.theme,
    density: densityForSection(section, styleSlots?.density),
    backgroundColor: isHexColor(section.background) ? section.background : styleSlots?.backgroundColor,
  };
}

function buildEffectiveSlotProps(
  section: DeconstructionSection,
  styleSlots: StyleSlots | undefined,
  keys: (keyof StyleSlots)[],
): string {
  return buildSlotProps(effectiveStyleSlots(section, styleSlots), keys);
}

function isHexColor(value: string | undefined): value is string {
  return /^#[0-9A-Fa-f]{6}$/.test(value ?? '');
}

function densityForSection(
  section: DeconstructionSection,
  globalDensity: StyleSlots['density'],
): StyleSlots['density'] {
  if (globalDensity === 'airy') return 'airy';

  if (globalDensity === 'compressed') {
    return section.intensity === 'compressed' ? 'compressed' : 'default';
  }

  if (section.intensity === 'compressed') return 'compressed';
  return globalDensity ?? 'default';
}

// ── Per-assembly generators ───────────────────────────────────

const WRAPPER_GENERATORS: Record<string, (input: WrapperInput) => string | undefined> = {
  'nav-standard': generateNavStandard,
  'hero-utility-split': generateHeroUtilitySplit,
  'hero-utility-phone': generateHeroUtilityPhone,
  'hero-utility-centered': generateHeroUtilityCentered,
  'trust-stat-strip': generateTrustStatStrip,
  'trust-badges-local': generateTrustBadgesLocal,
  'trust-badges-accreditation': generateTrustBadgesAccreditation,
  'trust-reviews-strip': generateTrustReviewsStrip,
  'trust-pricing-promise': generateTrustPricingPromise,
  'trust-stat-years': generateTrustStatYears,
  'services-3-cards': generateServices3Cards,
  'services-2-featured': generateServices2Featured,
  'services-list-accordion': generateServicesListAccordion,
  'services-3-cards-lifestyle': generateServices3Cards,
  'services-accordion': generateServicesListAccordion,
  'services-timetable': generateServicesTimetable,
  'proof-gallery-2': generateProofGallery2,
  'proof-gallery-3': generateProofGallery3,
  'proof-portrait-credentials': generateProofPortraitCredentials,
  'proof-before-after': generateProofBeforeAfter,
  'proof-case-study': generateProofCaseStudy,
  'proof-stat-block': generateProofStatBlock,
  'proof-guarantee': generateProofGuarantee,
  'process-steps-3': generateProcessSteps3,
  'process-steps-4': generateProcessSteps4,
  'process-timeline': generateProcessTimeline,
  'process-booking-flow': generateProcessBookingFlow,
  'about-split-credentials': generateAboutSplitCredentials,
  'about-split-team': generateAboutSplitCredentials,
  'about-centered-story': generateAboutCenteredStory,
  'about-split-venue': generateAboutSplitCredentials,
  'testimonials-featured': generateTestimonialsFeatured,
  'testimonials-cards-3': generateTestimonialsCards3,
  'testimonials-single': generateTestimonialsSingle,
  'testimonials-carousel': generateTestimonialsCarousel,
  'cta-band-phone': generateCTABandPhone,
  'cta-sticky-phone': generateCTAStickyPhone,
  'cta-band-book': generateCTABandBook,
  'cta-split-book': generateCTASplitBook,
  'cta-band-form': generateCTABandForm,
  'cta-band-location': generateCTABandLocation,
  'cta-split-location': generateCTASplitLocation,
  'cta-band-whatsapp': generateCTABandWhatsApp,
  'cta-band-shop': generateCTABandShop,
  'cta-split-shop': generateCTASplitShop,
  'footer-standard': generateFooterStandard,
  'footer-minimal': generateFooterMinimal,

  // Family fallbacks
  nav: generateNavStandard,
  hero: generateHeroUtilitySplit,
  trust: generateTrustStatStrip,
  services: generateServices3Cards,
  proof: generateProofGallery2,
  process: generateProcessSteps3,
  about: generateAboutSplitCredentials,
  testimonials: generateTestimonialsFeatured,
  cta: generateCTABandPhone,
  footer: generateFooterStandard,
};

// ── Nav ───────────────────────────────────────────────────────

function generateNavStandard(input: WrapperInput): string | undefined {
  const { section, deconstruction, assets, styleSlots } = input;
  const sectionCopy = copyForSection(section.id, deconstruction.copy);
  const logo = assets.find(a => a.type === 'logo');
  const contact = deconstruction.contact ?? {
    phone: '0000 000000',
    phone_display: '0000 000000',
    location: 'Unknown',
  };
  const cta = deconstruction.cta_hierarchy?.primary;
  const navAnchorMap: Record<string, string> = {
    services: 'services',
    about: 'about',
    testimonials: 'testimonials',
    contact: 'cta',
  };

  const navLinks = sectionCopy
    .filter(c => c.type === 'nav_item')
    .map(c => {
      const key = c.text.toLowerCase().replace(/\s+/g, '_');
      const href = '#' + (navAnchorMap[key] ?? key);
      return `    { label: ${JSON.stringify(c.text)}, href: ${JSON.stringify(href)} },`;
    })
    .join('\n');

  const logoPath = logo ? getAssetPath({ id: logo.id, files: { md: 'md.webp' } }, 'md') : '/assets/logo/original.webp';
  const slotProps = buildEffectiveSlotProps(section, styleSlots, ['theme', 'accentColor', 'backgroundColor']);

  return `  return (
    <NavStandardAssembly
      logo="${logoPath}"
      brandName="${deconstruction.source?.business_name ?? 'Business'}"
      navLinks={[
${navLinks}
      ]}
      phone="${contact.phone_display ?? contact.phone}"
      phoneHref="tel:${contact.phone?.replace(/\s/g, '')}"
      ctaLabel="${cta?.label ?? 'Contact us'}"
      ctaHref="${cta?.href ?? '#contact'}"${slotProps}
    />
  );`;
}

// ── Hero ──────────────────────────────────────────────────────

function generateHeroUtilitySplit(input: WrapperInput): string | undefined {
  const { section, deconstruction, assets, styleSlots } = input;
  const sectionCopy = copyForSection(section.id, deconstruction.copy);
  const sectionAssets = assetsForSection(section.id, assets);
  const headline = findCopyByType(sectionCopy, 'headline') ?? 'Your headline here';
  const description = findCopyByType(sectionCopy, 'subheadline') ?? findCopyByType(sectionCopy, 'body') ?? '';
  const eyebrow = findCopyByType(sectionCopy, 'label') ?? '';
  const heroImage = findAssetByType(sectionAssets, 'hero_image') ?? sectionAssets[0];
  const primaryCta = deconstruction.cta_hierarchy?.primary;
  const secondaryCta = deconstruction.cta_hierarchy?.secondary;
  const slotProps = buildEffectiveSlotProps(section, styleSlots, ['theme', 'density', 'accentColor', 'backgroundColor']);

  return `  return (
    <HeroUtilitySplitAssembly
      eyebrow={${JSON.stringify(eyebrow)}}
      headline={${JSON.stringify(headline)}}
      description={${JSON.stringify(description)}}
      primary_cta={{ label: ${JSON.stringify(primaryCta?.label ?? 'Call now')}, href: ${JSON.stringify(primaryCta?.href ?? '#')} }}
      ${secondaryCta ? `secondary_cta={{ label: ${JSON.stringify(secondaryCta.label)}, href: ${JSON.stringify(secondaryCta.href)} }}` : ''}
      hero_image="${getAssetPath(heroImage, 'md') ?? '/assets/hero_image/md.webp'}"
      hero_image_alt="${heroImage?.description ?? 'Hero image'}"${slotProps}
    />
  );`;
}

function generateHeroUtilityPhone(input: WrapperInput): string {
  return generateHeroUtilitySplit(input) ?? '';
}

function generateHeroUtilityCentered(input: WrapperInput): string {
  return generateHeroUtilitySplit(input) ?? '';
}

// ── Trust ─────────────────────────────────────────────────────

function generateTrustStatStrip(input: WrapperInput): string | undefined {
  const { section, deconstruction, styleSlots } = input;
  const sectionCopy = copyForSection(section.id, deconstruction.copy);
  const statValues = sectionCopy.filter(c => c.type === 'stat');
  const statLabels = sectionCopy.filter(c => c.type === 'label');
  const icons = ['clock', 'mapPin', 'zap', 'badgeCheck'];

  const stats = statValues.map((c, i) => {
    const label = statLabels[i]?.text ?? '';
    const icon = icons[i % icons.length];
    return `    { icon: ${JSON.stringify(icon)}, stat: ${JSON.stringify(c.text)}, label: ${JSON.stringify(label)} },`;
  });

  const slotProps = buildEffectiveSlotProps(section, styleSlots, ['theme', 'density', 'accentColor', 'backgroundColor']);

  return `  return (
    <TrustStatStripAssembly
      stats={[
${stats.join('\n')}
      ]}${slotProps}
    />
  );`;
}

function generateTrustBadgesLocal(input: WrapperInput): string {
  return generateTrustStatStrip(input) ?? '';
}

function generateTrustBadgesAccreditation(input: WrapperInput): string {
  return generateTrustStatStrip(input) ?? '';
}

function generateTrustReviewsStrip(input: WrapperInput): string {
  return generateTrustStatStrip(input) ?? '';
}

function generateTrustPricingPromise(input: WrapperInput): string {
  return generateTrustStatStrip(input) ?? '';
}

function generateTrustStatYears(input: WrapperInput): string {
  return generateTrustStatStrip(input) ?? '';
}

// ── Services ────────────────────────────────────────────────────

function generateServices3Cards(input: WrapperInput): string | undefined {
  const { section, deconstruction, assets, styleSlots } = input;
  const sectionCopy = copyForSection(section.id, deconstruction.copy);
  const eyebrow = findCopyByType(sectionCopy, 'eyebrow') ?? 'Our Services';
  const title = findCopyByType(sectionCopy, 'headline') ?? 'Services';
  const subtitle = findCopyByType(sectionCopy, 'subheadline') ?? '';
  const serviceAssets = assets.filter(a => a.section === section.id);
  const serviceLabels = sectionCopy.filter(c => c.type === 'label');
  const serviceBodies = sectionCopy.filter(c => c.type === 'body');
  const contact = deconstruction.contact;
  const primaryCta = deconstruction.cta_hierarchy?.primary;

  const services = [0, 1, 2].map(i => {
    const asset = serviceAssets[i];
    const titleText = serviceLabels[i]?.text ?? `Service ${i + 1}`;
    const descText = serviceBodies[i]?.text ?? '';
    return `    {
      title: ${JSON.stringify(titleText)},
      description: ${JSON.stringify(descText)},
      image: "${getAssetPath(asset, 'md') ?? '/assets/service_image/md.webp'}",
      imageAlt: ${JSON.stringify(asset?.description ?? titleText)},
      link: "${primaryCta?.href ?? 'tel:' + (contact?.phone ?? '')}",
      linkLabel: "Call about this service",
    },`;
  }).join('\n');

  const slotProps = buildEffectiveSlotProps(section, styleSlots, ['theme', 'density', 'accentColor', 'backgroundColor']);

  return `  return (
    <Services3CardsAssembly
      eyebrow={${JSON.stringify(eyebrow)}}
      title={${JSON.stringify(title)}}
      subtitle={${JSON.stringify(subtitle)}}
      services={[
${services}
      ]}${slotProps}
    />
  );`;
}

function generateServices2Featured(input: WrapperInput): string {
  return generateServices3Cards(input) ?? '';
}

function generateServicesListAccordion(input: WrapperInput): string {
  return generateServices3Cards(input) ?? '';
}

function generateServicesTimetable(input: WrapperInput): string {
  return generateServices3Cards(input) ?? '';
}

// ── Proof ─────────────────────────────────────────────────────

function generateProofGallery2(input: WrapperInput): string | undefined {
  const { section, deconstruction, assets, styleSlots } = input;
  const sectionCopy = copyForSection(section.id, deconstruction.copy);
  const title = findCopyByType(sectionCopy, 'headline') ?? 'Our Work';
  const eyebrow = findCopyByType(sectionCopy, 'label') ?? 'Our Work';
  const sectionAssets = assetsForSection(section.id, assets);
  const fallbackAssets = assets.filter(a => a.type === 'gallery_image' || a.section === 'services_1');
  const projectAssets = sectionAssets.length >= 2 ? sectionAssets : fallbackAssets.slice(0, 2);
  const projectTitles = sectionCopy.filter(c => c.type === 'label' || c.type === 'caption');
  const projectBodies = sectionCopy.filter(c => c.type === 'body');

  const projectDefaults = [
    { title: 'Emergency Leak Repair', description: 'Rapid response to a burst pipe. Isolated fault, replaced damaged section, and restored water supply within 90 minutes.' },
    { title: 'Boiler Installation', description: 'Full Worcester Bosch combi boiler install. System flushed, certified, and customer trained on controls.' },
  ];

  const projects = [0, 1].map(i => {
    const asset = projectAssets[i] ?? fallbackAssets[i];
    const titleText = projectTitles[i]?.text ?? projectDefaults[i].title;
    const descText = projectBodies[i]?.text ?? projectDefaults[i].description;
    return `    {
      title: ${JSON.stringify(titleText)},
      description: ${JSON.stringify(descText)},
      image: "${getAssetPath(asset, 'md') ?? '/assets/work_image/md.webp'}",
      imageAlt: ${JSON.stringify(asset?.description ?? titleText)},
    },`;
  }).join('\n');

  const slotProps = buildEffectiveSlotProps(section, styleSlots, ['theme', 'density', 'backgroundColor']);

  return `  return (
    <ProofGallery2Assembly
      eyebrow={${JSON.stringify(eyebrow)}}
      title={${JSON.stringify(title)}}
      projects={[
${projects}
      ]}${slotProps}
    />
  );`;
}

function generateProofGallery3(input: WrapperInput): string {
  return generateProofGallery2(input) ?? '';
}

function generateProofPortraitCredentials(input: WrapperInput): string {
  return generateProofGallery2(input) ?? '';
}

function generateProofBeforeAfter(input: WrapperInput): string {
  return generateProofGallery2(input) ?? '';
}

function generateProofCaseStudy(input: WrapperInput): string {
  return generateProofGallery2(input) ?? '';
}

function generateProofStatBlock(input: WrapperInput): string {
  return generateProofGallery2(input) ?? '';
}

function generateProofGuarantee(input: WrapperInput): string {
  return generateProofGallery2(input) ?? '';
}

// ── Process ───────────────────────────────────────────────────

function generateProcessSteps3(input: WrapperInput): string | undefined {
  const { section, deconstruction, styleSlots } = input;
  const sectionCopy = copyForSection(section.id, deconstruction.copy);
  const title = findCopyByType(sectionCopy, 'headline') ?? 'How it works';
  const eyebrow = findCopyByType(sectionCopy, 'label') ?? 'How it works';
  const stepLabels = sectionCopy.filter(c => c.type === 'label');
  const stepBodies = sectionCopy.filter(c => c.type === 'body');
  const icons = ['phone', 'search', 'wrench'];

  const steps = [0, 1, 2].map(i => {
    const label = stepLabels[i]?.text ?? 'Step ' + (i + 1);
    const description = stepBodies[i]?.text ?? '';
    return `    {
      number: ${JSON.stringify(String(i + 1))},
      icon: ${JSON.stringify(icons[i] ?? 'wrench')},
      label: ${JSON.stringify(label)},
      description: ${JSON.stringify(description)},
    },`;
  }).join('\n');

  const slotProps = buildEffectiveSlotProps(section, styleSlots, ['theme', 'density', 'accentColor', 'backgroundColor']);

  return `  return (
    <ProcessSteps3Assembly
      eyebrow={${JSON.stringify(eyebrow)}}
      title={${JSON.stringify(title)}}
      steps={[
${steps}
      ]}${slotProps}
    />
  );`;
}

function generateProcessSteps4(input: WrapperInput): string {
  return generateProcessSteps3(input) ?? '';
}

function generateProcessTimeline(input: WrapperInput): string {
  return generateProcessSteps3(input) ?? '';
}

function generateProcessBookingFlow(input: WrapperInput): string {
  return generateProcessSteps3(input) ?? '';
}

// ── About ─────────────────────────────────────────────────────

function generateAboutSplitCredentials(input: WrapperInput): string | undefined {
  const { section, deconstruction, assets, styleSlots } = input;
  const sectionCopy = copyForSection(section.id, deconstruction.copy);
  const eyebrow = findCopyByType(sectionCopy, 'eyebrow') ?? 'About us';
  const title = findCopyByType(sectionCopy, 'headline') ?? 'About us';
  const description = findCopyByType(sectionCopy, 'body') ?? '';
  const sectionAssets = assetsForSection(section.id, assets);
  const image = sectionAssets[0] ?? assets.find(a => a.type === 'person');
  const credentials = sectionCopy
    .filter(c => c.type === 'label')
    .map(c => `    { label: ${JSON.stringify(c.text)} },`)
    .join('\n');

  const slotProps = buildEffectiveSlotProps(section, styleSlots, ['theme', 'density', 'accentColor', 'backgroundColor']);

  return `  return (
    <AboutSplitCredentialsAssembly
      eyebrow={${JSON.stringify(eyebrow)}}
      title={${JSON.stringify(title)}}
      description={${JSON.stringify(description)}}
      image="${getAssetPath(image, 'md') ?? '/assets/about_image/md.webp'}"
      imageAlt={${JSON.stringify(image?.description ?? 'About image')}}
      credentials={[
${credentials}
      ]}${slotProps}
    />
  );`;
}

function generateAboutCenteredStory(input: WrapperInput): string {
  return generateAboutSplitCredentials(input) ?? '';
}

// ── Testimonials ────────────────────────────────────────────────

function generateTestimonialsFeatured(input: WrapperInput): string | undefined {
  const { section, deconstruction, assets, styleSlots } = input;
  const sectionCopy = copyForSection(section.id, deconstruction.copy);
  const title = findCopyByType(sectionCopy, 'headline') ?? 'What customers say';
  const eyebrow = findCopyByType(sectionCopy, 'label') ?? 'Testimonials';
  const quotes = sectionCopy.filter(c => c.type === 'testimonial_quote');
  const attributions = sectionCopy.filter(c => c.type === 'testimonial_attribution');
  const avatars = assets.filter(a => a.type === 'avatar');

  const featuredQuote = quotes[0]?.text ?? '';
  const featuredAttribution = parseAttribution(attributions[0]?.text ?? 'Customer');
  const supporting = [1, 2].map(i => {
    const quote = quotes[i]?.text ?? '';
    const attr = parseAttribution(attributions[i]?.text ?? 'Customer');
    const avatar = avatars[i];
    return `    {
      quote: ${JSON.stringify(quote)},
      name: ${JSON.stringify(attr.name)},
      location: ${JSON.stringify(attr.location)},
      avatar: "${getAssetPath(avatar, 'md') ?? '/assets/avatar/md.webp'}",
    },`;
  }).join('\n');

  const slotProps = buildEffectiveSlotProps(section, styleSlots, ['theme', 'density', 'accentColor', 'backgroundColor']);

  return `  return (
    <TestimonialsFeaturedAssembly
      eyebrow={${JSON.stringify(eyebrow)}}
      title={${JSON.stringify(title)}}
      featured={{
        quote: ${JSON.stringify(featuredQuote)},
        name: ${JSON.stringify(featuredAttribution.name)},
        location: ${JSON.stringify(featuredAttribution.location)},
        avatar: "${getAssetPath(avatars[0], 'md') ?? '/assets/avatar/md.webp'}",
      }}
      supporting={[
${supporting}
      ]}${slotProps}
    />
  );`;
}

function generateTestimonialsCards3(input: WrapperInput): string {
  return generateTestimonialsFeatured(input) ?? '';
}

function generateTestimonialsSingle(input: WrapperInput): string {
  return generateTestimonialsFeatured(input) ?? '';
}

function generateTestimonialsCarousel(input: WrapperInput): string {
  return generateTestimonialsFeatured(input) ?? '';
}

function parseAttribution(text: string): { name: string; location: string } {
  const parts = text.split(',').map(s => s.trim());
  return {
    name: parts[0] ?? text,
    location: parts[1] ?? '',
  };
}

// ── CTA ───────────────────────────────────────────────────────

function generateCTABandPhone(input: WrapperInput): string | undefined {
  const { section, deconstruction, styleSlots } = input;
  const sectionCopy = copyForSection(section.id, deconstruction.copy);
  const headline = findCopyByType(sectionCopy, 'headline') ?? 'Ready to get started?';
  const description = findCopyByType(sectionCopy, 'body') ?? '';
  const primary = deconstruction.cta_hierarchy?.primary;
  const secondary = deconstruction.cta_hierarchy?.secondary;
  const contact = deconstruction.contact;
  const slotProps = buildEffectiveSlotProps(section, styleSlots, ['theme', 'density', 'accentColor', 'backgroundColor']);

  return `  return (
    <CTABandPhoneAssembly
      headline={${JSON.stringify(headline)}}
      description={${JSON.stringify(description)}}
      primaryLabel={${JSON.stringify(primary?.label ?? 'Call now')}}
      primaryHref={${JSON.stringify(primary?.href ?? 'tel:' + (contact?.phone ?? ''))}}
      ${secondary ? `secondaryLabel={${JSON.stringify(secondary.label)}}\n      secondaryHref={${JSON.stringify(secondary.href)}}` : ''}${slotProps}
    />
  );`;
}

function generateCTAStickyPhone(input: WrapperInput): string {
  return generateCTABandPhone(input) ?? '';
}

function generateCTABandBook(input: WrapperInput): string {
  return generateCTABandPhone(input) ?? '';
}

function generateCTASplitBook(input: WrapperInput): string {
  return generateCTABandPhone(input) ?? '';
}

function generateCTABandForm(input: WrapperInput): string {
  return generateCTABandPhone(input) ?? '';
}

function generateCTABandLocation(input: WrapperInput): string {
  return generateCTABandPhone(input) ?? '';
}

function generateCTASplitLocation(input: WrapperInput): string {
  return generateCTABandPhone(input) ?? '';
}

function generateCTABandWhatsApp(input: WrapperInput): string {
  return generateCTABandPhone(input) ?? '';
}

function generateCTABandShop(input: WrapperInput): string {
  return generateCTABandPhone(input) ?? '';
}

function generateCTASplitShop(input: WrapperInput): string {
  return generateCTABandPhone(input) ?? '';
}

// ── Footer ──────────────────────────────────────────────────────

function generateFooterStandard(input: WrapperInput): string | undefined {
  const { section, deconstruction, assets, styleSlots } = input;
  const logo = assets.find(a => a.type === 'logo');
  const contact = deconstruction.contact;
  const source = deconstruction.source;
  const sectionCopy = copyForSection(section.id, deconstruction.copy);
  const anchorMap: Record<string, string> = {
    hero: 'hero',
    trust_bar: 'trust',
    services: 'services',
    gallery: 'work',
    process: 'process',
    about: 'about',
    testimonials: 'testimonials',
    cta: 'cta',
  };

  const quickLinks = deconstruction.sections
    .filter(s => s.type !== 'nav' && s.type !== 'footer')
    .map(s => {
      const label = s.label ?? s.type;
      const href = '#' + (anchorMap[s.type] ?? s.type);
      return `    { label: ${JSON.stringify(label.charAt(0).toUpperCase() + label.slice(1))}, href: ${JSON.stringify(href)} },`;
    })
    .join('\n');

  const logoPath = logo ? getAssetPath({ id: logo.id, files: { md: 'md.webp' } }, 'md') : '/assets/logo/original.webp';
  const slotProps = buildEffectiveSlotProps(section, styleSlots, ['theme', 'accentColor', 'backgroundColor']);

  return `  return (
    <FooterStandardAssembly
      logo="${logoPath}"
      brandName={${JSON.stringify(source?.business_name ?? 'Business')}}
      tagline={${JSON.stringify(findCopyByType(sectionCopy, 'body') ?? 'Local business you can trust.')}}
      quickLinks={[
${quickLinks}
      ]}
      contact={{
        phone: ${JSON.stringify(contact?.phone_display ?? contact?.phone ?? '0000 000000')},
        phoneHref: ${JSON.stringify('tel:' + (contact?.phone ?? '').replace(/\s/g, ''))},
        availability: ${JSON.stringify(contact?.hours ?? 'Available 24/7')},
      }}
      serviceAreas={[${JSON.stringify(contact?.location ?? 'Local area')}]}
      legalLinks={[
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ]}
      copyright="© ${new Date().getFullYear()} ${source?.business_name ?? 'Business'}. All rights reserved."${slotProps}
    />
  );`;
}

function generateFooterMinimal(input: WrapperInput): string {
  return generateFooterStandard(input) ?? '';
}

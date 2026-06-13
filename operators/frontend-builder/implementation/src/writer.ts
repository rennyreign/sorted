// ─────────────────────────────────────────────────────────────
// Frontend Builder — File Writer + Plan Builder
//
// Merges deconstruction + manifest data into a generation plan,
// then writes Claude's output to the correct paths in the repo.
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import type {
  DeconstructionJSON,
  AssetManifest,
  DeconstructionSection,
  ResolvedAsset,
  SectionPlan,
  GenerationTarget,
} from './types.js';
import { buildSectionComponentName } from './prompts.js';

// ── Merge deconstruction assets with manifest files ───────────

export function resolveAssets(
  deconstruction: DeconstructionJSON,
  manifest: AssetManifest,
): ResolvedAsset[] {
  const manifestMap = new Map(manifest.assets.map(a => [a.id, a]));

  return deconstruction.assets.map(asset => {
    const manifestEntry = manifestMap.get(asset.id);
    return {
      id: asset.id,
      type: asset.type,
      description: asset.description,
      priority: asset.priority,
      slot: asset.slot,
      aspect_ratio: asset.aspect_ratio,
      files: manifestEntry?.files ?? {},
      status: manifestEntry?.status ?? 'missing',
    };
  });
}

// ── Build generation plan ─────────────────────────────────────
// Returns ordered list of files to generate, each with the
// specific sections, copy, and assets relevant to that file.

export interface GenerationPlan {
  outputDir: string;
  files: SectionPlan[];
  sectionComponents: Array<{ componentName: string; sectionId: string }>;
}

export function buildGenerationPlan(
  deconstruction: DeconstructionJSON,
  resolvedAssets: ResolvedAsset[],
  outputDir: string,
): GenerationPlan {
  const resolved = path.resolve(outputDir);
  const files: SectionPlan[] = [];

  // Helper to get copy for a section
  const copyFor = (sectionId: string) =>
    deconstruction.copy.filter(c => c.section === sectionId);

  // Helper to get assets for a section
  const assetsFor = (sectionId: string) =>
    resolvedAssets.filter(a => deconstruction.assets.find(da => da.id === a.id && da.section === sectionId));

  // 1. globals.css — colour variables only
  files.push({
    target: 'globals' as GenerationTarget,
    outputPath: path.join(resolved, 'app', 'globals.css'),
    sections: [],
    copy: [],
    assets: [],
    notes: 'Update @theme colour variables block only. Preserve all existing animations.',
  });

  // 2. app/layout.tsx — metadata
  files.push({
    target: 'layout' as GenerationTarget,
    outputPath: path.join(resolved, 'app', 'layout.tsx'),
    sections: deconstruction.sections,
    copy: deconstruction.copy,
    assets: resolvedAssets,
    notes: 'Update title, description, and openGraph metadata for this client.',
  });

  // 3. components/Nav.tsx
  const navSection = deconstruction.sections.find(s => s.type === 'nav');
  files.push({
    target: 'nav' as GenerationTarget,
    outputPath: path.join(resolved, 'components', 'Nav.tsx'),
    sections: navSection ? [navSection] : deconstruction.sections.slice(0, 1),
    copy: navSection ? copyFor(navSection.id) : [],
    assets: resolvedAssets.filter(a => a.type === 'logo'),
    notes: 'Customise nav links, logo, phone number, and CTA for this client.',
  });

  // 4. One section component per content section (skip nav + footer)
  const contentSections = deconstruction.sections.filter(
    s => s.type !== 'nav' && s.type !== 'footer',
  );

  const sectionComponents: Array<{ componentName: string; sectionId: string }> = [];

  for (const section of contentSections) {
    const componentName = buildSectionComponentName(section.id);
    const sectionAssets = assetsFor(section.id);

    files.push({
      target: 'section' as GenerationTarget,
      sectionId: section.id,
      componentName,
      outputPath: path.join(resolved, 'components', 'sections', `${componentName}.tsx`),
      sections: [section],
      copy: copyFor(section.id),
      assets: sectionAssets,
      notes: `${section.type} section — ${section.layout ?? 'standard layout'}`,
    });

    sectionComponents.push({ componentName, sectionId: section.id });
  }

  // 5. components/Footer.tsx
  const footerSection = deconstruction.sections.find(s => s.type === 'footer');
  files.push({
    target: 'footer' as GenerationTarget,
    outputPath: path.join(resolved, 'components', 'Footer.tsx'),
    sections: footerSection ? [footerSection] : [],
    copy: footerSection ? copyFor(footerSection.id) : [],
    assets: resolvedAssets.filter(a => a.type === 'logo'),
    notes: 'Footer with nav links, contact details, legal links, and social icons.',
  });

  // 6. app/page.tsx — homepage assembler (last — depends on all section components)
  files.push({
    target: 'page' as GenerationTarget,
    outputPath: path.join(resolved, 'app', 'page.tsx'),
    sections: deconstruction.sections,
    copy: deconstruction.copy,
    assets: resolvedAssets,
    notes: 'Import and assemble all section components in correct order.',
  });

  return { outputDir: resolved, files, sectionComponents };
}

// ── Write a generated file to disk ────────────────────────────

export function writeFile(outputPath: string, content: string): void {
  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf-8');
}

// ── Write build log ───────────────────────────────────────────

export interface BuildLogEntry {
  file: string;
  target: string;
  status: string;
  duration_ms: number;
  error?: string;
  tokens?: { input: number; output: number };
}

export function writeBuildLog(
  entries: BuildLogEntry[],
  outputDir: string,
): string {
  const logPath = path.join(path.resolve(outputDir), 'build-log.json');
  fs.writeFileSync(logPath, JSON.stringify(entries, null, 2), 'utf-8');
  return logPath;
}

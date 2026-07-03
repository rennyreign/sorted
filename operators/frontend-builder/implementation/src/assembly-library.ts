// ─────────────────────────────────────────────────────────────
// Frontend Builder — Assembly Library
//
// Resolves assembly templates from the sorted-skills assembly
// library and prepares them for the renderer.
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { DeconstructionSection, DeconstructionCopyBlock, ResolvedAsset } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Assembly path resolution ──────────────────────────────────

export interface AssemblyPaths {
  component: string;
  manifest: string;
  directory: string;
}

export function resolveAssemblyLibrary(): string {
  // Candidate paths from the implementation directory
  const candidates = [
    path.resolve(__dirname, '..', '..', '..', '..', 'sorted-skills', '11-assembly-library'),
    path.resolve(__dirname, '..', '..', '..', '..', '..', 'sorted-skills', '11-assembly-library'),
    path.resolve(process.cwd(), 'sorted-skills', '11-assembly-library'),
    path.resolve(process.cwd(), '..', 'sorted-skills', '11-assembly-library'),
    path.resolve(process.cwd(), '..', '..', 'sorted-skills', '11-assembly-library'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'INDEX.md'))) {
      return candidate;
    }
  }

  throw new Error(
    `Could not resolve Assembly Library.\n` +
    `Expected to find sorted-skills/11-assembly-library/INDEX.md.`,
  );
}

export function resolveAssembly(assemblyId: string): AssemblyPaths | undefined {
  const [family, variant] = assemblyId.split('-');
  const library = resolveAssemblyLibrary();
  const directory = path.join(library, family, assemblyId);
  const component = path.join(directory, 'component.tsx');
  const manifest = path.join(directory, 'manifest.json');

  if (!fs.existsSync(component) || !fs.existsSync(manifest)) {
    return undefined;
  }

  return { component, manifest, directory };
}

export function loadAssemblyManifest(assemblyId: string): unknown | undefined {
  const paths = resolveAssembly(assemblyId);
  if (!paths) return undefined;
  return JSON.parse(fs.readFileSync(paths.manifest, 'utf-8'));
}

// ── Copy assembly into output repo ────────────────────────────

export function copyAssemblyToOutput(
  assemblyId: string,
  outputDir: string,
): string | undefined {
  const paths = resolveAssembly(assemblyId);
  if (!paths) return undefined;

  const [family] = assemblyId.split('-');
  const destDir = path.join(outputDir, 'assemblies', family, assemblyId);
  const destComponent = path.join(destDir, 'component.tsx');

  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(paths.component, destComponent);

  return destComponent;
}

// ── Helpers for slot filling ───────────────────────────────────

export function copyForSection(sectionId: string, copy: DeconstructionCopyBlock[]): DeconstructionCopyBlock[] {
  return copy.filter(c => c.section === sectionId);
}

export function assetsForSection(sectionId: string, assets: ResolvedAsset[]): ResolvedAsset[] {
  return assets.filter(a => a.section === sectionId);
}

export function findCopyByType(copy: DeconstructionCopyBlock[], type: string): string | undefined {
  const block = copy.find(c => c.type === type);
  return block?.text;
}

export function findAssetByType(assets: ResolvedAsset[], type: string): ResolvedAsset | undefined {
  return assets.find(a => a.type === type);
}

export function findAssetById(assets: ResolvedAsset[], id: string): ResolvedAsset | undefined {
  return assets.find(a => a.id === id);
}

export function getAssetPath(
  asset: { id: string; files: { md?: string; lg?: string; sm?: string; xs?: string; original?: string } } | undefined,
  variant: 'md' | 'lg' | 'sm' | 'xs' | 'original' = 'md',
): string | undefined {
  if (!asset) return undefined;
  const file = asset.files[variant] || asset.files.md || asset.files.lg || asset.files.sm || asset.files.xs || asset.files.original;
  if (!file) return undefined;
  const fileName = path.basename(file);
  return `/assets/${asset.id}/${fileName}`;
}

// ── Section to assembly ID lookup ─────────────────────────────

export function assemblyIdForSection(
  section: DeconstructionSection,
  assemblySelection?: { assemblies?: Record<string, string> },
): string | undefined {
  return section.assembly_id ?? assemblySelection?.assemblies?.[section.type];
}

// ── Check if a section can be rendered from assembly library ───

export function isAssemblySection(
  section: DeconstructionSection,
  assemblySelection?: { assemblies?: Record<string, string> },
): boolean {
  const assemblyId = assemblyIdForSection(section, assemblySelection);
  if (!assemblyId) return false;
  const paths = resolveAssembly(assemblyId);
  return !!paths;
}

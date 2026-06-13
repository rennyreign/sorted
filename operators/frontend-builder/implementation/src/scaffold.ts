// ─────────────────────────────────────────────────────────────
// Frontend Builder — Repo Scaffolder
//
// Copies the client-site template into the output directory,
// copies generated assets into public/assets/,
// and writes client/brief.md from the deconstruction data.
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { DeconstructionJSON, AssetManifest } from './types.js';

// ── Scaffold the repo from the template ──────────────────────

export function scaffoldRepo(
  templateDir: string,
  outputDir: string,
  verbose: boolean = false,
): void {
  const resolvedTemplate = path.resolve(templateDir);
  const resolvedOutput = path.resolve(outputDir);

  if (!fs.existsSync(resolvedTemplate)) {
    throw new Error(`Template directory not found: ${resolvedTemplate}`);
  }

  if (fs.existsSync(resolvedOutput)) {
    if (verbose) console.log(`  Output dir exists, clearing for fresh scaffold...`);
    fs.rmSync(resolvedOutput, { recursive: true, force: true });
  }

  if (verbose) console.log(`  Copying template → ${resolvedOutput}`);

  copyDirRecursive(resolvedTemplate, resolvedOutput, [
    'node_modules',
    '.next',
    'out',
    '.git',
    'client/assets',  // We'll populate this ourselves
  ]);

  // Create required directories
  const dirs = [
    path.join(resolvedOutput, 'public', 'assets'),
    path.join(resolvedOutput, 'components', 'sections'),
    path.join(resolvedOutput, 'client', 'assets'),
  ];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (verbose) console.log(`  Template copied`);
}

// ── Copy generated assets into public/assets/ ─────────────────

export function copyAssets(
  assetsDir: string,
  manifest: AssetManifest,
  outputDir: string,
  verbose: boolean = false,
): string[] {
  const resolvedAssets = path.resolve(assetsDir);
  const publicAssets = path.join(path.resolve(outputDir), 'public', 'assets');

  fs.mkdirSync(publicAssets, { recursive: true });

  const copied: string[] = [];

  for (const asset of manifest.assets) {
    if (asset.status !== 'ok') continue;

    const assetOutDir = path.join(publicAssets, asset.id);
    fs.mkdirSync(assetOutDir, { recursive: true });

    for (const [variant, relativePath] of Object.entries(asset.files)) {
      if (!relativePath) continue;

      // manifest paths are relative to the asset generator output dir
      // e.g. "assets/hero_image_exterior/original.webp"
      const srcPath = path.join(resolvedAssets, '..', relativePath);

      if (!fs.existsSync(srcPath)) {
        if (verbose) console.log(`    [skip] ${asset.id}/${variant} — file not found: ${srcPath}`);
        continue;
      }

      const fileName = path.basename(relativePath);
      const destPath = path.join(assetOutDir, fileName);
      fs.copyFileSync(srcPath, destPath);
      copied.push(`/assets/${asset.id}/${fileName}`);
    }

    if (verbose && copied.length > 0) {
      console.log(`    [assets] ${asset.id} → ${Object.keys(asset.files).length} variants`);
    }
  }

  return copied;
}

// ── Write client/brief.md from deconstruction data ────────────

export function writeBrief(
  deconstruction: DeconstructionJSON,
  outputDir: string,
): void {
  const bn = deconstruction.build_notes;

  // Extract business name from copyright copy
  const copyrightCopy = deconstruction.copy.find(
    c => c.text.includes('©') || c.text.includes('All rights reserved'),
  );
  const businessNameRaw = copyrightCopy?.text
    .replace(/©.*?\d{4}\s*/g, '')
    .replace(/\. All rights reserved\.?/g, '')
    .trim() ?? 'Business Name';

  const phone = deconstruction.copy.find(c => c.text.match(/[\d\s]{10,}/))?.text ?? '';
  const email = deconstruction.copy.find(c => c.text.includes('@'))?.text ?? '';
  const address = deconstruction.copy
    .filter(c => c.section?.includes('visit') || c.section?.includes('cta'))
    .find(c => c.text.match(/\d+.*(?:road|street|avenue|lane|way)/i))?.text ?? '';

  const ctaCopy = deconstruction.copy.find(c => c.type === 'cta' && c.section?.includes('hero'));
  const headline = deconstruction.copy.find(c => c.type === 'headline' && c.section?.includes('hero'));
  const subheadline = deconstruction.copy.find(c => c.type === 'subheadline');

  const brief = `# Client Brief
## Auto-generated from Mockup Deconstruction — edit as needed

## Business Information

**Business Name:** ${businessNameRaw}

**Tagline / One-liner:** ${subheadline?.text ?? ''}

**Industry / Category:** ${bn.style ?? deconstruction.page_type}

**Location:** ${address}

**Contact:**
- Phone: ${phone}
- Email: ${email}

## Brand & Visual

**Brand Colors:**
- Accent: ${bn.accent_color ?? '#0A0A0A'}
- Theme: ${bn.theme ?? 'light'}

**Style:** ${bn.style ?? 'not specified'}

**Animation level:** ${bn.animation ?? 'standard'}

## Homepage Sections (detected)

${deconstruction.sections
  .map(s => `${s.position}. **${s.label ?? s.type}** (${s.type}) — ${s.layout ?? ''}`)
  .join('\n')}

## Hero

**Headline:** ${headline?.text ?? ''}
**CTA:** ${ctaCopy?.text ?? ''}

## Assets

${deconstruction.assets.map(a => `- ${a.id} | ${a.type} | source: ${a.source} | priority: ${a.priority}`).join('\n')}

## Build Notes

${bn.notes?.map(n => `- ${n}`).join('\n') ?? '(none)'}

---
*Generated by Sorted Frontend Builder v0.1.0*
`;

  const briefPath = path.join(path.resolve(outputDir), 'client', 'brief.md');
  fs.mkdirSync(path.dirname(briefPath), { recursive: true });
  fs.writeFileSync(briefPath, brief, 'utf-8');
}

// ── Install dependencies ──────────────────────────────────────

export function installDependencies(
  outputDir: string,
  verbose: boolean = false,
): void {
  const resolvedOutput = path.resolve(outputDir);

  if (verbose) console.log(`  Installing npm dependencies...`);

  try {
    execSync('npm install', {
      cwd: resolvedOutput,
      stdio: verbose ? 'inherit' : 'pipe',
    });
  } catch (e) {
    throw new Error(`npm install failed in ${resolvedOutput}: ${(e as Error).message}`);
  }

  if (verbose) console.log(`  Dependencies installed`);
}

// ── Run next build to verify ──────────────────────────────────

export function runBuild(
  outputDir: string,
  verbose: boolean = false,
): { success: boolean; output: string } {
  const resolvedOutput = path.resolve(outputDir);

  try {
    const output = execSync('npm run build', {
      cwd: resolvedOutput,
      stdio: 'pipe',
      timeout: 120_000,
    }).toString();
    return { success: true, output };
  } catch (e: unknown) {
    const err = e as { stdout?: Buffer; stderr?: Buffer; message: string };
    const output = [
      err.stdout?.toString() ?? '',
      err.stderr?.toString() ?? '',
      err.message,
    ].join('\n');
    return { success: false, output };
  }
}

// ── Recursive directory copy ──────────────────────────────────

function copyDirRecursive(src: string, dest: string, excludes: string[] = []): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (excludes.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, excludes);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

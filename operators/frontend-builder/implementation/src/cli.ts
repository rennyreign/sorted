#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Frontend Builder — CLI Entry Point
//
// Usage:
//   node dist/cli.js <deconstruction.json> <manifest.json> <assets-dir> [options]
//
// Options:
//   --output <dir>      Output directory (default: ./output/<client-slug>)
//   --template <dir>    Client site template dir (default: auto-detect)
//   --slug <name>       Client slug (default: derived from output dir name)
//   --tier <tier>       standard | premium (default: standard)
//   --dry-run           Plan without generating files
//   --no-build          Skip npm install + next build step
//   --verbose           Detailed output
//   --help              Show this help
// ─────────────────────────────────────────────────────────────

import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { build } from './orchestrator.js';
import { resolveAssemblyLibrary, resolveAssembly } from './assembly-library.js';
import { validateDeconstruction, validateManifest } from './schema.js';
import { resolveAssets } from './writer.js';
import { generateWrapper } from './assembly-wrappers.js';
import { buildSectionComponentName } from './prompts.js';
import type { BuildConfig } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CLI arg parsing ───────────────────────────────────────────

function parseArgs(argv: string[]): {
  deconstructionPath: string;
  manifestPath: string;
  assetsDir: string;
  output?: string;
  template?: string;
  slug?: string;
  tier?: 'standard' | 'premium';
  dryRun: boolean;
  noBuild: boolean;
  verbose: boolean;
  help: boolean;
} {
  const args = argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    return {
      deconstructionPath: '',
      manifestPath: '',
      assetsDir: '',
      dryRun: false,
      noBuild: false,
      verbose: false,
      help: true,
    };
  }

  const positional = args.filter(a => !a.startsWith('--'));
  const get = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };
  const has = (flag: string) => args.includes(flag);

  return {
    deconstructionPath: positional[0] ?? '',
    manifestPath: positional[1] ?? '',
    assetsDir: positional[2] ?? '',
    output: get('--output'),
    template: get('--template'),
    slug: get('--slug'),
    tier: (get('--tier') as 'standard' | 'premium') ?? 'standard',
    dryRun: has('--dry-run'),
    noBuild: has('--no-build'),
    verbose: has('--verbose'),
    help: false,
  };
}

function printHelp() {
  console.log(`
Frontend Builder v0.1.0 — Sorted Website Manufacturing Line
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Takes a Mockup Deconstructor JSON + Asset Generator manifest
and produces a ready-to-deploy Next.js client site.

Usage:
  node dist/cli.js <deconstruction.json> <manifest.json> <assets-dir> [options]

Arguments:
  deconstruction.json   Output from Mockup Deconstructor operator
  manifest.json         Output from Asset Generator operator
  assets-dir            Directory containing generated asset files

Options:
  --output <dir>        Output repo directory (default: ./output/<slug>)
  --template <dir>      Client site template directory (auto-detected if omitted)
  --slug <name>         Client slug for output naming (default: derived from path)
  --tier standard|premium  Build tier (default: standard)
  --dry-run             Show generation plan without calling Claude or writing files
  --no-build            Skip npm install + next build verification
  --verbose             Detailed progress output
  --help                Show this help

Environment:
  ANTHROPIC_API_KEY     Required — your Anthropic API key

Examples:
  # Full run — Raffles restaurant
  node dist/cli.js \\
    ../../mockup-deconstructor/implementation/output/raffles.json \\
    ../../asset-generator/implementation/output/raffles/manifest.json \\
    ../../asset-generator/implementation/output/raffles/assets \\
    --slug raffles --output ./output/raffles-site

  # Dry run to preview plan
  node dist/cli.js raffles.json manifest.json assets/ --dry-run --verbose

  # Premium tier build
  node dist/cli.js raffles.json manifest.json assets/ --tier premium --slug raffles
`);
}

// ── Auto-detect template directory ────────────────────────────

function findTemplateDir(cliDir: string): string {
  // Walk up from the CLI directory to find sorted/templates/client-site
  const candidates = [
    path.resolve(cliDir, '..', '..', '..', '..', 'templates', 'client-site'),
    path.resolve(cliDir, '..', '..', '..', 'templates', 'client-site'),
    path.resolve(process.cwd(), 'templates', 'client-site'),
    path.resolve(process.cwd(), '..', 'templates', 'client-site'),
    path.resolve(process.cwd(), '..', '..', 'templates', 'client-site'),
    path.resolve(process.cwd(), '..', '..', '..', 'templates', 'client-site'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
  }

  throw new Error(
    `Could not auto-detect the client-site template directory.\n` +
    `Use --template <path> to specify it manually.\n` +
    `Expected to find: sorted/templates/client-site/package.json`,
  );
}

// ── Sync assemblies subcommand ────────────────────────────────
// Re-copies all assembly component.tsx files from sorted-skills/
// into an existing built site, then runs next build.
// Usage: node dist/cli.js --sync-assemblies <output-dir>

function syncAssemblies(outputDir: string): void {
  const resolvedOutput = path.resolve(outputDir);
  const assembliesDir = path.join(resolvedOutput, 'assemblies');
  if (!fs.existsSync(assembliesDir)) {
    console.error(`No assemblies/ directory found in ${outputDir}`);
    console.error(`This site was not built with assembly mode.`);
    process.exit(1);
  }

  const library = resolveAssemblyLibrary();
  let synced = 0;
  let failed = 0;

  // Walk the output assemblies directory and re-copy each one from source
  const families = fs.readdirSync(assembliesDir).filter(f =>
    fs.statSync(path.join(assembliesDir, f)).isDirectory()
  );

  for (const family of families) {
    const familyDir = path.join(assembliesDir, family);
    const assemblyIds = fs.readdirSync(familyDir).filter(f =>
      fs.statSync(path.join(familyDir, f)).isDirectory()
    );
    for (const assemblyId of assemblyIds) {
      const sourcePaths = resolveAssembly(assemblyId);
      if (!sourcePaths) {
        console.log(`  ✗ ${assemblyId} — not found in library`);
        failed++;
        continue;
      }
      const destPath = path.join(familyDir, assemblyId, 'component.tsx');
      fs.copyFileSync(sourcePaths.component, destPath);
      console.log(`  ✓ synced ${assemblyId}`);
      synced++;
    }
  }

  console.log(`\nAssembly sync: ${synced} synced, ${failed} failed`);

  const wrapperResult = syncAssemblyWrappers(resolvedOutput);
  if (wrapperResult.synced > 0 || wrapperResult.skippedReason) {
    if (wrapperResult.skippedReason) {
      console.log(`Wrapper sync skipped: ${wrapperResult.skippedReason}`);
    } else {
      console.log(`Wrapper sync: ${wrapperResult.synced} regenerated`);
    }
  }

  if (synced > 0) {
    console.log(`\nRunning next build...`);
    try {
      execSync('npm run build', { cwd: path.resolve(outputDir), stdio: 'inherit' });
      console.log('✓ Build passed');
    } catch {
      console.log('✗ Build failed — check output above');
      process.exit(1);
    }
  }
}

function syncAssemblyWrappers(outputDir: string): { synced: number; skippedReason?: string } {
  const compositionPath = findSiblingArtifact(outputDir, 'composition.json');
  const manifestPath = findSiblingArtifact(outputDir, 'manifest.json');

  if (!compositionPath || !manifestPath) {
    return {
      synced: 0,
      skippedReason: 'could not find sibling composition.json and manifest.json',
    };
  }

  const deconstructionRaw = JSON.parse(fs.readFileSync(compositionPath, 'utf-8'));
  const manifestRaw = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const deconstructionResult = validateDeconstruction(deconstructionRaw);
  const manifestResult = validateManifest(manifestRaw);

  if (!deconstructionResult.success) {
    return { synced: 0, skippedReason: `invalid composition: ${compositionPath}` };
  }
  if (!manifestResult.success) {
    return { synced: 0, skippedReason: `invalid manifest: ${manifestPath}` };
  }

  const deconstruction = deconstructionResult.data;
  const resolvedAssets = resolveAssets(deconstruction, manifestResult.data);
  let synced = 0;

  for (const section of deconstruction.sections) {
    if (!section.assembly_id) continue;
    if (!resolveAssembly(section.assembly_id)) continue;

    const target =
      section.type === 'nav'
        ? path.join(outputDir, 'components', 'Nav.tsx')
        : section.type === 'footer'
          ? path.join(outputDir, 'components', 'Footer.tsx')
          : path.join(outputDir, 'components', 'sections', `${buildSectionComponentName(section.id)}.tsx`);

    const componentName =
      section.type === 'nav'
        ? 'Nav'
        : section.type === 'footer'
          ? 'Footer'
          : buildSectionComponentName(section.id);

    const wrapper = generateWrapper({
      section,
      componentName,
      copy: deconstruction.copy,
      assets: resolvedAssets,
      deconstruction,
      styleSlots: deconstruction.assembly_selection?.style_slots,
    });

    if (!wrapper) continue;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, wrapper.wrapper, 'utf-8');
    synced++;
  }

  return { synced };
}

function findSiblingArtifact(outputDir: string, fileName: string): string | undefined {
  const parent = path.dirname(outputDir);
  const siteName = path.basename(outputDir);
  const candidateNames = [
    siteName.replace('-site-', '-'),
    siteName.replace(/-site$/, ''),
    siteName,
  ];

  for (const candidateName of candidateNames) {
    const candidate = path.join(parent, candidateName, fileName);
    if (fs.existsSync(candidate)) return candidate;
  }

  const localCandidate = path.join(outputDir, fileName);
  if (fs.existsSync(localCandidate)) return localCandidate;

  return undefined;
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  // Handle --sync-assemblies subcommand
  if (process.argv.includes('--sync-assemblies')) {
    const idx = process.argv.indexOf('--sync-assemblies');
    const target = process.argv[idx + 1];
    if (!target) {
      console.error('Usage: node dist/cli.js --sync-assemblies <output-dir>');
      process.exit(1);
    }
    console.log(`Syncing assemblies in ${target}...`);
    syncAssemblies(target);
    process.exit(0);
  }

  const parsed = parseArgs(process.argv);

  if (parsed.help) {
    printHelp();
    process.exit(0);
  }

  if (!parsed.deconstructionPath) {
    console.error('Error: deconstruction.json path is required');
    printHelp();
    process.exit(1);
  }

  if (!parsed.manifestPath) {
    console.error('Error: manifest.json path is required');
    printHelp();
    process.exit(1);
  }

  if (!parsed.assetsDir) {
    console.error('Error: assets directory path is required');
    printHelp();
    process.exit(1);
  }

  if (!process.env['ANTHROPIC_API_KEY'] && !parsed.dryRun) {
    console.error('Error: ANTHROPIC_API_KEY environment variable not set');
    console.error('Add it to .env or export it before running');
    process.exit(1);
  }

  // Resolve template directory
  const templateDir = parsed.template ?? findTemplateDir(__dirname);

  // Derive client slug
  const slug = parsed.slug
    ?? path.basename(parsed.deconstructionPath, '.json')
    ?? 'client';

  // Resolve output directory
  const outputDir = parsed.output ?? path.join(process.cwd(), 'output', slug);

  const config: BuildConfig = {
    deconstructionPath: parsed.deconstructionPath,
    manifestPath: parsed.manifestPath,
    assetsDir: parsed.assetsDir,
    outputDir,
    templateDir,
    clientSlug: slug,
    verbose: parsed.verbose,
    dryRun: parsed.dryRun,
    tier: parsed.tier ?? 'standard',
  };

  // ── Print header ──────────────────────────────────────────

  console.log(`
Frontend Builder v0.1.0
────────────────────────────────────────
  Deconstruction : ${parsed.deconstructionPath}
  Manifest       : ${parsed.manifestPath}
  Assets         : ${parsed.assetsDir}
  Template       : ${templateDir}
  Output         : ${outputDir}
  Slug           : ${slug}
  Tier           : ${config.tier}
  Mode           : ${config.dryRun ? 'DRY RUN — no files will be written' : 'LIVE'}
  Build verify   : ${parsed.noBuild ? 'skipped' : 'enabled'}
`);

  try {
    const result = await build(config);

    const failed = result.files.filter(f => f.status === 'failed');
    if (failed.length > 0) {
      console.log(`\nFailed files:`);
      for (const f of failed) {
        console.log(`  ✗ ${path.relative(outputDir, f.outputPath)}: ${f.error}`);
      }
      process.exit(1);
    }

    process.exit(0);
  } catch (err) {
    console.error(`\nFatal error: ${(err as Error).message}`);
    if (parsed.verbose) {
      console.error((err as Error).stack);
    }
    process.exit(1);
  }
}

main();

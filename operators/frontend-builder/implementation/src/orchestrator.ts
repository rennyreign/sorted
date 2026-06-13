// ─────────────────────────────────────────────────────────────
// Frontend Builder — Core Orchestrator
//
// Drives the full pipeline:
// 1. Validate inputs
// 2. Scaffold repo from template
// 3. Copy assets into public/
// 4. Generate files section-by-section via Claude
// 5. Write files to repo
// 6. Install deps + run build to verify
// 7. Write build log
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import type { BuildConfig, BuildResult, FileResult, SectionPlan } from './types.js';
import { validateDeconstruction, validateManifest } from './schema.js';
import { scaffoldRepo, copyAssets, writeBrief, installDependencies, runBuild } from './scaffold.js';
import { resolveAssets, buildGenerationPlan, writeFile, writeBuildLog } from './writer.js';
import { callClaude, TokenTracker } from './claude.js';
import {
  SYSTEM_PROMPT,
  buildContext,
  promptForGlobalsUpdate,
  promptForLayout,
  promptForNav,
  promptForSection,
  promptForFooter,
  promptForPageAssembler,
} from './prompts.js';

// ── Main build entry point ────────────────────────────────────

export async function build(config: BuildConfig): Promise<BuildResult> {
  const start = Date.now();
  const fileResults: FileResult[] = [];
  const tracker = new TokenTracker();

  const log = (msg: string) => config.verbose && console.log(msg);

  // ── 1. Read + validate inputs ─────────────────────────────

  log(`  Reading deconstruction: ${config.deconstructionPath}`);
  const deconstructionRaw = JSON.parse(fs.readFileSync(path.resolve(config.deconstructionPath), 'utf-8'));
  const deconstructionResult = validateDeconstruction(deconstructionRaw);
  if (!deconstructionResult.success) {
    throw new Error(`Invalid deconstruction JSON:\n${JSON.stringify(deconstructionResult.error.format(), null, 2)}`);
  }
  const deconstruction = deconstructionResult.data;

  log(`  Reading manifest: ${config.manifestPath}`);
  const manifestRaw = JSON.parse(fs.readFileSync(path.resolve(config.manifestPath), 'utf-8'));
  const manifestResult = validateManifest(manifestRaw);
  if (!manifestResult.success) {
    throw new Error(`Invalid manifest JSON:\n${JSON.stringify(manifestResult.error.format(), null, 2)}`);
  }
  const manifest = manifestResult.data;

  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  // ── 2. Resolve assets ─────────────────────────────────────

  const resolvedAssets = resolveAssets(deconstruction, manifest);
  log(`  Resolved ${resolvedAssets.filter(a => a.status === 'ok').length}/${resolvedAssets.length} assets`);

  // ── 3. Scaffold repo ──────────────────────────────────────

  if (!config.dryRun) {
    log(`\n  Scaffolding repo...`);
    scaffoldRepo(config.templateDir, config.outputDir, config.verbose);

    log(`  Copying assets into public/assets/...`);
    const copied = copyAssets(config.assetsDir, manifest, config.outputDir, config.verbose);
    log(`  Copied ${copied.length} asset files`);

    log(`  Writing client/brief.md...`);
    writeBrief(deconstruction, config.outputDir);
  }

  // ── 4. Build generation plan ──────────────────────────────

  const plan = buildGenerationPlan(deconstruction, resolvedAssets, config.outputDir);
  const context = buildContext(deconstruction, resolvedAssets);

  log(`\n  Generation plan:`);
  for (const file of plan.files) {
    const rel = path.relative(path.resolve(config.outputDir), file.outputPath);
    log(`    [${file.target}] ${rel}`);
  }

  if (config.dryRun) {
    console.log('\nDry run complete — no files written.');
    return {
      clientSlug: config.clientSlug,
      outputDir: config.outputDir,
      tier: config.tier ?? 'standard',
      files: plan.files.map(f => ({
        outputPath: f.outputPath,
        target: f.target,
        status: 'skipped',
        duration_ms: 0,
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  // ── 5. Generate files via Claude ──────────────────────────

  log(`\n  Generating files with Claude...`);

  for (const filePlan of plan.files) {
    const rel = path.relative(path.resolve(config.outputDir), filePlan.outputPath);
    const fileStart = Date.now();

    try {
      console.log(`  [${filePlan.target}] ${rel}`);

      const userPrompt = buildUserPrompt(filePlan, deconstruction, plan.sectionComponents, context);

      const result = await callClaude({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        apiKey,
        verbose: config.verbose,
        label: rel,
      });

      tracker.record(result);
      writeFile(filePlan.outputPath, result.content);

      const duration_ms = Date.now() - fileStart;
      console.log(`    ✓ written (${duration_ms}ms | ${result.outputTokens} tokens)`);

      fileResults.push({
        outputPath: filePlan.outputPath,
        target: filePlan.target,
        status: 'ok',
        duration_ms,
      });

    } catch (err) {
      const duration_ms = Date.now() - fileStart;
      const error = (err as Error).message;
      console.log(`    ✗ failed: ${error}`);

      fileResults.push({
        outputPath: filePlan.outputPath,
        target: filePlan.target,
        status: 'failed',
        duration_ms,
        error,
      });
    }
  }

  // ── 6. Install deps + run build ───────────────────────────

  console.log(`\n  Installing dependencies...`);
  try {
    installDependencies(config.outputDir, config.verbose);
    console.log(`  ✓ npm install complete`);
  } catch (err) {
    console.log(`  ✗ npm install failed: ${(err as Error).message}`);
  }

  console.log(`  Running next build...`);
  const buildOutput = runBuild(config.outputDir, config.verbose);
  if (buildOutput.success) {
    console.log(`  ✓ Build passed`);
  } else {
    console.log(`  ✗ Build failed:`);
    // Print first 40 lines of build output for context
    const lines = buildOutput.output.split('\n').slice(0, 40).join('\n');
    console.log(lines);
  }

  // ── 7. Write build log ────────────────────────────────────

  const logPath = writeBuildLog(
    fileResults.map(f => ({
      file: path.relative(path.resolve(config.outputDir), f.outputPath),
      target: f.target,
      status: f.status,
      duration_ms: f.duration_ms,
      error: f.error,
    })),
    config.outputDir,
  );

  // ── 8. Summary ────────────────────────────────────────────

  const totalDuration = ((Date.now() - start) / 1000).toFixed(1);
  const ok = fileResults.filter(f => f.status === 'ok').length;
  const failed = fileResults.filter(f => f.status === 'failed').length;

  console.log(`
Frontend Build Complete
────────────────────────────────────────
  OK       : ${ok}
  Failed   : ${failed}
  Total    : ${fileResults.length} files
  Build    : ${buildOutput.success ? 'PASSED' : 'FAILED'}
  Duration : ${totalDuration}s
  Output   : ${path.resolve(config.outputDir)}

  Token usage:
${tracker.summary()}

  Build log: ${logPath}`);

  return {
    clientSlug: config.clientSlug,
    outputDir: path.resolve(config.outputDir),
    tier: config.tier ?? 'standard',
    files: fileResults,
    generatedAt: new Date().toISOString(),
  };
}

// ── Route each file plan to the right prompt builder ─────────

function buildUserPrompt(
  plan: SectionPlan,
  deconstruction: import('./types.js').DeconstructionJSON,
  sectionComponents: Array<{ componentName: string; sectionId: string }>,
  context: string,
): string {
  switch (plan.target) {
    case 'globals':
      return promptForGlobalsUpdate(
        deconstruction.build_notes.accent_color ?? '#0A0A0A',
        deconstruction.build_notes.theme ?? 'light',
      );

    case 'layout':
      return promptForLayout(deconstruction, slugFromPath(plan.outputPath));

    case 'nav':
      return promptForNav(deconstruction, context);

    case 'footer':
      return promptForFooter(deconstruction, context);

    case 'section':
      return promptForSection(plan, context);

    case 'page':
      return promptForPageAssembler(
        deconstruction,
        sectionComponents.map(sc => ({
          componentName: sc.componentName,
          importPath: `@/components/sections/${sc.componentName}`,
        })),
        context,
      );

    default:
      throw new Error(`Unknown generation target: ${plan.target}`);
  }
}

function slugFromPath(outputPath: string): string {
  const parts = outputPath.split(path.sep);
  const outIdx = parts.findIndex(p => p === 'output');
  return outIdx !== -1 ? (parts[outIdx + 1] ?? 'client') : 'client';
}

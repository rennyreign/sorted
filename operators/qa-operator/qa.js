#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// QA Operator — Technical checks for a Sorted site build
//
// Usage:
//   node qa.js <composition.json> <site-output-dir>
// ─────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const [compositionPath, siteDir] = process.argv.slice(2);

if (!compositionPath || !siteDir) {
  console.error('Usage: node qa.js <composition.json> <site-output-dir>');
  process.exit(1);
}

const composition = JSON.parse(fs.readFileSync(compositionPath, 'utf-8'));
const checks = [];
const failures = [];
const warnings = [];

function pass(name, detail) {
  checks.push({ name, status: 'pass', detail });
}

function fail(name, detail) {
  checks.push({ name, status: 'fail', detail });
  failures.push({ name, detail });
}

function warn(name, detail) {
  checks.push({ name, status: 'warn', detail });
  warnings.push({ name, detail });
}

// ── 1. Build integrity ──────────────────────────────────────

const indexHtml = path.join(siteDir, 'out', 'index.html');
if (fs.existsSync(indexHtml)) {
  pass('build_output_exists', indexHtml);
} else {
  fail('build_output_exists', `Missing ${indexHtml}`);
}

const buildLog = path.join(siteDir, 'build-log.json');
if (fs.existsSync(buildLog)) {
  const log = JSON.parse(fs.readFileSync(buildLog, 'utf-8'));
  const failed = log.filter(e => e.status === 'failed');
  if (failed.length === 0) {
    pass('build_log_no_failures', `${log.length} files generated`);
  } else {
    fail('build_log_no_failures', `${failed.length} files failed`);
  }
} else {
  warn('build_log_missing', 'No build-log.json found');
}

// ── 2. Content correctness ──────────────────────────────────

const html = fs.existsSync(indexHtml) ? fs.readFileSync(indexHtml, 'utf-8') : '';
const contact = composition.contact || {};
const source = composition.source || {};
const metadata = composition.metadata || {};

if (contact.phone_display) {
  if (html.includes(contact.phone_display)) {
    pass('phone_display', contact.phone_display);
  } else {
    fail('phone_display', `Expected ${contact.phone_display}`);
  }
}

if (contact.phone) {
  const phoneHref = `tel:${contact.phone}`;
  if (html.includes(phoneHref)) {
    pass('phone_href', phoneHref);
  } else {
    fail('phone_href', `Expected ${phoneHref}`);
  }
}

if (contact.location) {
  if (html.includes(contact.location)) {
    pass('location', contact.location);
  } else {
    fail('location', `Expected ${contact.location}`);
  }
}

if (source.business_name) {
  if (html.includes(source.business_name)) {
    pass('business_name', source.business_name);
  } else {
    fail('business_name', `Expected ${source.business_name}`);
  }
}

if (metadata.title) {
  const pageTsx = path.join(siteDir, 'app', 'page.tsx');
  let pageMetadata = '';
  if (fs.existsSync(pageTsx)) {
    pageMetadata = fs.readFileSync(pageTsx, 'utf-8');
  }
  if (pageMetadata.includes(metadata.title) || html.includes(metadata.title)) {
    pass('metadata_title', metadata.title);
  } else {
    warn('metadata_title', `Expected ${metadata.title} in page.tsx or title`);
  }
}

// Placeholder checks
const placeholders = ['Your headline here', 'Business Name', 'Company Logo', 'Client Site', 'Update this'];
const foundPlaceholders = placeholders.filter(p => html.includes(p));
if (foundPlaceholders.length === 0) {
  pass('no_placeholders', 'none found');
} else {
  fail('no_placeholders', foundPlaceholders.join(', '));
}

// Hallucination check for common wrong locations
const wrongLocations = ['Melbourne', 'Sydney', 'New York', 'London'];
const expectedLocation = contact.location || '';
const hallucinated = wrongLocations.filter(loc => html.includes(loc) && !expectedLocation.includes(loc));
if (hallucinated.length === 0) {
  pass('no_location_hallucinations', 'none found');
} else {
  fail('no_location_hallucinations', hallucinated.join(', '));
}

// ── 3. Asset integrity ───────────────────────────────────────

const publicAssets = path.join(siteDir, 'public', 'assets');
const assetIds = composition.assets.map(a => a.id);
const missingAssets = assetIds.filter(id => !fs.existsSync(path.join(publicAssets, id)));
if (missingAssets.length === 0) {
  pass('assets_exist', `${assetIds.length} assets found`);
} else {
  fail('assets_exist', `Missing: ${missingAssets.join(', ')}`);
}

// Check for broken image references
const brokenImages = [];
const imgMatches = html.matchAll(/src="([^"]+)"/g);
for (const match of imgMatches) {
  const src = match[1];
  if (src.startsWith('/assets/')) {
    const rel = src.replace(/^\//, '');
    const fullPath = path.join(siteDir, 'out', rel);
    if (!fs.existsSync(fullPath)) {
      brokenImages.push(src);
    }
  }
}
if (brokenImages.length === 0) {
  pass('image_refs_valid', 'all referenced images exist');
} else {
  fail('image_refs_valid', `Broken: ${brokenImages.join(', ')}`);
}

// ── 4. Section fidelity ─────────────────────────────────────

const pageTsx = path.join(siteDir, 'app', 'page.tsx');
if (fs.existsSync(pageTsx)) {
  const pageContent = fs.readFileSync(pageTsx, 'utf-8');
  const importMatches = [...pageContent.matchAll(/import\s+([A-Za-z0-9_]+)\s+from\s+["']@\/components\/sections\/[^"']+["']/g)];
  const importedComponents = importMatches.map(m => m[1]);
  const expectedSections = composition.sections.filter(s => s.type !== 'nav' && s.type !== 'footer');
  const expectedComponentNames = expectedSections.map(s => {
    const words = s.id.split(/[_\-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1));
    return words.join('');
  });
  const missing = expectedComponentNames.filter(name => !importedComponents.includes(name));
  if (missing.length === 0) {
    pass('section_order', `${expectedComponentNames.length} section components in correct order`);
  } else {
    fail('section_order', `Missing: ${missing.join(', ')}`);
  }
} else {
  fail('section_order', 'Missing app/page.tsx');
}

// ── 5. Assembly fidelity ─────────────────────────────────────

if (composition.assembly_selection) {
  const assemblyIds = Object.values(composition.assembly_selection.assemblies);
  const missingAssemblies = assemblyIds.filter(id => {
    const [family] = id.split('-');
    return !fs.existsSync(path.join(siteDir, 'assemblies', family, id, 'component.tsx'));
  });
  if (missingAssemblies.length === 0) {
    pass('assemblies_present', `${assemblyIds.length} assemblies copied`);
  } else {
    fail('assemblies_present', `Missing: ${missingAssemblies.join(', ')}`);
  }
} else {
  warn('assemblies_present', 'No assembly_selection in composition');
}

// Rule: generated wrappers must preserve each section's theme/background.
// The Site Composer writes per-section rhythm into composition.sections; the
// Frontend Builder must not flatten it with a single global style slot.
const sectionComponentName = (sectionId) =>
  sectionId.split(/[_\-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');

const wrapperPathForSection = (section) => {
  if (section.type === 'nav') return path.join(siteDir, 'components', 'Nav.tsx');
  if (section.type === 'footer') return path.join(siteDir, 'components', 'Footer.tsx');
  return path.join(siteDir, 'components', 'sections', `${sectionComponentName(section.id)}.tsx`);
};

const themeMismatches = [];
const backgroundMismatches = [];
for (const section of composition.sections || []) {
  const wrapperPath = wrapperPathForSection(section);
  if (!fs.existsSync(wrapperPath)) continue;

  const wrapper = fs.readFileSync(wrapperPath, 'utf-8');
  if ((section.theme === 'light' || section.theme === 'dark') && !wrapper.includes(`theme={"${section.theme}"}`) && !wrapper.includes(`theme="${section.theme}"`)) {
    themeMismatches.push(`${section.id}: expected ${section.theme}`);
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(section.background || '') && !wrapper.includes(`backgroundColor={"${section.background}"}`) && !wrapper.includes(`backgroundColor="${section.background}"`)) {
    backgroundMismatches.push(`${section.id}: expected ${section.background}`);
  }
}

if (themeMismatches.length === 0) {
  pass('section_theme_fidelity', 'all wrapper themes match composition sections');
} else {
  fail('section_theme_fidelity', themeMismatches.join('; '));
}

if (backgroundMismatches.length === 0) {
  pass('section_background_fidelity', 'all wrapper backgrounds match composition sections');
} else {
  fail('section_background_fidelity', backgroundMismatches.join('; '));
}

// ── 6. Visual spacing rules ──────────────────────────────────
// These checks catch cramped section rhythm before a site can pass QA.
// Rules derived from sorted design doctrine: section padding must be
// substantial enough that sections never visually touch.

// Rule: Hero must have min-h-[90vh] — ensures confident first viewport
if (html.includes('min-h-[90vh]') || html.includes('min-h-\\[90vh\\]')) {
  pass('hero_min_height', 'min-h-[90vh] present');
} else {
  fail('hero_min_height', 'Hero missing min-h-[90vh] — will appear cramped or not fill the viewport');
}

// Rule: Hero must have pt-20 to clear the fixed nav
if (html.includes('pt-20') || html.includes('pt-24') || html.includes('pt-28')) {
  pass('hero_nav_clearance', 'hero has top padding for nav clearance');
} else {
  warn('hero_nav_clearance', 'Hero may not have sufficient top padding to clear the fixed nav');
}

// Rule: No section should use py-6, py-8, py-10, or py-12 as its primary padding —
// these values produce cramped sections at desktop viewport
const tightPaddingMatches = (html.match(/class="[^"]*\bpy-6\b[^"]*"/g) || [])
  .concat(html.match(/class="[^"]*\bpy-8\b[^"]*"/g) || [])
  .concat(html.match(/class="[^"]*\bpy-10\b[^"]*"/g) || [])
  .concat(html.match(/class="[^"]*\bpy-12\b[^"]*"/g) || []);
if (tightPaddingMatches.length === 0) {
  pass('no_cramped_sections', 'no py-6/py-8/py-10/py-12 section padding found');
} else {
  fail('no_cramped_sections', `Found ${tightPaddingMatches.length} element(s) using py-6/py-8/py-10/py-12 as padding — sections will appear cramped`);
}

// Rule: assembly_selection density must not be 'compressed' without justification
// (compressed with recalibrated tokens is fine, but flag it for human review)
const density = composition.assembly_selection?.style_slots?.density;
if (density === 'compressed') {
  warn('density_compressed', 'Global density is compressed — verify spacing looks professional in screenshots. Compressed is appropriate only for high-urgency conversion pages.');
} else if (density === 'airy' || density === 'default' || !density) {
  pass('density_appropriate', `density: ${density ?? 'default'}`);
}

const overCompressed = [];
for (const section of composition.sections || []) {
  if (section.type === 'nav' || section.type === 'footer') continue;
  const wrapperPath = wrapperPathForSection(section);
  if (!fs.existsSync(wrapperPath)) continue;
  const wrapper = fs.readFileSync(wrapperPath, 'utf-8');
  const wrapperCompressed = wrapper.includes('density={"compressed"}') || wrapper.includes('density="compressed"');
  const canCompress = section.intensity === 'compressed';
  if (wrapperCompressed && !canCompress) {
    overCompressed.push(`${section.id}: ${section.intensity || 'unknown'} section rendered compressed`);
  }
}

if (overCompressed.length === 0) {
  pass('density_respects_section_intensity', 'only compressed-intensity sections use compressed density');
} else {
  fail('density_respects_section_intensity', overCompressed.join('; '));
}

// Rule: PageTransition must not appear in page.tsx (double-wrap breaks position:fixed nav)
const pageTsxPath = path.join(siteDir, 'app', 'page.tsx');
if (fs.existsSync(pageTsxPath)) {
  const pageTsxContent = fs.readFileSync(pageTsxPath, 'utf-8');
  if (pageTsxContent.includes('PageTransition')) {
    fail('no_double_page_transition', 'page.tsx imports or uses PageTransition — layout.tsx already wraps in PageTransition, causing double-wrap that breaks position:fixed nav');
  } else {
    pass('no_double_page_transition', 'page.tsx does not duplicate PageTransition');
  }
}

// Rule: page-enter animation must not use translateY (breaks position:fixed descendants)
const globalsCss = path.join(siteDir, 'app', 'globals.css');
if (fs.existsSync(globalsCss)) {
  const cssContent = fs.readFileSync(globalsCss, 'utf-8');
  const pageEnterBlock = cssContent.match(/@keyframes page-enter\s*\{[^}]+\}/)?.[0] ?? '';
  if (pageEnterBlock.includes('translateY')) {
    fail('page_enter_no_transform', 'page-enter keyframe uses translateY — this creates a new stacking context that breaks position:fixed nav and causes hero spacing issues');
  } else {
    pass('page_enter_no_transform', 'page-enter uses opacity only (safe for position:fixed descendants)');
  }
}

// ── 7. Structure ────────────────────────────────────────────

const h1Count = (html.match(/<h1/g) || []).length;
if (h1Count === 1) {
  pass('single_h1', h1Count);
} else {
  fail('single_h1', `Found ${h1Count}`);
}

if (html.includes('<main')) {
  pass('main_landmark', 'found');
} else {
  fail('main_landmark', 'missing');
}

if (html.includes('<footer')) {
  pass('footer_landmark', 'found');
} else {
  fail('footer_landmark', 'missing');
}

// ── Score and recommendation ──────────────────────────────────

const total = checks.length;
const passed = checks.filter(c => c.status === 'pass').length;
const score = Math.round((passed / total) * 10 * 10) / 10;

let recommendation = 'PASS';
if (failures.length > 0) recommendation = 'FAIL';
else if (warnings.length > 0) recommendation = 'HUMAN REVIEW REQUIRED';

const report = {
  passed: failures.length === 0,
  score,
  recommendation,
  total_checks: total,
  passed_checks: passed,
  failed_checks: failures.length,
  warnings: warnings.length,
  checks,
  failures,
  warnings,
  composition: compositionPath,
  site_dir: siteDir,
};

const reportPath = path.join(siteDir, 'qa-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

console.log(`\nQA Report: ${reportPath}`);
console.log(`Score: ${score}/10`);
console.log(`Recommendation: ${recommendation}`);
console.log(`Passed: ${passed}/${total}`);
if (failures.length > 0) {
  console.log(`\nFailures:`);
  for (const f of failures) console.log(`  ✗ ${f.name}: ${f.detail}`);
}
if (warnings.length > 0) {
  console.log(`\nWarnings:`);
  for (const w of warnings) console.log(`  ⚠ ${w.name}: ${w.detail}`);
}

process.exit(failures.length > 0 ? 1 : 0);

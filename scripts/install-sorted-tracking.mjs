import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const value = name => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] || '' : ''
}
const flag = name => args.includes(`--${name}`)
const usage = () => console.log(`Usage:
  node scripts/install-sorted-tracking.mjs --target ../client-repo --client-name "Client Name" --events booking_completed[,other_event] [--skip-deps] [--dry-run]

Installs Sorted Tracking v1 into a client site:
  app/tracking/page.tsx, tracking.css, fixture.ts
  netlify/functions/tracking-report.cjs + tracking-config.json
  pins @google-analytics/data@6.1.0 (exact) unless --skip-deps
  adds @netlify/blobs@10.7.13 if the target does not already provide it

--events is REQUIRED and must list the client's confirmed browser-reported
success event names (e.g. booking_completed from the site's booking-success
callback) — never a guess. GA4 event names: letters, digits, underscores;
must start with a letter.
`)

if (flag('help') || flag('h')) { usage(); process.exit(0) }

const targetArg = value('target')
const clientName = value('client-name')
const eventsArg = value('events')
const events = (eventsArg || '').split(',').map(s => s.trim()).filter(Boolean)
if (!targetArg || !clientName || !eventsArg) {
  usage()
  throw new Error('Provide --target, --client-name and explicit --events (confirmed per-client event names)')
}
for (const e of events) {
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(e)) {
    throw new Error(`Invalid GA4 event name "${e}" — must start with a letter and contain only letters, digits, underscores`)
  }
}

const templateRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'templates', 'sorted-tracking')
const target = resolve(process.cwd(), targetArg)
if (!existsSync(join(target, '.git'))) throw new Error(`Target is not a Git checkout: ${target}`)

let branch = ''
try { branch = execFileSync('git', ['-C', target, 'branch', '--show-current'], { encoding: 'utf8' }).trim() } catch {}
if (!branch) throw new Error('Could not determine target branch')
if (branch === 'main' || branch === 'master') throw new Error(`Refusing to install on ${branch}; create a feature branch first`)

// pnpm's non-hoisted node_modules cannot be traced by Netlify's default zisi
// function bundler; the nft bundler is a hard prerequisite on pnpm targets.
const usesPnpm = existsSync(join(target, 'pnpm-lock.yaml')) && !existsSync(join(target, 'package-lock.json'))
if (usesPnpm) {
  const tomlPath = join(target, 'netlify.toml')
  const toml = existsSync(tomlPath) ? readFileSync(tomlPath, 'utf8') : ''
  if (!/node_bundler\s*=\s*["']nft["']/.test(toml)) {
    throw new Error(
      'pnpm target detected but netlify.toml is missing the required function bundler setting.\n' +
      'Netlify\'s default zisi bundler cannot resolve pnpm\'s non-hoisted node_modules (e.g. google-gax).\n' +
      'Add this to netlify.toml first, then re-run:\n\n' +
      '[functions]\n  node_bundler = "nft"\n'
    )
  }
}

const files = [
  ['app/tracking/page.tsx', 'app/tracking/page.tsx'],
  ['app/tracking/tracking.css', 'app/tracking/tracking.css'],
  ['app/tracking/fixture.ts', 'app/tracking/fixture.ts'],
  ['netlify/functions/tracking-report.cjs', 'netlify/functions/tracking-report.cjs'],
  ['tests/tracking-report.test.mjs', 'tests/tracking-report.test.mjs'],
]

for (const [, dest] of files) {
  const destPath = join(target, dest)
  if (existsSync(destPath) && !flag('force')) {
    throw new Error(`${dest} already exists in target — pass --force to overwrite`)
  }
}

const configDest = join(target, 'netlify', 'functions', 'tracking-config.json')
const newConfig = JSON.stringify({ clientName, eventNames: events }, null, 2) + '\n'
if (existsSync(configDest)) {
  const existing = readFileSync(configDest, 'utf8')
  if (existing !== newConfig && !flag('force-config')) {
    throw new Error(
      `netlify/functions/tracking-config.json already exists with different content:\n${existing}\n` +
      'Not overwriting per-client config — re-run with --force-config to replace it deliberately'
    )
  }
}

const dryRun = flag('dry-run')
const written = []
for (const [src, dest] of files) {
  const srcPath = join(templateRoot, src)
  const destPath = join(target, dest)
  if (!existsSync(srcPath)) throw new Error(`Template file missing: ${srcPath}`)
  if (!dryRun) {
    mkdirSync(dirname(destPath), { recursive: true })
    copyFileSync(srcPath, destPath)
  }
  written.push(dest)
}

if (!dryRun) {
  mkdirSync(dirname(configDest), { recursive: true })
  writeFileSync(configDest, newConfig)
}
written.push('netlify/functions/tracking-config.json')

if (!flag('skip-deps')) {
  const usePnpm = usesPnpm
  const pkgPath = join(target, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  pkg.dependencies = pkg.dependencies || {}
  pkg.dependencies['@google-analytics/data'] = '6.1.0'
  pkg.dependencies['@netlify/blobs'] = pkg.dependencies['@netlify/blobs'] || '10.7.13'
  pkg.dependencies = Object.fromEntries(Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b)))
  if (dryRun) {
    console.log(`[dry-run] would pin @google-analytics/data@6.1.0 and ensure @netlify/blobs in package.json, then run ${usePnpm ? 'pnpm install' : 'npm install'}`)
  } else {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    execFileSync(usePnpm ? 'pnpm' : 'npm', ['install'], { cwd: target, stdio: 'inherit' })
  }
}

console.log(`${dryRun ? '[dry-run] ' : ''}Sorted Tracking v1 installed:`)
for (const f of written) console.log(`  ${f}`)
console.log(`
Next steps (manual):
  1. Configure GA4 credentials server-side (never commit):
     - Small sites: GA4_PROPERTY_ID + GA4_SERVICE_ACCOUNT_JSON env vars, or
     - Large env footprint: store property_id + credentials in Netlify Blobs store ga4-config.
  2. Verify the site uses the same invite-only Netlify Identity instance as /cms/.
  3. Run tests: node --test tests/tracking-report.test.mjs
  4. Build: npm run build (or pnpm build)
`)

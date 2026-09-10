import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve, join } from 'node:path'

const args = process.argv.slice(2)
const value = name => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] || '' : ''
}
const flag = name => args.includes(`--${name}`)
const usage = () => console.log(`Usage:
  node scripts/install-sorted-ad-review.mjs --target ../client-repo --slug client-slug --portal-origin https://ads.sortmydigital.site [--dry-run]
`)

if (flag('help') || flag('h')) { usage(); process.exit(0) }

const targetArg = value('target')
const slug = value('slug')
const originArg = value('portal-origin') || process.env.SORTED_AD_REVIEW_ORIGIN || ''
if (!targetArg || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !originArg) {
  usage()
  throw new Error('Provide a target, valid client slug and explicit portal origin')
}

const origin = originArg.replace(/\/+$/, '')
if (!/^https:\/\//.test(origin) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
  throw new Error('Portal origin must use HTTPS outside local development')
}

const target = resolve(process.cwd(), targetArg)
const configPath = join(target, 'netlify.toml')
const redirectsPath = join(target, 'public', '_redirects')
if (!existsSync(join(target, '.git'))) throw new Error(`Target is not a Git checkout: ${target}`)
let branch = ''
try { branch = execFileSync('git', ['-C', target, 'branch', '--show-current'], { encoding: 'utf8' }).trim() } catch {}
if (!branch) throw new Error('Could not determine target branch')
if (branch === 'main' || branch === 'master') throw new Error(`Refusing to install on ${branch}; create a feature branch first`)

const start = '# BEGIN SORTED AD REVIEW — managed block'
const end = '# END SORTED AD REVIEW — managed block'
const block = `${start}
[[redirects]]
  from = "/ads"
  to = "${origin}/portal/${slug}/"
  status = 200
  force = true

[[redirects]]
  from = "/ads/*"
  to = "${origin}/portal/${slug}/"
  status = 200
  force = true

[[headers]]
  for = "/ads/*"
  [headers.values]
    X-Robots-Tag = "noindex, nofollow"
    Cache-Control = "no-store"
${end}`

const existing = existsSync(configPath) ? readFileSync(configPath, 'utf8') : ''
const managed = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm')
const next = managed.test(existing)
  ? existing.replace(managed, block)
  : `${existing.trimEnd()}${existing.trim() ? '\n\n' : ''}${block}\n`

const redirectsStart = '# BEGIN SORTED AD REVIEW managed block'
const redirectsEnd = '# END SORTED AD REVIEW managed block'
const redirectsBlock = `${redirectsStart}
/ads ${origin}/portal/${slug}/ 200!
/ads/* ${origin}/portal/${slug}/ 200!
${redirectsEnd}`
const redirectsExisting = existsSync(redirectsPath) ? readFileSync(redirectsPath, 'utf8') : ''
const redirectsManaged = new RegExp(`${redirectsStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${redirectsEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm')
const redirectsNext = redirectsManaged.test(redirectsExisting)
  ? redirectsExisting.replace(redirectsManaged, redirectsBlock)
  : `${redirectsExisting.trimEnd()}${redirectsExisting.trim() ? '\n\n' : ''}${redirectsBlock}\n`

console.log(`${flag('dry-run') ? 'Would configure' : 'Configuring'} ${target}`)
console.log(`Public route: /ads/`)
console.log(`Tenant target: ${origin}/portal/${slug}/`)
if (!flag('dry-run')) {
  writeFileSync(configPath, next)
  if (existsSync(join(target, 'public'))) writeFileSync(redirectsPath, redirectsNext)
}

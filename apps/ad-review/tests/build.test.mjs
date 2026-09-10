import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

test('portal uses the required product name and private indexing policy', async () => {
  const [shell, htaccess, version] = await Promise.all([read('../public/shell.php'), read('../public/.htaccess'), read('../../../templates/sorted-ad-review/VERSION')])
  assert.match(shell, /Ad Review/)
  assert.match(shell, /noindex,nofollow/)
  assert.match(shell, new RegExp(`interfaceVersion = '${version.trim().replaceAll('.', '\\.')}'`))
  assert.match(shell, /styles\.css\?v=/)
  assert.match(shell, /app\.js\?v=/)
  assert.match(htaccess, /X-Robots-Tag "noindex, nofollow"/)
})

test('client app implements the Edgbaston interaction contract', async () => {
  const app = await read('../public/app.js')
  for (const requirement of [
    'Your next campaign,<br>ready for your eyes.',
    'Good ads start with a shared direction.',
    'Approve concept',
    'Reopen concept',
    'Review history',
    'Behind this ad',
    'Earlier approvals do not apply.',
    'Refresh board',
    'Sign out',
    'changes_requested',
    'target_type'
  ]) assert.match(app, new RegExp(requirement.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
})

test('stylesheet preserves the Edgbaston design system and responsive grid', async () => {
  const css = await read('../public/styles.css')
  for (const token of [
    '--ink:#070707',
    '--paper:#fbfbfa',
    '--acid:#dfff00',
    '--deep-green:#08241f',
    '--action-green:#16785f',
    '--powder-blue:#dcecf6',
    'font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    '.topbar{height:76px',
    '.app button:hover{background:var(--powder-blue);border-color:#bfd8e7}',
    'grid-template-columns:repeat(3,minmax(0,1fr))',
    '@media(max-width:1050px)',
    '@media(max-width:640px)'
  ]) assert.ok(css.includes(token), `Missing interface standard: ${token}`)
})

test('API and schema preserve concept reopen events', async () => {
  const [api, migration] = await Promise.all([
    read('../public/api/index.php'),
    read('../../../supabase/migrations/20260910162000_ad_review_reopen_status.sql')
  ])
  assert.match(api, /'awaiting_review', 'approved', 'changes_requested', 'rejected'/)
  assert.match(migration, /status in \('awaiting_review', 'approved', 'changes_requested', 'rejected'\)/)
})

test('skill defines Edgbaston as the mandatory shared standard', async () => {
  const [entry, skill, standard, doctrine] = await Promise.all([
    read('../../../.devin/skills/sorted-ad-review/SKILL.md'),
    read('../../../operators/skills/sorted-ad-review/SKILL.md'),
    read('../../../operators/skills/sorted-ad-review/references/interface-standard.md'),
    read('../../../operators/skills/sorted-ad-review/references/doctrine.md')
  ])
  assert.match(entry, /There is one uniform Sorted Ad Review product/)
  assert.match(skill, /Edgbaston Tuition Centre portal is the mandatory interface standard/)
  assert.match(skill, /Never create a separate client-specific portal UI/)
  assert.match(standard, /Immutable design tokens/)
  assert.match(standard, /Detail dialog/)
  assert.match(doctrine, /There is one Sorted Ad Review product/)
})

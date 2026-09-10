import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'

test('portal uses the required product name and private indexing policy', async () => {
  const [shell, htaccess] = await Promise.all([
    readFile(new URL('../public/shell.php', import.meta.url), 'utf8'),
    readFile(new URL('../public/.htaccess', import.meta.url), 'utf8'),
  ])
  assert.match(shell, /Ad previewer/)
  assert.match(shell, /noindex,nofollow/)
  assert.match(htaccess, /X-Robots-Tag "noindex, nofollow"/)
})

test('client app separates concept and ad review', async () => {
  const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8')
  assert.match(app, /Approve concept/)
  assert.match(app, /target_type/)
  assert.match(app, /changes_requested/)
})

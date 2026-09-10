import { createHash, randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'

const value = name => process.argv[process.argv.indexOf(`--${name}`) + 1] || ''
const slug = value('slug')
const name = value('name')
const allowedOrigin = value('allowed-origin')
const destinationHost = value('destination-host')
const output = value('output')
const project = process.env.SUPABASE_PROJECT_REF
const accessToken = process.env.SUPABASE_ACCESS_TOKEN
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !name || !allowedOrigin || !destinationHost || !output || !project || !accessToken) throw new Error('Missing tenant arguments or Supabase environment')

const reviewCode = `${slug.slice(0, 3)}-${randomBytes(10).toString('hex')}`
const ingestionKey = randomBytes(24).toString('hex')
const hash = input => createHash('sha256').update(input).digest('hex')
const literal = input => `'${String(input).replaceAll("'", "''")}'`
const sql = `
insert into public.ad_review_tenants(slug,name,allowed_origin,allowed_destination_hosts,access_token_hash,access_expires_at)
values (${literal(slug)},${literal(name)},${literal(allowedOrigin)},array[${literal(destinationHost)}],${literal(hash(reviewCode))},'2026-12-31T23:59:59Z')
on conflict (slug) do update set name=excluded.name, allowed_origin=excluded.allowed_origin,
allowed_destination_hosts=excluded.allowed_destination_hosts, access_token_hash=excluded.access_token_hash,
access_expires_at=excluded.access_expires_at, access_revoked_at=null;
insert into public.ad_review_agent_keys(token_hash,tenant_slug)
values (${literal(hash(ingestionKey))},${literal(slug)});
`
const response = await fetch(`https://api.supabase.com/v1/projects/${project}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql }),
})
if (!response.ok) throw new Error(`Tenant registration failed: ${response.status} ${await response.text()}`)
await mkdir(output, { recursive: true, mode: 0o700 })
await writeFile(`${output}/access-code`, reviewCode, { mode: 0o600 })
await writeFile(`${output}/ingestion-key`, ingestionKey, { mode: 0o600 })
console.log(`Registered ${slug}; credentials written with mode 0600 to ${output}`)

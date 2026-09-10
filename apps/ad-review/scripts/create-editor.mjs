import { createHash, randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const value = name => { const index = process.argv.indexOf(`--${name}`); return index < 0 ? '' : process.argv[index+1] || '' }
const slug = value('slug'), name = value('name'), output = value('output'), expires = value('expires')
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !name || !output || !expires || !url || !serviceKey || !(Date.parse(expires)>Date.now())) throw new Error('Provide --slug, --name, --output, --expires (future ISO date), SUPABASE_URL and SUPABASE_SERVICE_KEY')
const code = `edit-${randomBytes(24).toString('hex')}`
const hash = createHash('sha256').update(code).digest('hex')
// Fail before issuing a credential if it cannot be stored safely. Never overwrite an existing editor code.
await mkdir(output,{recursive:true,mode:0o700})
const path=resolve(output,'editor-code')
await writeFile(path,code,{mode:0o600,flag:'wx'})
const response=await fetch(`${url}/rest/v1/ad_review_editors`,{method:'POST',headers:{apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,'Content-Type':'application/json'},body:JSON.stringify({tenant_slug:slug,name,token_hash:hash,expires_at:new Date(expires).toISOString()})})
if(!response.ok) throw new Error(`Editor registration failed (${response.status}). The code at ${path} is inactive; inspect and remove it before retrying.`)
console.log(`Editor registered for ${slug}. Private code: ${path}`)

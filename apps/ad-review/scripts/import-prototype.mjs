// Build a reviewable central package and immutable assets from the legacy adapter.
// This script does not ingest, deploy, register tenants or transfer old approvals.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
const value = name => { const index=process.argv.indexOf(`--${name}`); return index<0?'':process.argv[index+1]||'' }
const target=resolve(value('target')),output=value('output'),slug=value('slug'),origin=value('origin')
if(!value('target')||!output||!slug||!/^https:\/\//.test(origin))throw Error('Provide --target, --output, --slug and --origin')
const {campaign:legacy}=await import(pathToFileURL(join(target,'sorted/ad-review/campaign.mjs')))
const concepts=[]
await mkdir(resolve('public/creatives'),{recursive:true})
for(const concept of legacy.concepts){
 const ads=[]
 for(const old of concept.ads){
  const file=resolve(target,'public',old.image.replace(/^\//,''))
  if(!file.startsWith(join(target,'public')+'/'))throw Error('Image path escapes public directory')
  const bytes=await readFile(file),hash=createHash('sha256').update(bytes).digest('hex')
  await copyFile(file,resolve('public/creatives',`${hash}.webp`))
  ads.push({id:old.id,revision:old.revision,placement:'facebook_feed',ratio:old.ratio,primary_text:old.primary_text,headline:old.headline,description:old.description,creative_key:`/creatives/${hash}.webp`,creative_alt:old.creative_alt,cta:'BOOK_NOW',destination_url:new URL(old.destination_url,origin).href})
 }
 concepts.push({id:concept.id,revision:concept.revision,name:concept.name,strategy:concept.strategy,audience:concept.audience,proposition:concept.proposition,ads})
}
const pkg={schema_version:1,base_revision:0,idempotency_key:`${legacy.id}-central-r1`,client_slug:slug,campaign:{id:legacy.id,revision:1,name:legacy.name,platform:legacy.platform,objective:legacy.objective,status:'awaiting_review',created_at:new Date().toISOString(),concepts},provenance:{agent:'prototype-migration',created_by:'Sorted'}}
await writeFile(resolve(output),JSON.stringify(pkg,null,2)+'\n',{flag:'wx'})
console.log(`Prepared ${concepts.reduce((n,c)=>n+c.ads.length,0)} ads at ${resolve(output)}. Existing decisions remain in the legacy store; fresh approval is required in the central portal.`)

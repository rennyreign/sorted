import assert from 'node:assert/strict'
import { test } from 'node:test'
import { execFileSync, execFile } from 'node:child_process'
import { promisify } from 'node:util'

const enabled = Boolean(process.env.AD_REVIEW_TEST_DATABASE)
const psql = process.env.PSQL_PATH || 'psql'
const args = ['-X', '-tA', '-v', 'ON_ERROR_STOP=1', process.env.AD_REVIEW_TEST_DATABASE || '']
const literal = value => `'${String(value).replaceAll("'", "''")}'`
const query = sql => execFileSync(psql,[...args,'-c',sql],{encoding:'utf8'}).trim()
const asyncQuery = async sql => (await promisify(execFile)(psql,[...args,'-c',sql])).stdout.trim()
const key = digit => `/creatives/${digit.repeat(64)}.webp`
const packageFor = (id, revision, image = key('1')) => ({campaign:{id,revision,name:'Test campaign',objective:'Test',platform:'meta',status:'awaiting_review',concepts:[{id:'concept',fingerprint:'concept-original',ads:[{id:'AD-1',revision,creative_key:image,ratio:'4:5',fingerprint:`ad-${revision}`,crop:{x:50,y:50}},{id:'AD-2',revision:1,creative_key:key('3'),ratio:'1:1',fingerprint:'unchanged'}]}]}})
const writeSQL = (pkg,base,mode='agent',target=null,tenant='editor-tests',intent=`${pkg.campaign.id}-${pkg.campaign.revision}`) => `select public.ad_review_write_revision(${literal(tenant)},${literal(JSON.stringify(pkg))}::jsonb,${base},'Test editor',${literal(mode)},${target ? literal(target) : 'null'},true,${literal(intent)},${literal(JSON.stringify(pkg))});`
const write = (...values) => JSON.parse(query(writeSQL(...values)))

test('database: manual protection, concurrent edits, history and exact approvals', {skip:!enabled}, async () => {
  query("insert into ad_review_tenants(slug,name,allowed_origin,access_token_hash) values('editor-tests','Test','https://example.test','hash'),('other-editor-tests','Other','https://example.test','other') on conflict do nothing")
  const id = `test-${Date.now()}`
  assert.equal(write(packageFor(id,1),0).ok,true)
  const selected = packageFor(id,2,key('2'))
  assert.equal(write(selected,1,'edit','AD-1').ok,true)
  assert.equal(JSON.parse(query(`select json_agg(ad_id) from ad_review_image_locks where campaign_id=${literal(id)}`))[0],'AD-1')
  assert.equal(write(packageFor(id,3),2).status,409,'agent cannot replace a manual image')
  const removed = packageFor(id,3,key('2')); removed.campaign.concepts[0].ads.shift()
  assert.equal(write(removed,2).status,409,'agent cannot remove a protected ad')
  const recropped = packageFor(id,3,key('2')); recropped.campaign.concepts[0].ads[0].crop.x=0
  assert.equal(write(recropped,2).status,409,'agent cannot change the protected crop')
  assert.equal(write(packageFor(id,2,key('2')),1).status,409,'stale submissions rejected')
  assert.equal(write(packageFor(id,3,key('2')),2).ok,true,'agent can retain selection while revising campaign')
  assert.equal(write(packageFor(id,1),0,'agent',null,'other-editor-tests').ok,true,'tenant state is independent')
  const next = packageFor(id,4,key('2'))
  const competing = await Promise.all([asyncQuery(writeSQL(next,3,'edit','AD-1')),asyncQuery(writeSQL(next,3,'edit','AD-1'))])
  assert.equal(competing.map(JSON.parse).filter(r=>r.ok).length,1,'exactly one concurrent save wins')
  assert.equal(competing.map(JSON.parse).filter(r=>r.status===409).length,1)
  const decision = revision => ({campaign_id:id,campaign_revision:revision,target_type:'ad',target_id:'AD-1',fingerprint:`ad-${revision}`,status:'approved',comment:'',reviewer:'Reviewer'})
  const decide = d => JSON.parse(query(`select ad_review_save_decision('editor-tests',${literal(JSON.stringify(d))}::jsonb)`))
  assert.equal(decide(decision(3)).status,409,'old revision cannot be approved')
  assert.equal(decide(decision(4)).decision.status,'approved')
  const restored = packageFor(id,5,key('1'))
  assert.equal(write(restored,4,'edit','AD-1').ok,true)
  assert.equal(query(`select count(*) from ad_review_decisions where tenant_slug='editor-tests' and campaign_id=${literal(id)} and fingerprint='ad-5'`),'0','restoring creates a fresh unapproved revision')
  assert.equal(query(`select count(*) from ad_review_campaigns where tenant_slug='editor-tests' and campaign_id=${literal(id)}`),'5','history is retained')
  const unlocked = packageFor(id,6,key('1')); unlocked.campaign.concepts[0].ads[0].fingerprint='ad-5'
  assert.equal(write(unlocked,5,'unlock','AD-1').ok,true)
  assert.equal(write(packageFor(id,7,key('3')),6).ok,true,'explicit unlock permits future agent selection')
  assert.equal(write(packageFor(id,7,key('3')),6).idempotent,true,'agent retries are idempotent')
  assert.equal(write(packageFor(id,7,key('4')),6).status,409,'same intent cannot change its payload')
  assert.equal(query("select has_function_privilege('anon','public.ad_review_write_revision(text,jsonb,integer,text,text,text,boolean,text,text)','execute')"),'f')
  assert.equal(query("select has_table_privilege('authenticated','ad_review_editors','select')"),'f')
})

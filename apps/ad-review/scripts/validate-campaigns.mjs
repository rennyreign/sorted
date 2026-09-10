import { readFile } from 'node:fs/promises'

const args = process.argv.slice(2)
const hostIndex = args.indexOf('--allow-host')
const allowedHost = hostIndex >= 0 ? args.splice(hostIndex,2)[1] : 'schoolofskill.co.uk'
const files = args
if (!files.length) throw new Error('Pass one or more campaign package paths')
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const creative = /^\/(?:creatives|media\/[a-z0-9-]+)\/[a-f0-9]{64}\.webp$/

for (const file of files) {
  const input = JSON.parse(await readFile(file, 'utf8'))
  const errors = []
  if (input.schema_version !== 1) errors.push('unsupported schema_version')
  if (!slug.test(input.idempotency_key || '') || !slug.test(input.client_slug || '')) errors.push('invalid package identity')
  const campaign = input.campaign || {}
  if (!slug.test(campaign.id || '') || !Number.isSafeInteger(campaign.revision) || campaign.revision < 1) errors.push('invalid campaign identity')
  if (input.base_revision !== undefined && (!Number.isSafeInteger(input.base_revision) || input.base_revision < 0 || campaign.revision !== input.base_revision + 1)) errors.push('invalid base_revision')
  if (campaign.platform !== 'meta' || !['draft', 'awaiting_review'].includes(campaign.status)) errors.push('invalid campaign metadata')
  const conceptIds = new Set()
  const adIds = new Set()
  for (const concept of campaign.concepts || []) {
    if (!slug.test(concept.id || '') || conceptIds.has(concept.id)) errors.push(`invalid concept ${concept.id}`)
    conceptIds.add(concept.id)
    for (const field of ['name', 'strategy', 'audience', 'proposition']) if (!concept[field]?.trim()) errors.push(`${concept.id} missing ${field}`)
    for (const ad of concept.ads || []) {
      if (!/^[A-Za-z0-9-]+$/.test(ad.id || '') || adIds.has(ad.id)) errors.push(`invalid ad ${ad.id}`)
      adIds.add(ad.id)
      if (!creative.test(ad.creative_key || '')) errors.push(`${ad.id} creative key is not immutable`)
      if (ad.creative_key?.startsWith('/media/') && !ad.creative_key.startsWith(`/media/${input.client_slug}/`)) errors.push(`${ad.id} image belongs to another tenant`)
      if (ad.crop && ['x','y'].some(axis => typeof ad.crop[axis] !== 'number' || ad.crop[axis] < 0 || ad.crop[axis] > 100)) errors.push(`${ad.id} crop is invalid`)
      if (!['facebook_feed', 'instagram_feed'].includes(ad.placement) || !['4:5', '1:1', '16:9'].includes(ad.ratio)) errors.push(`${ad.id} placement is invalid`)
      for (const field of ['primary_text', 'headline', 'description', 'creative_alt', 'destination_url']) if (!ad[field]?.trim()) errors.push(`${ad.id} missing ${field}`)
      try { const url = new URL(ad.destination_url); if (url.protocol !== 'https:' || url.hostname !== allowedHost) errors.push(`${ad.id} destination is not approved`) } catch { errors.push(`${ad.id} destination is invalid`) }
      if (`${ad.primary_text}${ad.headline}${ad.description}`.includes('—')) errors.push(`${ad.id} contains an em dash`)
    }
  }
  if (!conceptIds.size || !adIds.size) errors.push('campaign must contain concepts and ads')
  if (errors.length) throw new Error(`${file}:\n- ${errors.join('\n- ')}`)
  console.log(`${file}: valid (${conceptIds.size} concepts, ${adIds.size} ads)`)
}

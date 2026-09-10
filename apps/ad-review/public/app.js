const root = document.documentElement
const tenant = root.dataset.tenant
const origin = root.dataset.origin || 'https://sortmydigital.site/ad-previewer'
const app = document.querySelector('#app')
const state = {
  token: sessionStorage.getItem(`ad-review-token:${tenant}`) || '',
  reviewer: sessionStorage.getItem(`ad-review-reviewer:${tenant}`) || '',
  data: null,
  campaign: null,
  filter: 'all',
  concept: 'all',
  detail: null,
  busy: false,
  message: '',
  error: ''
}
const labels = { awaiting_review: 'Awaiting review', approved: 'Approved', changes_requested: 'Changes requested', rejected: 'Rejected' }
const statuses = Object.keys(labels)
const ctaLabels = { BOOK_NOW: 'Book Now', LEARN_MORE: 'Learn More', SIGN_UP: 'Sign Up' }
const esc = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])
const date = value => new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
const adsOf = campaign => campaign.concepts.flatMap(concept => concept.ads)
const tenantInitials = name => String(name || '').split(/\s+/).map(word => word[0]).join('').slice(0, 3).toUpperCase()
const tenantWebsite = url => { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' } }
const titleCase = value => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase())

const icons = {
  arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',
  lock: '<circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  refresh: '<path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"/>',
  thumbsUp: '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
}
const icon = (name, size = 16) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`

function campaignById(id = state.campaign) {
  return state.data?.campaigns.find(campaign => campaign.id === id)
}
function latest(campaign, target) {
  return [...(state.data?.decisions || [])].reverse().find(event => event.campaign_id === campaign.id && event.target_id === target.id && event.fingerprint === target.fingerprint)
}
function statusOf(campaign, target) {
  return latest(campaign, target)?.status || 'awaiting_review'
}
function statusBadge(status) {
  return `<span class="status ${status}"><span class="dot"></span>${esc(labels[status])}</span>`
}

async function api(method, body) {
  const response = await fetch(`${origin}/api/?tenant=${encodeURIComponent(tenant)}`, {
    method,
    cache: 'no-store',
    headers: { Authorization: `Bearer ${state.token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000)
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'The board could not be loaded.')
  return data
}

async function signIn(event) {
  event.preventDefault()
  const form = new FormData(event.currentTarget)
  state.reviewer = String(form.get('reviewer') || '').trim()
  state.token = String(form.get('token') || '').trim()
  state.busy = true
  state.error = ''
  render()
  try {
    state.data = await api('GET')
    state.campaign = state.data.campaigns.length === 1 ? state.data.campaigns[0].id : null
    sessionStorage.setItem(`ad-review-token:${tenant}`, state.token)
    sessionStorage.setItem(`ad-review-reviewer:${tenant}`, state.reviewer)
  } catch (error) {
    state.data = null
    state.error = error.message
  } finally {
    state.busy = false
    render()
  }
}

async function load() {
  if (!state.token || !state.reviewer) return render()
  state.busy = true
  render()
  try {
    state.data = await api('GET')
    state.campaign = state.data.campaigns.length === 1 ? state.data.campaigns[0].id : null
  } catch (error) {
    state.data = null
    state.error = error.message
  } finally {
    state.busy = false
    render()
  }
}

async function refresh() {
  state.busy = true
  state.error = ''
  state.message = ''
  render()
  try {
    state.data = await api('GET')
    state.message = 'Board is up to date.'
  } catch (error) {
    state.error = error.message
  } finally {
    state.busy = false
    render()
  }
}

async function decide(campaign, type, target, status, comment = '') {
  if (state.busy) return
  state.busy = true
  state.error = ''
  state.message = 'Saving review…'
  renderMessages()
  try {
    const result = await api('POST', {
      campaign_id: campaign.id,
      campaign_revision: campaign.revision,
      target_type: type,
      target_id: target.id,
      fingerprint: target.fingerprint,
      status,
      comment,
      reviewer: state.reviewer
    })
    state.data.decisions.push(result.decision)
    state.message = `${type === 'ad' ? target.id : target.name}: ${labels[status].toLowerCase()} saved.`
  } catch (error) {
    state.message = ''
    state.error = error.message
  } finally {
    state.busy = false
    render()
  }
}

function topbar() {
  return `<header class="topbar"><div class="brand" aria-label="Sorted">Sorted<span>.</span></div><span class="product">Ad Review</span><span class="private">${icon('lock', 13)} Private workspace</span>${state.data ? '<button class="quiet" id="sign-out">Sign out</button>' : ''}</header>`
}
function footer() {
  return `<footer class="footer"><span class="brand" aria-label="Sorted">Sorted<span>.</span></span><p>Clear feedback. Better creative.</p><span>Draft previews · Platform appearance may vary</span></footer>`
}
function accessView() {
  return `<section class="access"><div class="accessIcon">${icon('lock', 24)}</div><h1>Your next campaign,<br>ready for your eyes.</h1><p>Review the ideas, explore the ads, and tell us what you think. Every decision goes back to Sorted.</p><form id="access-form"><label>Your name<input required maxlength="100" autocomplete="name" name="reviewer" value="${esc(state.reviewer)}" placeholder="How should we record your feedback?"></label><label>Review access code<input required type="password" autocomplete="current-password" name="token" placeholder="Enter the code from Sorted"></label><button class="primary" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Opening board…' : 'Open review board'} ${icon('arrowUpRight', 17)}</button></form></section>`
}
function campaignIndex() {
  const rows = state.data.campaigns.map(campaign => {
    const ads = adsOf(campaign)
    const approved = ads.filter(ad => statusOf(campaign, ad) === 'approved').length
    return `<button class="campaignRow" data-campaign="${esc(campaign.id)}"><span><small>${esc(titleCase(campaign.platform))} · Draft campaign</small><strong>${esc(campaign.name)}</strong><span>${esc(campaign.objective)}</span></span><span class="campaignProgress"><strong>${approved} / ${ads.length}</strong><small>ads approved</small></span>${icon('arrowUpRight', 20)}</button>`
  }).join('')
  return `<section class="campaignIndex"><nav class="breadcrumb" aria-label="Breadcrumb"><ol><li>Ad Review</li><li>${esc(state.data.tenant.name)}</li><li aria-current="page">Campaigns</li></ol></nav><div class="indexHeading"><p>${esc(state.data.tenant.name)}</p><h1>Campaigns</h1><span>Choose a campaign to review its concepts and individual ad executions.</span></div><div class="campaignList">${rows || '<p>No campaigns are ready yet.</p>'}</div></section>`
}
function adPreview(campaign, ad) {
  const name = state.data.tenant.name
  const initials = tenantInitials(name)
  const website = tenantWebsite(ad.destination_url)
  return `<div class="ad"><div class="adIdentity"><div class="avatar">${esc(initials)}</div><div><strong>${esc(name)}</strong><small>Sponsored · ${icon('globe', 11)}</small></div>${icon('more', 20)}</div><p class="adText">${esc(ad.primary_text)}</p><div class="creative" style="aspect-ratio:${esc(ad.ratio.replace(':', '/'))}"><img src="${origin}${esc(ad.creative_key)}" alt="${esc(ad.creative_alt)}" loading="lazy"></div><div class="adDestination"><div><small>${esc(website)}</small><h3>${esc(ad.headline)}</h3><p>${esc(ad.description)}</p></div><span class="mockCta">${esc(ctaLabels[ad.cta] || titleCase(ad.cta))}</span></div><div class="adSocial" aria-hidden="true"><span>${icon('thumbsUp', 15)} Like</span><span>${icon('message', 15)} Comment</span><span>↗ Share</span></div></div>`
}
function reviewControls(campaign, ad) {
  const decision = latest(campaign, ad)
  return `${decision ? `<div class="decision">${decision.comment ? `<p>${esc(decision.comment)}</p>` : ''}<small>${esc(decision.reviewer)} · ${date(decision.created_at)}</small></div>` : ''}<div class="actions"><button class="approve" data-decision="approved" data-type="ad" data-target="${esc(ad.id)}" ${state.busy || decision?.status === 'approved' ? 'disabled' : ''}>${icon('check', 15)} Approve</button><button data-change="${esc(ad.id)}" ${state.busy ? 'disabled' : ''}>Request change</button><button class="reject" data-decision="rejected" data-type="ad" data-target="${esc(ad.id)}" ${state.busy || decision?.status === 'rejected' ? 'disabled' : ''}>Reject</button></div><form class="commentForm" data-change-form="${esc(ad.id)}" hidden><label for="comment-${esc(ad.id)}">What would you like changed?</label><textarea autofocus id="comment-${esc(ad.id)}" name="comment" required maxlength="2000" placeholder="Be specific about the copy, image or direction…"></textarea><div><button class="primary" ${state.busy ? 'disabled' : ''}>Submit request</button><button type="button" data-cancel="${esc(ad.id)}" ${state.busy ? 'disabled' : ''}>Cancel</button></div></form>`
}
function conceptView(campaign, concept) {
  const conceptStatus = statusOf(campaign, concept)
  const visibleAds = concept.ads.filter(ad => state.filter === 'all' || statusOf(campaign, ad) === state.filter)
  if (!visibleAds.length) return ''
  const index = campaign.concepts.findIndex(candidate => candidate.id === concept.id) + 1
  const cards = visibleAds.map(ad => {
    const hasEarlierRevision = state.data.decisions.some(event => event.campaign_id === campaign.id && event.target_id === ad.id && event.fingerprint !== ad.fingerprint)
    return `<article class="card"><div class="cardMeta"><span>${esc(ad.id)} <span class="muted">· v${ad.revision}</span></span><span>${esc(ad.ratio)} · Feed</span></div>${adPreview(campaign, ad)}<div class="review"><div class="reviewHead">${statusBadge(statusOf(campaign, ad))}<button class="quiet" data-detail="${esc(ad.id)}">Ad details ${icon('arrowUpRight', 14)}</button></div>${reviewControls(campaign, ad)}${hasEarlierRevision ? '<p class="revisionNote">This execution has changed. Earlier approvals do not apply.</p>' : ''}</div></article>`
  }).join('')
  return `<section class="concept" aria-labelledby="concept-${esc(concept.id)}"><div class="conceptHead"><span class="index">${String(index).padStart(2, '0')}</span><div class="conceptInfo"><h2 id="concept-${esc(concept.id)}">${esc(concept.name)}</h2><p>${esc(concept.strategy)}</p><details><summary>Audience &amp; proposition ${icon('chevronDown', 14)}</summary><p><strong>Audience:</strong> ${esc(concept.audience)}</p><p><strong>Proposition:</strong> ${esc(concept.proposition)}</p></details></div><div class="conceptDecision">${statusBadge(conceptStatus)}<button data-decision="${conceptStatus === 'approved' ? 'awaiting_review' : 'approved'}" data-type="concept" data-target="${esc(concept.id)}" ${state.busy ? 'disabled' : ''}>${conceptStatus === 'approved' ? 'Reopen concept' : 'Approve concept'} ${icon('check', 15)}</button><small>Direction only; ads need separate approval.</small></div></div><div class="grid">${cards}</div></section>`
}
function campaignView(campaign) {
  const ads = adsOf(campaign)
  const count = status => ads.filter(ad => statusOf(campaign, ad) === status).length
  const approved = count('approved')
  const visibleConcepts = campaign.concepts.filter(concept => state.concept === 'all' || concept.id === state.concept).map(concept => conceptView(campaign, concept)).join('')
  const summary = statuses.map(status => `<button data-summary-filter="${status}" aria-pressed="${state.filter === status}"><span class="dot ${status}"></span><strong>${count(status)}</strong><span>${esc(labels[status])}</span></button>`).join('')
  const tabs = ['all', ...statuses].map(status => `<button data-filter="${status}" aria-pressed="${state.filter === status}">${esc(status === 'all' ? 'All ads' : labels[status])}</button>`).join('')
  const options = campaign.concepts.map(concept => `<option value="${esc(concept.id)}" ${state.concept === concept.id ? 'selected' : ''}>${esc(concept.name)}</option>`).join('')
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><button data-index>Ad Review</button></li><li><button data-index>${esc(state.data.tenant.name)}</button></li><li><button data-index>Campaigns</button></li><li aria-current="page">${esc(campaign.name)}</li></ol></nav><section class="heading"><div><div class="headingMeta"><span class="pill">${esc(titleCase(campaign.platform))} · Facebook feed</span><span class="muted">Draft campaign</span></div><h1>${esc(campaign.name)}</h1><p>Good ads start with a shared direction.</p><p class="intro">Approve an idea to guide the creative. Approve an ad to sign off its exact copy, image and destination.</p></div><aside class="progress"><div><strong>${approved}<span> / ${ads.length}</span></strong><span>ads approved</span></div><progress value="${approved}" max="${ads.length}" aria-label="Ads approved"></progress><p>${approved === ads.length ? 'All ads approved for this revision.' : `${ads.length - approved} ads still need sign-off.`}</p><span class="muted">Approval does not publish an ad.</span></aside></section><div class="summary">${summary}</div><div class="guide"><span class="guideNumber">01</span><span>Choose a concept</span><span class="guideNumber">02</span><span>Review each execution</span><span class="guideNumber">03</span><span>Approve or leave feedback</span></div><div class="toolbar"><div class="tabs">${tabs}</div><label class="selectLabel"><span class="srOnly">Filter by concept</span><select id="concept-filter"><option value="all">All concepts</option>${options}</select></label></div><div class="sync"><span>Reviewing as <strong>${esc(state.reviewer)}</strong> · Decisions saved to this board</span><button class="quiet" id="refresh" ${state.busy ? 'disabled' : ''}>${icon('refresh', 14)} ${state.busy ? 'Saving / loading…' : 'Refresh board'}</button></div>${visibleConcepts || `<div class="empty">${icon('check', 28)}<h2>No ads in this view.</h2><p>Try another status or show the whole campaign.</p><button id="show-all">Show all ads</button></div>`}`
}
function detailDialog(campaign) {
  if (!state.detail) return '<dialog class="dialog" id="detail-dialog"></dialog>'
  const concept = campaign.concepts.find(candidate => candidate.ads.some(ad => ad.id === state.detail))
  const ad = concept?.ads.find(candidate => candidate.id === state.detail)
  if (!ad) return '<dialog class="dialog" id="detail-dialog"></dialog>'
  const values = {
    Concept: concept.name,
    Audience: concept.audience,
    Angle: ad.angle || concept.proposition,
    'Primary text': ad.primary_text,
    Headline: ad.headline,
    Description: ad.description,
    CTA: ctaLabels[ad.cta] || titleCase(ad.cta),
    Placement: titleCase(ad.placement),
    'Creative ratio': ad.ratio
  }
  const details = Object.entries(values).map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')
  const history = state.data.decisions.filter(event => event.campaign_id === campaign.id && event.target_id === ad.id).reverse().map(event => `<div class="history">${statusBadge(event.status)}<p>${esc(event.comment || 'No comment added.')}</p><small>${esc(event.reviewer)} · ${date(event.created_at)}${event.fingerprint !== ad.fingerprint ? ' · Earlier creative revision' : ''}</small></div>`).join('')
  return `<dialog class="dialog" id="detail-dialog"><div class="dialogHead"><div><span class="muted">${esc(ad.id)} · Revision ${ad.revision}</span><h2>Behind this ad</h2></div><button id="close-dialog" aria-label="Close ad details">${icon('x', 20)}</button></div><dl>${details}<div><dt>Destination</dt><dd><a href="${esc(ad.destination_url)}" target="_blank" rel="noreferrer">${esc(ad.destination_url)} ↗</a></dd></div></dl><h3>Review history</h3>${history || '<p class="muted">No decisions yet.</p>'}</dialog>`
}
function renderMessages() {
  const messages = document.querySelector('.messages')
  if (!messages) return
  messages.innerHTML = `${state.error ? `<div role="alert" class="error">${esc(state.error)}${state.data ? '<button id="error-refresh">Refresh board</button>' : ''}</div>` : ''}<div role="status" aria-live="polite">${esc(state.message)}</div>`
}
function render() {
  const campaign = campaignById()
  const content = !state.data ? accessView() : state.campaign && campaign ? campaignView(campaign) : campaignIndex()
  app.innerHTML = `<div class="app">${topbar()}<main id="main-content" class="main">${content}${state.data ? footer() : ''}<div class="messages"></div></main>${detailDialog(campaign)}</div>`
  bind()
  renderMessages()
  if (state.detail) document.querySelector('#detail-dialog')?.showModal()
}
function closeDetails() {
  const target = state.detail
  state.detail = null
  render()
  document.querySelector(`[data-detail="${CSS.escape(target)}"]`)?.focus()
}
function signOut() {
  sessionStorage.removeItem(`ad-review-token:${tenant}`)
  sessionStorage.removeItem(`ad-review-reviewer:${tenant}`)
  state.token = ''
  state.reviewer = ''
  state.data = null
  state.campaign = null
  state.detail = null
  state.error = ''
  state.message = ''
  render()
}
function bind() {
  document.querySelector('#access-form')?.addEventListener('submit', signIn)
  document.querySelector('#sign-out')?.addEventListener('click', signOut)
  document.querySelector('#refresh')?.addEventListener('click', refresh)
  document.querySelector('#error-refresh')?.addEventListener('click', refresh)
  document.querySelectorAll('[data-index]').forEach(button => button.addEventListener('click', () => { state.campaign = null; state.filter = 'all'; state.concept = 'all'; render() }))
  document.querySelectorAll('[data-campaign]').forEach(button => button.addEventListener('click', () => { state.campaign = button.dataset.campaign; state.filter = 'all'; state.concept = 'all'; render() }))
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { state.filter = button.dataset.filter; render() }))
  document.querySelectorAll('[data-summary-filter]').forEach(button => button.addEventListener('click', () => { state.filter = state.filter === button.dataset.summaryFilter ? 'all' : button.dataset.summaryFilter; render() }))
  document.querySelector('#concept-filter')?.addEventListener('change', event => { state.concept = event.target.value; render() })
  document.querySelector('#show-all')?.addEventListener('click', () => { state.filter = 'all'; state.concept = 'all'; render() })
  document.querySelectorAll('[data-change]').forEach(button => button.addEventListener('click', () => { document.querySelector(`[data-change-form="${CSS.escape(button.dataset.change)}"]`).hidden = false; document.querySelector(`#comment-${CSS.escape(button.dataset.change)}`)?.focus() }))
  document.querySelectorAll('[data-cancel]').forEach(button => button.addEventListener('click', () => { document.querySelector(`[data-change-form="${CSS.escape(button.dataset.cancel)}"]`).hidden = true }))
  document.querySelectorAll('[data-decision]').forEach(button => button.addEventListener('click', () => { const campaign = campaignById(); const target = button.dataset.type === 'concept' ? campaign.concepts.find(concept => concept.id === button.dataset.target) : adsOf(campaign).find(ad => ad.id === button.dataset.target); decide(campaign, button.dataset.type, target, button.dataset.decision) }))
  document.querySelectorAll('[data-change-form]').forEach(form => form.addEventListener('submit', event => { event.preventDefault(); const campaign = campaignById(); const ad = adsOf(campaign).find(candidate => candidate.id === form.dataset.changeForm); decide(campaign, 'ad', ad, 'changes_requested', String(new FormData(form).get('comment') || '').trim()) }))
  document.querySelectorAll('[data-detail]').forEach(button => button.addEventListener('click', () => { state.detail = button.dataset.detail; render() }))
  document.querySelector('#close-dialog')?.addEventListener('click', closeDetails)
  document.querySelector('#detail-dialog')?.addEventListener('cancel', event => { event.preventDefault(); closeDetails() })
  document.querySelector('#detail-dialog')?.addEventListener('click', event => { if (event.target === event.currentTarget) closeDetails() })
}

load()

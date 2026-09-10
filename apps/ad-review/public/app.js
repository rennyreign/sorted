import { attachImageEditor, imageStyle } from './image-editor.js'
const editorStyles = document.createElement('link')
editorStyles.rel = 'stylesheet'
editorStyles.href = new URL('./image-editor.css', import.meta.url).href
document.head.append(editorStyles)
const root = document.documentElement
const tenant = root.dataset.tenant
const origin = root.dataset.origin || 'https://sortmydigital.site/ad-previewer'
const app = document.querySelector('#app')
const state = { token: sessionStorage.getItem(`ad-preview-token:${tenant}`) || '', reviewer: sessionStorage.getItem(`ad-preview-reviewer:${tenant}`) || '', data: null, campaign: null, filter: 'all', concept: 'all', message: '', error: '' }
const labels = { awaiting_review: 'Awaiting review', approved: 'Approved', changes_requested: 'Changes requested', rejected: 'Rejected' }
const ctaLabels = { BOOK_NOW: 'Book Now', LEARN_MORE: 'Learn More', SIGN_UP: 'Sign Up' }
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c])
const latest = (campaign, target) => [...state.data.decisions].reverse().find(item => item.campaign_id === campaign.id && item.target_id === target.id && item.fingerprint === target.fingerprint)
const statusOf = (campaign, target) => latest(campaign, target)?.status || 'awaiting_review'
const adsOf = campaign => campaign.concepts.flatMap(concept => concept.ads)
const date = value => new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
const imageUrl = key => state.data?.assets?.find(asset => asset.creative_key === key)?.url || `${origin}${key}`

async function api(method, body, action = 'portal', query = {}) {
  const multipart = body instanceof FormData
  const params = new URLSearchParams({ tenant, action, ...query })
  const response = await fetch(`${origin}/api/?${params}`, { method, cache: 'no-store', headers: { Authorization: `Bearer ${state.token}`, ...(!multipart ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: multipart ? body : JSON.stringify(body) } : {}) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Ad previewer could not be reached.')
  return data
}

async function signIn(event) {
  event.preventDefault()
  const form = new FormData(event.currentTarget)
  state.reviewer = String(form.get('reviewer') || '').trim()
  state.token = String(form.get('token') || '').trim()
  state.error = ''
  renderLoading()
  try {
    state.data = await api('GET')
    sessionStorage.setItem(`ad-preview-token:${tenant}`, state.token)
    sessionStorage.setItem(`ad-preview-reviewer:${tenant}`, state.reviewer)
    render()
  } catch (error) { state.data = null; state.error = error.message; render() }
}

async function load() {
  if (!state.token || !state.reviewer) return render()
  try { state.data = await api('GET') } catch (error) { state.error = error.message; state.data = null }
  render()
}

async function decide(campaign, type, target, status, comment = '') {
  state.error = ''; state.message = 'Saving review…'; renderMessages()
  try {
    const result = await api('POST', { campaign_id: campaign.id, campaign_revision: campaign.revision, target_type: type, target_id: target.id, fingerprint: target.fingerprint, status, comment, reviewer: state.reviewer })
    state.data.decisions.push(result.decision)
    state.message = `${type === 'ad' ? target.id : target.name}: ${labels[status].toLowerCase()} saved.`
    render()
  } catch (error) { state.message = ''; state.error = error.message; renderMessages() }
}

function tenantInitials(name) { return (name || '').split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase() }
function tenantWebsite(url) { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' } }
function renderLoading() { app.innerHTML = '<main class="loading"><span></span><p>Opening Ad Review</p></main>' }
function renderMessages() { document.querySelector('.messages')?.remove(); if (!state.message && !state.error) return; const node = document.createElement('div'); node.className = 'messages'; node.innerHTML = `<div class="${state.error ? 'error' : 'notice'}" role="status">${esc(state.error || state.message)}</div>`; document.body.append(node) }
function footer() { return `<footer class="footer"><span class="sorted">Sorted<i>.</i></span><p>Clear feedback. Better creative.</p><span>Draft previews · Platform appearance may vary</span></footer>` }
function shell(content) { return `<header class="topbar"><div class="sorted">Sorted<i>.</i></div><span class="product">Ad Review</span><span class="private">Private workspace</span></header>${content}${footer()}<div class="messages"></div>` }

function accessView() {
  return shell(`<main class="access"><div class="access-mark">↗</div><p class="eyebrow">Private review workspace</p><h1>Your next campaign,<br>ready for your eyes.</h1><p>Review the ideas, explore the ads, and tell us what you think. Every decision goes back to Sorted.</p><form id="access-form"><label>Your name<input name="reviewer" autocomplete="name" required value="${esc(state.reviewer)}" placeholder="How should we record your feedback?"></label><label>Review access code<input name="token" type="password" autocomplete="current-password" required placeholder="Enter the code from Sorted"></label><button>Open review board <span>→</span></button></form>${state.error ? `<p class="error">${esc(state.error)}</p>` : ''}</main>`)
}

function campaignIndex() {
  const cards = state.data.campaigns.map(campaign => {
    const ads = adsOf(campaign); const approved = ads.filter(ad => statusOf(campaign, ad) === 'approved').length
    return `<button class="campaign-card" data-campaign="${esc(campaign.id)}"><span><small>${esc(campaign.platform)} · Draft campaign</small><strong>${esc(campaign.name)}</strong><span>${esc(campaign.objective)}</span></span><span class="campaign-meta"><strong>${approved} / ${ads.length}</strong><small>ads approved</small></span>→</button>`
  }).join('')
  return shell(`<main class="main"><section class="hero"><div><p class="eyebrow">${esc(state.data.tenant.name)}</p><h1>Campaigns ready for your review.</h1><p>Approve the strategic direction first, then review each individual execution. An ad approval applies only to the exact copy, image, CTA and destination shown.</p></div><div class="reviewer"><label>Reviewing as<input id="reviewer" value="${esc(state.reviewer)}"></label></div></section><section class="campaign-list">${cards || '<p>No campaigns are ready yet.</p>'}</section></main>`)
}

function adCard(campaign, concept, ad) {
  const decision = latest(campaign, ad); const status = decision?.status || 'awaiting_review'; const ratioClass = ad.ratio === '1:1' ? 'square' : ad.ratio === '16:9' ? 'wide' : ''
  const name = state.data.tenant.name; const initials = tenantInitials(name); const site = tenantWebsite(ad.destination_url)
  return `<article class="ad-card"><div class="ad-meta"><strong>${esc(ad.id)}</strong><span>${esc(ad.placement.replaceAll('_',' '))} · ${esc(ad.ratio)}</span></div><div class="ad-id"><span class="avatar">${esc(initials)}</span><div><strong>${esc(name)}</strong><small>Sponsored · Public</small></div></div><p class="ad-text">${esc(ad.primary_text)}</p><div class="creative ${ratioClass}"><img src="${origin}${esc(ad.creative_key)}" alt="${esc(ad.creative_alt)}" loading="lazy"></div><div class="destination"><div><small>${esc(site)}</small><h3>${esc(ad.headline)}</h3><p>${esc(ad.description)}</p></div><span class="mock-cta">${esc(ctaLabels[ad.cta] || ad.cta)}</span></div><div class="social"><span>Like</span><span>Comment</span><span>Share</span></div><div class="review"><div class="review-head"><strong>Review ${esc(ad.id)}</strong><span class="status ${status}">${esc(labels[status])}</span></div>${decision ? `<div class="decision">${decision.comment ? `<p>${esc(decision.comment)}</p>` : ''}<small>${esc(decision.reviewer)} · ${date(decision.created_at)}</small></div>` : ''}<div class="actions"><button class="approve" data-decision="approved" data-type="ad" data-target="${esc(ad.id)}">Approve</button><button data-change="${esc(ad.id)}">Request change</button><button class="reject" data-decision="rejected" data-type="ad" data-target="${esc(ad.id)}">Reject</button></div><form class="change-form" data-change-form="${esc(ad.id)}" hidden><label>What would you like changed?</label><textarea name="comment" required maxlength="2000" placeholder="Be specific about the copy, image or direction"></textarea><div><button class="approve">Submit request</button><button type="button" data-cancel="${esc(ad.id)}">Cancel</button></div></form></div></article>`
}

function campaignView(campaign) {
  const ads = adsOf(campaign); const count = key => ads.filter(ad => statusOf(campaign, ad) === key).length; const approved = count('approved')
  const concepts = campaign.concepts.filter(c => state.concept === 'all' || c.id === state.concept).map((concept, index) => {
    const conceptDecision = latest(campaign, concept); const conceptStatus = conceptDecision?.status || 'awaiting_review'
    const visible = concept.ads.filter(ad => state.filter === 'all' || statusOf(campaign, ad) === state.filter)
    if (!visible.length) return ''
    return `<section class="concept"><div class="concept-head"><span class="concept-index">${String(index + 1).padStart(2,'0')}</span><div class="concept-copy"><h2>${esc(concept.name)}</h2><p>${esc(concept.strategy)}</p><details><summary>Audience and proposition</summary><p><strong>Audience:</strong> ${esc(concept.audience)}<br><strong>Proposition:</strong> ${esc(concept.proposition)}</p></details></div><div class="concept-review"><button data-decision="approved" data-type="concept" data-target="${esc(concept.id)}">Approve concept</button><small class="status ${conceptStatus}">${esc(labels[conceptStatus])}</small></div></div><div class="grid">${visible.map(ad => adCard(campaign, concept, ad)).join('')}</div></section>`
  }).join('')
  const summaries = [['awaiting_review',count('awaiting_review')],['approved',approved],['changes_requested',count('changes_requested')],['rejected',count('rejected')]].map(([key,value]) => `<button data-filter="${key}" class="${state.filter === key ? 'active' : ''}"><strong>${value}</strong>${esc(labels[key])}</button>`).join('')
  const options = campaign.concepts.map(c => `<option value="${esc(c.id)}" ${state.concept === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')
  const tabs = [['all','All ads'],['awaiting_review',labels.awaiting_review],['approved',labels.approved],['changes_requested',labels.changes_requested],['rejected',labels.rejected]].map(([key,label]) => `<button data-filter="${key}" class="${state.filter === key ? 'active' : ''}">${esc(label)}</button>`).join('')
  return shell(`<main class="main"><button class="breadcrumb" id="back">← All campaigns</button><section class="campaign-head"><div><p class="eyebrow">${esc(state.data.tenant.name)} · ${esc(campaign.platform)} · revision ${campaign.revision}</p><h1>${esc(campaign.name)}</h1><p>${esc(campaign.objective)}</p></div><div class="progress"><strong>${approved}<span>/${ads.length}</span></strong><p>ads approved</p><div class="progress-bar"><i style="width:${ads.length ? approved/ads.length*100 : 0}%"></i></div><small>Concept and ad approvals are separate.</small></div></section><div class="summary">${summaries}</div><div class="guide"><span class="guide-number">01</span><span>Choose a concept</span><span class="guide-number">02</span><span>Review each execution</span><span class="guide-number">03</span><span>Approve or leave feedback</span></div><div class="toolbar"><div class="tabs">${tabs}</div><select id="concept-filter"><option value="all">All concepts</option>${options}</select></div>${concepts || '<div class="empty">No ads match this filter.</div>'}</main>`)
}

function bind() {
  if (state.data?.role === 'editor' && state.campaign) {
    attachImageEditor({ state, api, esc, imageUrl, reload: load, date })
  }
  document.querySelectorAll('.ad-card').forEach((card, index) => {
    const campaign = state.data?.campaigns.find(c => c.id === state.campaign)
    if (!campaign) return
    const id = card.querySelector('.ad-meta strong')?.textContent
    const ad = adsOf(campaign).find(item => item.id === id)
    if (ad) { const img = card.querySelector('.creative img'); img.src = imageUrl(ad.creative_key); img.style.cssText = imageStyle(ad) }
  })
  if (state.data) {
    const access = document.createElement('button')
    access.textContent = state.data.role === 'editor' ? 'Editor · Sign out' : 'Switch access'
    access.addEventListener('click', () => { sessionStorage.removeItem(`ad-preview-token:${tenant}`); state.token = ''; state.data = null; state.campaign = null; render() })
    document.querySelector('.topbar')?.append(access)
  }
  document.querySelector('#access-form')?.addEventListener('submit', signIn)
  document.querySelector('#reviewer')?.addEventListener('change', event => { state.reviewer = event.target.value.trim(); sessionStorage.setItem(`ad-preview-reviewer:${tenant}`, state.reviewer) })
  document.querySelectorAll('[data-campaign]').forEach(button => button.addEventListener('click', () => { state.campaign = button.dataset.campaign; state.filter = 'all'; state.concept = 'all'; render() }))
  document.querySelector('#back')?.addEventListener('click', () => { state.campaign = null; render() })
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { state.filter = button.dataset.filter; render() }))
  document.querySelector('#concept-filter')?.addEventListener('change', event => { state.concept = event.target.value; render() })
  document.querySelectorAll('[data-change]').forEach(button => button.addEventListener('click', () => { document.querySelector(`[data-change-form="${CSS.escape(button.dataset.change)}"]`).hidden = false }))
  document.querySelectorAll('[data-cancel]').forEach(button => button.addEventListener('click', () => { document.querySelector(`[data-change-form="${CSS.escape(button.dataset.cancel)}"]`).hidden = true }))
  document.querySelectorAll('[data-decision]').forEach(button => button.addEventListener('click', () => { const campaign = state.data.campaigns.find(c => c.id === state.campaign); const target = button.dataset.type === 'concept' ? campaign.concepts.find(c => c.id === button.dataset.target) : adsOf(campaign).find(a => a.id === button.dataset.target); decide(campaign, button.dataset.type, target, button.dataset.decision) }))
  document.querySelectorAll('[data-change-form]').forEach(form => form.addEventListener('submit', event => { event.preventDefault(); const campaign = state.data.campaigns.find(c => c.id === state.campaign); const ad = adsOf(campaign).find(a => a.id === form.dataset.changeForm); decide(campaign, 'ad', ad, 'changes_requested', new FormData(form).get('comment')) }))
}

function render() {
  if (!state.data) app.innerHTML = accessView()
  else if (!state.campaign) app.innerHTML = campaignIndex()
  else app.innerHTML = campaignView(state.data.campaigns.find(c => c.id === state.campaign))
  bind(); renderMessages()
}

load()

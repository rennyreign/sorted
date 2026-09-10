export function imageStyle(ad) {
  const clamp = value => Math.min(100, Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 50))
  return `object-position:${clamp(ad.crop?.x ?? 50)}% ${clamp(ad.crop?.y ?? 50)}%`
}

export function attachImageEditor(context) {
  const { state, esc } = context
  const campaign = state.data.campaigns.find(item => item.id === state.campaign)
  document.querySelectorAll('.ad-card').forEach(card => {
    const ad = campaign.concepts.flatMap(concept => concept.ads).find(item => item.id === card.querySelector('.ad-meta strong').textContent)
    if (!ad) return
    const lock = state.data.image_locks.some(item => item.campaign_id === campaign.id && item.ad_id === ad.id)
    const bar = document.createElement('div')
    bar.className = 'image-controls'
    bar.innerHTML = `<button type="button">Change image</button><span>${lock ? 'Manually selected · Protected' : 'Agent selected'}</span>`
    bar.querySelector('button').addEventListener('click', event => openEditor(context, campaign, ad, lock, event.currentTarget))
    card.querySelector('.creative').after(bar)
  })
}

function openEditor(context, campaign, ad, locked, trigger) {
  const { state, api, esc, imageUrl, reload, date } = context
  let assets = [...state.data.assets]
  let selected = assets.find(item => item.creative_key === ad.creative_key)
  let crop = { x: ad.crop?.x ?? 50, y: ad.crop?.y ?? 50 }
  let busy = false
  const dialog = document.createElement('dialog')
  dialog.className = 'image-editor'
  dialog.setAttribute('aria-labelledby', 'image-editor-title')
  dialog.innerHTML = `<header class="editor-heading"><div><p class="eyebrow">${esc(ad.id)} · ${esc(campaign.name)}</p><h2 id="image-editor-title">Choose the right image.</h2><p>Preview your choice with the ad before saving.</p></div><button type="button" data-close aria-label="Close image editor">✕</button></header>
    <div class="editor-layout"><section class="media-browser" aria-label="Client image library">
      <div class="media-filters"><label>Find an image<input type="search" id="media-search" placeholder="Search image names"></label><label>Collection<select id="media-collection"><option value="">All client images</option><option value="__campaign">Used in this campaign</option>${[...new Set(assets.map(a => a.collection).filter(Boolean))].map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select></label></div>
      <div class="media-grid" id="media-grid"></div>
      <details class="media-upload"><summary>Upload new image</summary><form id="media-upload-form"><p>Add a photograph or finished ad artwork to this client’s library.</p><label>Image file<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required></label><label>Image name<input name="name" maxlength="200" placeholder="Coach guiding a youth player" required></label><label>Collection<input name="collection" maxlength="100" value="${esc(campaign.name.slice(0,100))}"></label><label>Image type<select name="kind"><option value="photo">Photograph</option><option value="artwork">Finished artwork (includes text or graphics)</option></select></label><button type="submit">Upload to library</button><small>JPG, PNG or WebP · up to 8 MB · 24 megapixels</small></form></details>
      <details class="image-history"><summary>Image history</summary><div id="image-history">Open to load earlier versions.</div></details>
    </section><section class="editor-preview" aria-label="Ad preview"><p class="eyebrow">Preview · ${esc(ad.ratio)}</p><div class="preview-card"><div class="ad-id"><span class="avatar">${esc(state.data.tenant.name[0])}</span><div><strong>${esc(state.data.tenant.name)}</strong><small>Sponsored</small></div></div><p class="ad-text">${esc(ad.primary_text)}</p><div class="crop-preview" style="aspect-ratio:${esc(ad.ratio.replace(':','/'))}"><img id="selected-preview" alt=""></div><div class="destination"><div><h3>${esc(ad.headline)}</h3><p>${esc(ad.description)}</p></div><span class="mock-cta">${esc(ad.cta.replaceAll('_',' '))}</span></div></div><p id="selection-name"></p><div id="crop-controls"><label>Horizontal position<input id="crop-x" type="range" min="0" max="100" value="${crop.x}"></label><label>Vertical position<input id="crop-y" type="range" min="0" max="100" value="${crop.y}"></label><button type="button" id="reset-crop">Centre image</button></div><p class="crop-note" id="crop-note"></p></section></div>
    <footer class="editor-footer"><div><p id="editor-status" role="status" aria-live="polite">Your selection will be protected from agent changes.</p><small>Saving creates a new revision that needs approval.</small></div><div class="editor-buttons">${locked ? '<button type="button" id="unlock-image">Allow agent changes</button>' : ''}<button type="button" data-close>Cancel</button><button type="button" id="save-image" class="save-image">Save selection</button><button type="button" id="refresh-editor" hidden>Refresh board</button></div></footer>`
  document.body.append(dialog)
  document.body.classList.add('editor-open')
  const $ = selector => dialog.querySelector(selector)
  function close() { if (busy) return; dialog.close(); dialog.remove(); document.body.classList.remove('editor-open'); trigger?.focus() }
  dialog.addEventListener('cancel', event => { event.preventDefault(); close() })
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', close))
  function status(message, error = false) { $('#editor-status').textContent = message; $('#editor-status').classList.toggle('editor-error', error) }
  function setBusy(value) { busy = value; dialog.querySelectorAll('button,input,select').forEach(el => { el.disabled = value }); if (!value) preview() }
  function compatible(asset) {
    const [w,h] = ad.ratio.split(':').map(Number)
    return asset.kind !== 'artwork' || (asset.height && Math.abs(asset.width / asset.height - w / h) <= .02)
  }
  function preview() {
    $('#save-image').disabled = busy || !selected || !compatible(selected)
    if (!selected) return
    $('#selected-preview').src = selected.url || imageUrl(selected.creative_key)
    $('#selected-preview').alt = selected.name
    $('#selected-preview').style.cssText = imageStyle({ crop })
    $('#selection-name').textContent = selected.name
    $('#crop-controls').hidden = selected.kind === 'artwork'
    $('#crop-note').textContent = !compatible(selected) ? 'This artwork has a different shape. Upload a version matching this ad’s aspect ratio.' : selected.kind === 'artwork' ? 'Finished artwork is shown in full. To change a photo inside it, upload a revised design.' : 'Move the image within the frame. This crop is saved with this ad only.'
    $('#crop-x').value = crop.x; $('#crop-y').value = crop.y
    $('#selected-preview').onerror = () => { status('This image could not load. Refresh the board to renew image access.', true); $('#save-image').disabled = true; $('#refresh-editor').hidden = false }
  }
  function select(asset, position = { x:50, y:50 }) { selected = asset; crop = { ...position }; preview(); grid() }
  function grid() {
    const term = $('#media-search').value.toLowerCase().trim()
    const collection = $('#media-collection').value
    const used = new Set(campaign.concepts.flatMap(c => c.ads).map(a => a.creative_key))
    const visible = assets.filter(a => (!term || `${a.name} ${a.collection}`.toLowerCase().includes(term)) && (!collection || (collection === '__campaign' ? used.has(a.creative_key) : a.collection === collection)))
      .sort((a,b) => Number(used.has(b.creative_key)) - Number(used.has(a.creative_key)))
    $('#media-grid').innerHTML = visible.map(a => `<button type="button" class="media-tile" data-key="${esc(a.creative_key)}" aria-pressed="${a.creative_key === selected?.creative_key}"><img src="${esc(a.url || imageUrl(a.creative_key))}" alt="" loading="lazy"><strong>${esc(a.name)}</strong><small>${a.kind === 'artwork' ? 'Finished artwork' : 'Photograph'}${used.has(a.creative_key) ? ' · In this campaign' : ''}</small></button>`).join('') || '<p class="media-empty">No matching images. Try another collection or upload a new image.</p>'
    $('#media-grid').querySelectorAll('[data-key]').forEach(button => button.addEventListener('click', () => select(assets.find(a => a.creative_key === button.dataset.key))))
  }
  $('#media-search').addEventListener('input', grid)
  $('#media-collection').addEventListener('change', grid)
  for (const axis of ['x','y']) $(`#crop-${axis}`).addEventListener('input', event => { crop[axis] = Number(event.target.value); $('#selected-preview').style.cssText = imageStyle({ crop }) })
  $('#reset-crop').addEventListener('click', () => { crop = { x:50,y:50 }; preview() })
  $('#refresh-editor').addEventListener('click', async () => { close(); await reload() })
  async function save(action) {
    setBusy(true); status('Saving…')
    let committed = false
    try {
      await api('POST', { campaign_id: campaign.id, ad_id: ad.id, base_revision: campaign.revision, fingerprint: ad.fingerprint, creative_key: selected?.creative_key, crop }, action)
      committed = true
      state.message = action === 'edit-image' ? `${ad.id}: image saved and protected. Awaiting approval.` : `${ad.id}: agent image changes allowed.`
      setBusy(false); close(); await reload()
    } catch (error) { setBusy(false); status(committed ? 'Saved. Refresh the board to see the new revision.' : error.message, true); $('#refresh-editor').hidden = false }
  }
  $('#save-image').addEventListener('click', () => save('edit-image'))
  $('#unlock-image')?.addEventListener('click', () => save('unlock-image'))
  $('#media-upload-form input[name="image"]').addEventListener('change', event => { const file = event.target.files[0]; const name = $('#media-upload-form input[name="name"]'); if (file && !name.value) name.value = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').slice(0,200) })
  $('#media-upload-form').addEventListener('submit', async event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const file = form.get('image')
    setBusy(true); status('Preparing image…')
    let bitmap
    try {
      if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8*1024*1024) throw new Error('Choose a JPG, PNG or WebP image under 8 MB.')
      bitmap = await createImageBitmap(file)
      if (bitmap.width < 100 || bitmap.height < 100 || bitmap.width*bitmap.height > 24000000) throw new Error('Use an image between 100 × 100 pixels and 24 megapixels.')
      const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height
      canvas.getContext('2d').drawImage(bitmap,0,0)
      const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/webp',.92))
      if (!blob || blob.type !== 'image/webp' || blob.size > 8*1024*1024) throw new Error('This image could not be prepared. Try a smaller image or another browser.')
      form.set('image',blob,'image.webp'); status('Uploading to your library…')
      const result = await api('POST',form,'upload')
      assets = [result.asset,...assets.filter(a => a.creative_key !== result.asset.creative_key)]
      state.data.assets = assets
      $('#media-search').value = ''; $('#media-collection').value = ''
      select(result.asset); status('Uploaded. Preview the image, then save your selection.')
    } catch(error) { status(error.message,true) } finally { bitmap?.close(); setBusy(false) }
  })
  let historyLoaded = false
  $('.image-history').addEventListener('toggle', async () => {
    if (!$('.image-history').open || historyLoaded) return
    $('#image-history').textContent = 'Loading history…'
    try {
      const result = await api('GET',null,'history',{ campaign_id:campaign.id,ad_id:ad.id })
      $('#image-history').innerHTML = result.history.map((entry,index) => `<div class="history-entry"><img src="${esc(imageUrl(entry.ad.creative_key))}" alt=""><div><strong>Revision ${entry.ad.revision}</strong><small>${esc(entry.actor)} · ${esc(date(entry.created_at))}</small><small>${entry.mode === 'unlock' ? 'Agent changes allowed' : entry.mode === 'edit' ? 'Manual selection' : 'Campaign revision'}</small><button type="button" data-restore="${index}">Use this selection</button></div></div>`).join('') || '<p>No earlier versions yet.</p>'
      $('#image-history').querySelectorAll('[data-restore]').forEach(button => button.addEventListener('click', () => {
        const old = result.history[Number(button.dataset.restore)].ad
        const asset = assets.find(a => a.creative_key === old.creative_key)
        if (!asset) return status('This earlier image is unavailable in the library.',true)
        select(asset,old.crop || { x:50,y:50 }); status('Earlier selection restored in preview. Save to create a new revision.')
      }))
      historyLoaded = true
    } catch(error) { $('#image-history').textContent = error.message }
  })
  grid(); preview(); dialog.showModal()
}

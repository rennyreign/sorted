// Generate regions.json + deconstruction.json for nexus-accounting from the manifest.
// The mockup image is 863x1823. Manifest reference viewport width is 1536px.
// We compute approximate bboxes from manifest section heights.

import fs from 'fs'
import path from 'path'

const BUILD_DIR = '/Users/renaldoedmondson/Projects/nexus-accounting'
const MANIFEST = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, 'input/image-manifest.json'), 'utf8'))
const MOCKUP_W = 863
const MOCKUP_H = 1823
const REF_W = 1536
const SCALE = MOCKUP_W / REF_W // ~0.562

const ds = MANIFEST.design_ir
const sections = ds.page_structure

// Compute cumulative Y positions from section heights
// Some sections have offset_top_px (negative = overlaps previous)
let regions = []
let deconSections = []
let deconAssets = []
let deconCopy = []
let deconComponents = []
let yCursor = 0

const sectionAssets = {
  hero: ['hero_accounting_professional'],
  audience_cards: ['audience_contractor', 'audience_freelancer', 'audience_small_business'],
  dedicated_accountant: ['dedicated_accountant_photo'],
  freeagent: ['freeagent_device_composite'],
}

for (let i = 0; i < sections.length; i++) {
  const s = sections[i]
  const h = s.height_px || 100
  const offsetY = s.offset_top_px || 0
  const y = Math.max(0, yCursor + offsetY * SCALE)
  const w = MOCKUP_W
  const bbox = { x: 0, y: Math.round(y), w, h: Math.round(h * SCALE) }

  // Section region
  regions.push({
    id: s.section_id,
    type: 'section',
    label: s.section_id.replace(/_/g, ' '),
    bbox,
    notes: s.background || '',
  })

  deconSections.push({
    id: s.section_id,
    type: s.section_id,
    position: i,
    label: s.section_id.replace(/_/g, ' '),
    layout: s.layout?.type || s.layout?.columns || s.layout?.orientation || '',
    theme: s.text_color === '#FFFFFF' ? 'dark' : 'light',
    background: s.background || '#FFFFFF',
  })

  // Image asset regions
  const assetIds = sectionAssets[s.section_id] || []
  for (const aid of assetIds) {
    // Find the asset description in the manifest
    let desc = ''
    let aspect = '4:3'
    if (s.right_panel?.asset_id === aid) {
      desc = s.right_panel.description || ''
      aspect = s.right_panel.generation?.aspect_ratio || '4:3'
    } else if (s.image?.id === aid) {
      desc = s.image.description || ''
      aspect = s.image.aspect_ratio || '4:3'
    } else if (s.right_visual?.asset_id === aid) {
      desc = s.right_visual.description || ''
      aspect = '4:3'
    } else if (s.cards) {
      for (const c of s.cards) {
        if (c.image_asset?.id === aid) {
          desc = c.image_asset.description || ''
          aspect = c.image_asset.aspect_ratio || '16:8'
        }
      }
    }

    const assetBbox = { x: 0, y: Math.round(y), w, h: Math.round(h * SCALE) }
    regions.push({
      id: `${s.section_id}_${aid}`,
      type: 'image',
      section: s.section_id,
      label: aid,
      bbox: assetBbox,
      crop_path: `artifacts/regions/${s.section_id}_${aid}.png`,
      asset_id: aid,
    })

    deconAssets.push({
      id: aid,
      type: 'photograph',
      description: desc,
      priority: i < 3 ? 'high' : 'medium',
      source: 'ai-generation',
      section: s.section_id,
      aspect_ratio: aspect,
      bbox: assetBbox,
      mode_hint: 'flux-2-flex',
    })
  }

  // Extract copy
  const copyItems = []
  if (s.content?.logo) copyItems.push({ type: 'logo', text: s.content.logo.description || 'logo' })
  if (s.content?.navigation) copyItems.push({ type: 'nav', text: s.content.navigation.join(' | ') })
  if (s.content?.cta) copyItems.push({ type: 'cta', text: s.content.cta })
  if (s.left_panel?.eyebrow) copyItems.push({ type: 'eyebrow', text: s.left_panel.eyebrow })
  if (s.left_panel?.headline) copyItems.push({ type: 'headline', text: s.left_panel.headline.lines?.join(' ') || '' })
  if (s.left_panel?.body) copyItems.push({ type: 'body', text: s.left_panel.body })
  if (s.left_panel?.ctas) copyItems.push({ type: 'cta', text: s.left_panel.ctas.join(' | ') })
  if (s.left_panel?.pricing) copyItems.push({ type: 'pricing', text: `${s.left_panel.pricing.label} ${s.left_panel.pricing.price} ${s.left_panel.pricing.suffix}` })
  if (s.left?.heading_lines) copyItems.push({ type: 'headline', text: s.left.heading_lines.join(' ') })
  if (s.left?.description) copyItems.push({ type: 'body', text: s.left.description })
  if (s.left?.cta) copyItems.push({ type: 'cta', text: s.left.cta })
  if (s.left?.heading) copyItems.push({ type: 'headline', text: s.left.heading })
  if (s.left?.benefits) copyItems.push({ type: 'benefits', text: s.left.benefits.join(' | ') })
  if (s.heading) copyItems.push({ type: 'headline', text: s.heading.text || s.heading })
  if (s.intro?.heading_lines) copyItems.push({ type: 'headline', text: s.intro.heading_lines.join(' ') })
  if (s.headline) copyItems.push({ type: 'headline', text: s.headline })
  if (s.supporting_copy) copyItems.push({ type: 'body', text: s.supporting_copy })
  if (s.content?.eyebrow) copyItems.push({ type: 'eyebrow', text: s.content.eyebrow })
  if (s.content?.heading) copyItems.push({ type: 'headline', text: s.content.heading })
  if (s.content?.body) copyItems.push({ type: 'body', text: s.content.body })
  if (s.content?.stats) copyItems.push({ type: 'stats', text: s.content.stats.map(st => `${st.value} — ${st.label}`).join(' | ') })
  if (s.cards) {
    for (const c of s.cards) {
      copyItems.push({ type: 'card_title', text: c.title })
      copyItems.push({ type: 'card_body', text: c.description })
      if (c.link) copyItems.push({ type: 'card_link', text: c.link })
    }
  }
  if (s.review_cards) {
    for (const r of s.review_cards) {
      copyItems.push({ type: 'testimonial', text: `${r.quote} — ${r.name}, ${r.type}` })
    }
  }
  if (s.steps) {
    for (const st of s.steps) {
      copyItems.push({ type: 'step', text: `${st.number}: ${st.title} — ${st.body}` })
    }
  }
  if (s.trust_microcopy) copyItems.push({ type: 'microcopy', text: s.trust_microcopy.join(' | ') })
  if (s.cta?.text) copyItems.push({ type: 'cta', text: s.cta.text })
  if (s.phone) copyItems.push({ type: 'phone', text: s.phone })
  if (s.columns) {
    for (const col of s.columns) {
      if (col.heading) copyItems.push({ type: 'footer_heading', text: col.heading })
      if (col.items) copyItems.push({ type: 'footer_items', text: col.items.join(' | ') })
      if (col.elements) copyItems.push({ type: 'footer_brand', text: col.elements.join(' | ') })
    }
  }
  if (s.bottom_bar) {
    if (s.bottom_bar.copyright) copyItems.push({ type: 'copyright', text: s.bottom_bar.copyright })
    if (s.bottom_bar.links) copyItems.push({ type: 'footer_links', text: s.bottom_bar.links.join(' | ') })
  }
  if (s.price) copyItems.push({ type: 'price', text: `${s.price.value} ${s.price.suffix}` })
  if (s.feature_columns) {
    for (const fc of s.feature_columns) {
      copyItems.push({ type: 'features', text: fc.join(' | ') })
    }
  }
  if (s.left_group?.elements) copyItems.push({ type: 'trust', text: s.left_group.elements.join(' | ') })
  if (s.right_group?.elements) copyItems.push({ type: 'trust', text: s.right_group.elements.join(' | ') })

  for (const c of copyItems) {
    deconCopy.push({ section: s.section_id, type: c.type, text: c.text })
  }

  // Components
  const componentMap = {
    header: 'header_nav',
    hero: 'hero_split_v1',
    trust_strip: 'trust_bar',
    audience_cards: 'audience_card_grid_3',
    pricing_package: 'pricing_panel_dark',
    dedicated_accountant: 'split_image_content',
    freeagent: 'product_showcase_panel',
    testimonials: 'testimonial_dark_panel',
    switch_process: 'process_steps_3',
    final_cta: 'cta_banner_cyan',
    footer: 'footer_dark_5col',
  }
  if (componentMap[s.section_id]) {
    deconComponents.push({ component: componentMap[s.section_id], section: s.section_id })
  }

  yCursor = y + h * SCALE
}

const gds = ds.global_design_system
const buildNotes = {
  layout: 'asymmetric splits, 1328px container, compact-premium density',
  style: 'modern specialist accounting, high trust, low friction',
  theme: 'navy authority + cyan accent + white breathing room',
  accent_color: gds.colors.cyan_600,
  primary_font: gds.typography.font_family_primary,
  secondary_font: 'DM Mono (mono accents)',
  animation: 'standard: hover transitions 200ms, page-enter 0.55s',
  grid: '3-col audience cards, 2-col splits, 5-col footer',
  notes: ds.implementation_notes?.critical_visual_rules || [],
}

const regionsArtifact = {
  mockup_path: 'input/approved-mockup.png',
  regions,
  deconstruction: {
    page_type: 'full_page_marketing_landing_page',
    sections: deconSections,
    assets: deconAssets,
    copy: deconCopy,
    components: deconComponents,
    build_notes: buildNotes,
  },
  meta: {
    generated_at: new Date().toISOString(),
    source_image: 'input/approved-mockup.png',
    model_used: 'manifest-derived (no vision available)',
  },
}

const outRegions = path.join(BUILD_DIR, 'artifacts/regions.json')
const outDecon = path.join(BUILD_DIR, 'artifacts/deconstruction.json')
fs.mkdirSync(path.join(BUILD_DIR, 'artifacts/regions'), { recursive: true })
fs.writeFileSync(outRegions, JSON.stringify(regionsArtifact, null, 2))
fs.writeFileSync(outDecon, JSON.stringify(regionsArtifact.deconstruction, null, 2))

console.log(`Wrote ${outRegions}`)
console.log(`Wrote ${outDecon}`)
console.log(`Regions: ${regions.length}`)
console.log(`Sections: ${deconSections.length}`)
console.log(`Assets: ${deconAssets.length}`)
console.log(`Copy items: ${deconCopy.length}`)
console.log(`Components: ${deconComponents.length}`)

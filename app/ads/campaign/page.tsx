"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Share, Send, ImagePlus, Pencil, MoreHorizontal, X, Globe, Search, SlidersHorizontal, Check } from "lucide-react"
import { getCampaign, getCampaigns, getAssets, editImage, reviewStatusLabel, reviewStatusClass, statusLabel, statusClass, type Campaign, type Angle, type CopyVariant, type AdStatus, type ReviewStatus, type Asset } from "@/lib/ads"
import { useTenant } from "../components/TenantContext"

const variantLabels: Record<string, string> = {
  short: "Short",
  medium: "Medium",
  long: "Long",
}

function ctaLabel(cta: string): string {
  const labels: Record<string, string> = {
    BOOK_NOW: "Book Now",
    LEARN_MORE: "Learn More",
    SIGN_UP: "Sign Up",
  }
  return labels[cta] || cta?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Learn More"
}

const fieldLimits = {
  primary_text: 2000,
  headline: 40,
  description: 60,
}

function ratioClass(ratio: string): string {
  if (ratio === "4:5") return "ratio-4-5"
  if (ratio === "16:9") return "ratio-16-9"
  return "ratio-1-1"
}

function imageStyle(crop: { x: number; y: number }): React.CSSProperties {
  const clamp = (v: number) => Math.min(100, Math.max(0, Number.isFinite(v) ? v : 50))
  return { objectPosition: `${clamp(crop.x ?? 50)}% ${clamp(crop.y ?? 50)}%` }
}

export default function CampaignDetailPage() {
  return (
    <Suspense fallback={<div className="ads-loader"><div className="ads-loader-spinner" /><p>Loading…</p></div>}>
      <CampaignDetailContent />
    </Suspense>
  )
}

function CampaignDetailContent() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get("id") || ""
  const { tenant } = useTenant()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [editorState, setEditorState] = useState<{ angleId: string; variantId: string | null } | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!campaignId) {
      setLoading(false)
      setError("No campaign ID provided.")
      return
    }
    getCampaign(tenant, campaignId)
      .then((data) => setCampaign(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
    getAssets(tenant)
      .then(setAssets)
      .catch(() => {})
  }, [campaignId, tenant])

  const triggerToast = useCallback(() => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 1800)
  }, [])

  if (loading) return <Loader label="Opening campaign…" />
  if (error) return <ErrorState message={error} />
  if (!campaign) return <ErrorState message="Campaign not found." />

  const visibleAngles = campaign.angles.filter((a) => {
    if (filter === "All") return true
    if (filter === "Needs review") return a.status === "in_review" || a.status === "draft"
    if (filter === "Approved") return a.status === "approved"
    if (filter === "Draft") return a.status === "draft"
    return true
  }).filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()) || (a.proposition || "").toLowerCase().includes(search.toLowerCase()))

  const totalVariants = campaign.angles.length * 3
  const approvedVariants = campaign.angles.flatMap((a) => a.variants).filter((v) => v.review_status === "approved").length
  const changesVariants = campaign.angles.flatMap((a) => a.variants).filter((v) => v.review_status === "changes_requested").length
  const awaitingVariants = campaign.angles.flatMap((a) => a.variants).filter((v) => v.review_status === "awaiting_review").length

  return (
    <div className="ads-content">
      <nav className="ads-campaign-breadcrumb">
        <Link href="/ads/">Campaigns</Link>
        <span className="sep">/</span>
        <span style={{ fontWeight: 600, color: "var(--ads-ink)" }}>{campaign.name}</span>
      </nav>

      <div className="ads-campaign-header">
        <div className="ads-campaign-header-row1">
          <div>
            <h1>{campaign.name}</h1>
            <div className="ads-campaign-status">
              <span className={`ads-status-pill ${statusClass(campaign.status as AdStatus)}`}>
                <span className="dot" />
                {statusLabel(campaign.status as AdStatus)}
              </span>
            </div>
            <div className="ads-campaign-meta">
              <span>{campaign.channel}</span>
              {campaign.audience && (<><span>·</span><span>{campaign.audience}</span></>)}
              {campaign.start_date && (<><span>·</span><span>{campaign.start_date}</span></>)}
            </div>
            {campaign.goal && <p className="ads-campaign-desc">{campaign.goal}</p>}
          </div>
          <div className="ads-campaign-actions">
            <a href={`/review/?campaign=${encodeURIComponent(campaign.id)}`} target="_blank" rel="noopener noreferrer" className="ads-btn ads-btn-secondary" style={{ textDecoration: "none" }}>
              <Share size={18} strokeWidth={1.75} /> Share
            </a>
            <button className="ads-btn ads-btn-primary"><Send size={18} strokeWidth={1.75} /> Publish</button>
          </div>
        </div>
      </div>

      <div className="ads-campaign-progress">
        <div>
          <div className="progress-value">{approvedVariants}<span style={{ fontSize: 16, color: "var(--ads-text-subtle)" }}> / {totalVariants}</span></div>
          <div className="progress-label">approved</div>
        </div>
        <div className="progress-sep" />
        <div>
          <div className="progress-value" style={{ fontSize: 16, fontWeight: 700 }}>{changesVariants}</div>
          <div className="progress-label">changes requested</div>
        </div>
        <div className="progress-sep" />
        <div>
          <div className="progress-value" style={{ fontSize: 16, fontWeight: 700 }}>{awaitingVariants}</div>
          <div className="progress-label">awaiting feedback</div>
        </div>
      </div>

      <div className="ads-campaign-filters">
        <div className="ads-tabs">
          {["All", "Needs review", "Approved", "Draft"].map((f) => (
            <button key={f} className={`ads-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <input className="ads-search" placeholder="Search angles…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="ads-angle-list">
        {visibleAngles.map((angle) => (
          <AngleGroup key={angle.id} angle={angle} tenant={tenant} campaignId={campaignId} campaignRevision={campaign.revision} campaignName={campaign.name} onSaved={triggerToast} onOpenEditor={(variantId) => setEditorState({ angleId: angle.id, variantId })} onOpenAngleEditor={() => setEditorState({ angleId: angle.id, variantId: null })} onCropSaved={(variantId, newCrop, newRevision) => {
            setCampaign((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                revision: newRevision,
                angles: prev.angles.map((a) => {
                  if (a.id !== angle.id) return a
                  return { ...a, variants: a.variants.map((v) => v.id === variantId ? { ...v, crop: newCrop } : v) }
                }),
              }
            })
            triggerToast()
          }} />
        ))}
      </div>

      {showToast && <div className="ads-saved-toast">Saved</div>}

      {editorState && campaign && (
        <ImageEditorModal
          campaign={campaign}
          angle={campaign.angles.find((a) => a.id === editorState.angleId)!}
          variant={editorState.variantId ? campaign.angles.find((a) => a.id === editorState.angleId)?.variants.find((v) => v.id === editorState.variantId)! : null}
          assets={assets}
          saving={saving}
          onClose={() => { if (!saving) setEditorState(null) }}
          onSave={async (creativeKey, newCrop) => {
            const angle = campaign.angles.find((a) => a.id === editorState.angleId)
            if (!angle) return
            setSaving(true)
            try {
              const targetVariants = editorState.variantId
                ? angle.variants.filter((v) => v.id === editorState.variantId)
                : angle.variants
              let currentRev = campaign.revision
              for (const v of targetVariants) {
                const result = await editImage(tenant, campaign.id, currentRev, v.id, v.fingerprint, creativeKey, newCrop)
                currentRev = result.revision
              }
              setCampaign((prev) => {
                if (!prev) return prev
                return {
                  ...prev,
                  revision: currentRev,
                  angles: prev.angles.map((a) => {
                    if (a.id !== editorState.angleId) return a
                    const updatedVariants = editorState.variantId
                      ? a.variants.map((v) => v.id === editorState.variantId ? { ...v, crop: newCrop, creative_key: creativeKey, creative_url: assets.find((as) => as.id === creativeKey)?.url || v.creative_url } : v)
                      : a.variants.map((v) => ({ ...v, crop: newCrop, creative_key: creativeKey, creative_url: assets.find((as) => as.id === creativeKey)?.url || v.creative_url }))
                    const firstCreativeUrl = updatedVariants[0]?.creative_url || a.shared_creative_url
                    return { ...a, variants: updatedVariants, shared_creative_id: creativeKey, shared_creative_url: firstCreativeUrl }
                  }),
                }
              })
              triggerToast()
              setEditorState(null)
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to save image")
            } finally {
              setSaving(false)
            }
          }}
        />
      )}
    </div>
  )
}

function AngleGroup({ angle, tenant, campaignId, campaignRevision, campaignName, onSaved, onOpenEditor, onOpenAngleEditor, onCropSaved }: {
  angle: Angle
  tenant: string
  campaignId: string
  campaignRevision: number
  campaignName: string
  onSaved: () => void
  onOpenEditor: (variantId: string) => void
  onOpenAngleEditor: () => void
  onCropSaved: (variantId: string, crop: { x: number; y: number }, revision: number) => void
}) {
  const approvedCount = angle.variants.filter((v) => v.review_status === "approved").length
  const changesCount = angle.variants.filter((v) => v.review_status === "changes_requested").length
  const awaitingCount = angle.variants.filter((v) => v.review_status === "awaiting_review").length
  const statusParts: string[] = []
  if (approvedCount) statusParts.push(`${approvedCount} approved`)
  if (changesCount) statusParts.push(`${changesCount} changes`)
  if (awaitingCount) statusParts.push(`${awaitingCount} awaiting`)

  return (
    <div className="ads-angle">
      <div className="ads-angle-header">
        <span className="ads-angle-index">{String(angle.index).padStart(2, "0")}</span>
        <div className="ads-angle-info">
          <div className="ads-angle-name">{angle.name}</div>
          <div className="ads-angle-tags">{angle.proposition && <span>{angle.proposition}</span>}</div>
        </div>
        <div className="ads-angle-summary-counts">{statusParts.join(" · ") || "3 awaiting"}</div>
        <div className="ads-angle-controls">
          <button className="ads-angle-control-btn" aria-label="Edit angle"><Pencil size={15} strokeWidth={1.75} /></button>
          <button className="ads-angle-control-btn" aria-label="More"><MoreHorizontal size={16} strokeWidth={1.75} /></button>
        </div>
      </div>

      <div className="ads-shared-creative">
        <div className="ads-shared-creative-thumb" style={{ background: angle.shared_creative_url ? `url(${angle.shared_creative_url}) center/cover` : "linear-gradient(135deg, #E9F3EE 0%, #F2F8DD 100%)" }} />
        <div className="ads-shared-creative-info">
          <strong>Shared creative</strong>
          <small>Used by Short, Medium and Long. Changing it updates all three.</small>
        </div>
        <button className="ads-btn ads-btn-secondary" style={{ height: 36, padding: "0 14px", fontSize: 13 }} onClick={onOpenAngleEditor}><ImagePlus size={15} strokeWidth={1.75} /> Change</button>
      </div>

      <div className="ads-variants">
        {angle.variants.map((variant) => (
          <AdCard key={variant.id} variant={variant} tenant={tenant} campaignId={campaignId} campaignRevision={campaignRevision} campaignName={campaignName} angleName={angle.name} sharedCreativeUrl={angle.shared_creative_url} sharedCreativeId={angle.shared_creative_id} onSaved={onSaved} onCropSaved={(newCrop, newRevision) => onCropSaved(variant.id, newCrop, newRevision)} onOpenEditor={() => onOpenEditor(variant.id)} />
        ))}
      </div>
    </div>
  )
}

function AdCard({ variant, tenant, campaignId, campaignRevision, campaignName, angleName, sharedCreativeUrl, sharedCreativeId, onSaved, onCropSaved, onOpenEditor }: {
  variant: CopyVariant
  tenant: string
  campaignId: string
  campaignRevision: number
  campaignName: string
  angleName: string
  sharedCreativeUrl: string
  sharedCreativeId: string
  onSaved: () => void
  onCropSaved: (crop: { x: number; y: number }, revision: number) => void
  onOpenEditor: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [crop, setCrop] = useState(variant.crop || { x: 50, y: 50 })
  const [cropSaving, setCropSaving] = useState(false)
  const [cropError, setCropError] = useState("")
  const [text, setText] = useState({
    primary_text: variant.primary_text || "",
    headline: variant.headline || "",
    description: variant.description || "",
  })

  const creativeUrl = variant.creative_url || sharedCreativeUrl
  const ratio = variant.ratio || "1:1"

  const saveCrop = async (newCrop: { x: number; y: number }) => {
    setCropSaving(true)
    setCropError("")
    try {
      const result = await editImage(tenant, campaignId, campaignRevision, variant.id, variant.fingerprint, variant.creative_key || variant.id, newCrop)
      onCropSaved(newCrop, result.revision)
    } catch (err) {
      setCropError(err instanceof Error ? err.message : "Failed to save crop")
    } finally {
      setCropSaving(false)
    }
  }

  const handleSave = () => {
    setEditing(false)
    onSaved()
  }

  const handleCancel = () => {
    setText({
      primary_text: variant.primary_text || "",
      headline: variant.headline || "",
      description: variant.description || "",
    })
    setEditing(false)
  }

  const hasDecision = variant.review_status !== "awaiting_review" && (variant.review_comment || variant.reviewer)

  if (editing) {
    return (
      <div className="ads-ad-card editing">
        <div className="ads-ad-card-top">
          <span className="ads-ad-card-label">{variantLabels[variant.type] || variant.type}</span>
          <span className={`ads-status-pill ${reviewStatusClass(variant.review_status)}`} style={{ height: 22, fontSize: 11 }}><span className="dot" />{reviewStatusLabel(variant.review_status)}</span>
        </div>
        <div className="ads-ad-card-edit-fields">
          <div className="ads-field">
            <label>Primary text</label>
            <textarea value={text.primary_text} onChange={(e) => setText({ ...text, primary_text: e.target.value })} maxLength={fieldLimits.primary_text} rows={4} />
            <span className="char-count">{text.primary_text.length} / {fieldLimits.primary_text}</span>
          </div>
          <div className="ads-field">
            <label>Headline</label>
            <input type="text" value={text.headline} onChange={(e) => setText({ ...text, headline: e.target.value })} maxLength={fieldLimits.headline} />
            <span className="char-count">{text.headline.length} / {fieldLimits.headline}</span>
          </div>
          <div className="ads-field">
            <label>Description</label>
            <input type="text" value={text.description} onChange={(e) => setText({ ...text, description: e.target.value })} maxLength={fieldLimits.description} />
            <span className="char-count">{text.description.length} / {fieldLimits.description}</span>
          </div>
        </div>
        <div className="ads-ad-card-edit-footer">
          <button className="ads-btn ads-btn-ghost" onClick={handleCancel}><X size={15} strokeWidth={2} /> Cancel</button>
          <button className="ads-btn ads-btn-primary" style={{ height: 38, padding: "0 18px", fontSize: 14 }} onClick={handleSave}><Check size={16} strokeWidth={2} /> Done</button>
        </div>
      </div>
    )
  }

  return (
    <div className="ads-ad-card">
      <div className="ads-ad-card-top">
        <span className="ads-ad-card-label">{variantLabels[variant.type] || variant.type}</span>
        <div className="ads-ad-card-top-actions">
          <span className={`ads-status-pill ${reviewStatusClass(variant.review_status)}`} style={{ height: 22, fontSize: 11 }}><span className="dot" />{reviewStatusLabel(variant.review_status)}</span>
          <button className="ads-ad-card-edit-btn" aria-label="Edit ad" onClick={() => setEditing(true)}><Pencil size={14} strokeWidth={2} /></button>
        </div>
      </div>

      <div className="ads-ad-card-advertiser">
        <div className="ads-ad-card-advertiser-avatar">S</div>
        <div>
          <div className="ads-ad-card-advertiser-name">{campaignName}</div>
          <div className="ads-ad-card-sponsored">Sponsored · {angleName}</div>
        </div>
      </div>

      <div className="ads-ad-card-primary-text">{text.primary_text || "No primary text yet."}</div>

      <div className={`ads-ad-card-creative ${ratioClass(ratio)}`}>
        {creativeUrl ? (
          <img src={creativeUrl} alt={variant.creative_alt || angleName} style={imageStyle(crop)} />
        ) : (
          <div className="ads-ad-card-creative-placeholder">No creative</div>
        )}
      </div>

      <div className="ads-ad-card-image-controls">
        <button onClick={onOpenEditor}><ImagePlus size={13} strokeWidth={2} /> Override image</button>
        <button onClick={() => setCropOpen(!cropOpen)}><SlidersHorizontal size={13} strokeWidth={2} /> Adjust</button>
        <span className="image-source">{variant.creative_key && variant.creative_key !== sharedCreativeId ? "Custom" : "Agent selected"}</span>
      </div>

      <div className={`ads-ad-card-crop-controls ${cropOpen ? "open" : ""}`}>
        <div className="ads-ad-card-crop-row">
          <label>Horizontal</label>
          <input type="range" min="0" max="100" value={crop.x} onChange={(e) => setCrop({ ...crop, x: Number(e.target.value) })} />
        </div>
        <div className="ads-ad-card-crop-row">
          <label>Vertical</label>
          <input type="range" min="0" max="100" value={crop.y} onChange={(e) => setCrop({ ...crop, y: Number(e.target.value) })} />
        </div>
        {cropError && <div style={{ color: "#B33A3A", fontSize: 12, marginBottom: 8 }}>{cropError}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ads-ad-card-crop-reset" disabled={cropSaving} onClick={() => { setCrop({ x: 50, y: 50 }); saveCrop({ x: 50, y: 50 }) }}>Centre image</button>
          <button className="ads-btn ads-btn-primary" style={{ height: 32, padding: "0 14px", fontSize: 13, flex: 1 }} disabled={cropSaving} onClick={() => saveCrop(crop)}>
            {cropSaving ? <><div className="ads-loader-spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Saving…</> : "Save position"}
          </button>
        </div>
      </div>

      <div className="ads-ad-card-link">
        <Globe size={12} strokeWidth={1.75} />
        <span>{variant.destination_url || "sortmydigital.site"}</span>
      </div>

      <div className="ads-ad-card-link-preview">
        <div className="ads-ad-card-headline">{text.headline || "Headline"}</div>
        <div className="ads-ad-card-description">{text.description || "Description"}</div>
        <div className="ads-ad-card-cta">{ctaLabel(variant.cta)}</div>
      </div>

      {hasDecision && (
        <div className="ads-ad-card-decision has-decision">
          {variant.review_comment && <p>&ldquo;{variant.review_comment}&rdquo;</p>}
          <small>{variant.reviewer || "Client"} · {variant.review_status === "approved" ? "Approved" : variant.review_status === "changes_requested" ? "Changes requested" : variant.review_status === "rejected" ? "Rejected" : "Awaiting"}</small>
        </div>
      )}
    </div>
  )
}

function ImageEditorModal({ campaign, angle, variant, assets, saving, onClose, onSave }: {
  campaign: Campaign
  angle: Angle
  variant: CopyVariant | null
  assets: Asset[]
  saving: boolean
  onClose: () => void
  onSave: (creativeKey: string, crop: { x: number; y: number }) => void
}) {
  const [search, setSearch] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [crop, setCrop] = useState(variant?.crop || { x: 50, y: 50 })

  const imageAssets = assets.filter((a) => a.media_type === "image")
  const visible = imageAssets.filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()))

  const isAngleMode = !variant
  const previewVariant = variant || angle.variants[0]
  const creativeUrl = selectedAsset?.url || previewVariant?.creative_url || angle.shared_creative_url
  const ratio = previewVariant?.ratio || "1:1"
  const scopeLabel = isAngleMode ? `${angle.name} · All variants` : `${variant!.id} · ${campaign.name}`

  return createPortal(
    <div className="ads-image-editor" onClick={onClose}>
      <div className="ads-image-editor-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="ads-image-editor-header">
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--ads-green)" }}>{scopeLabel}</p>
            <h2>{isAngleMode ? "Change the shared creative." : "Override this ad's image."}</h2>
            <p>{isAngleMode ? "Updates Short, Medium and Long." : "Preview your choice with the ad before saving."}</p>
          </div>
          <button className="ads-image-editor-close" onClick={onClose} disabled={saving}><X size={20} strokeWidth={1.75} /></button>
        </div>

        <div className="ads-image-editor-body">
          <div className="ads-image-editor-section">
            <h3>Image library</h3>
            <div className="ads-image-editor-filters">
              <input type="search" placeholder="Search images…" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select>
                <option value="">All images</option>
                <option value="campaign">Used in this campaign</option>
              </select>
            </div>
            <div className="ads-image-editor-grid">
              {visible.length === 0 ? (
                <p style={{ gridColumn: "1 / -1", padding: "28px 12px", color: "var(--ads-text-muted)", fontSize: 13 }}>No images found.</p>
              ) : (
                visible.map((asset) => (
                  <button
                    key={asset.id}
                    className={`ads-image-editor-tile ${selectedAsset?.id === asset.id ? "selected" : ""}`}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <img src={asset.url} alt={asset.name} loading="lazy" />
                    <strong>{asset.name}</strong>
                    <small>{asset.aspect_ratio}</small>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="ads-image-editor-section">
            <h3>Preview · {ratio}</h3>
            <div className="ads-image-editor-preview">
              <div className="ads-image-editor-preview-card">
                <div className="ad-identity">
                  <div className="avatar">S</div>
                  <div>
                    <strong>{campaign.name}</strong>
                    <small>Sponsored · {angle.name}</small>
                  </div>
                </div>
                <div className="ad-text">{previewVariant?.primary_text || "No primary text yet."}</div>
                <div className="ad-creative" style={{ aspectRatio: ratio.replace(":", "/") }}>
                  {creativeUrl ? (
                    <img src={creativeUrl} alt="" style={imageStyle(crop)} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #E9F3EE 0%, #F2F8DD 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ads-text-subtle)", fontSize: 13 }}>No image</div>
                  )}
                </div>
              </div>

              <div className="ads-image-editor-crop-controls">
                <div className="ads-image-editor-crop-row">
                  <label>Horizontal</label>
                  <input type="range" min="0" max="100" value={crop.x} onChange={(e) => setCrop({ ...crop, x: Number(e.target.value) })} />
                </div>
                <div className="ads-image-editor-crop-row">
                  <label>Vertical</label>
                  <input type="range" min="0" max="100" value={crop.y} onChange={(e) => setCrop({ ...crop, y: Number(e.target.value) })} />
                </div>
                <button className="ads-ad-card-crop-reset" onClick={() => setCrop({ x: 50, y: 50 })}>Centre image</button>
              </div>
            </div>
          </div>
        </div>

        <div className="ads-image-editor-footer">
          <div>
            <small>{isAngleMode ? "Updates all three variants and creates a new revision." : "Your selection will be protected from agent changes. Saving creates a new revision that needs approval."}</small>
          </div>
          <div className="actions">
            <button className="ads-btn ads-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="ads-btn ads-btn-primary" style={{ height: 40, padding: "0 20px", fontSize: 14 }} disabled={!selectedAsset || saving} onClick={() => selectedAsset && onSave(selectedAsset.id, crop)}>
              {saving ? <><div className="ads-loader-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : <><Check size={16} strokeWidth={2} /> {isAngleMode ? "Update all variants" : "Save selection"}</>}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function Loader({ label }: { label: string }) {
  return (<div className="ads-loader"><div className="ads-loader-spinner" /><p>{label}</p></div>)
}
function ErrorState({ message }: { message: string }) {
  return (<div className="ads-content"><div className="ads-empty"><h2>Couldn't load campaign</h2><p>{message}</p></div></div>)
}

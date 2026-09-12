"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Share, Send, ChevronDown, ImagePlus, Check, MessageSquare, Pencil, MoreHorizontal, X, Globe } from "lucide-react"
import { getCampaign, statusLabel, statusClass, type Campaign, type Angle, type CopyVariant, type AdStatus } from "@/lib/ads"

const variantLabels: Record<string, string> = {
  short: "Short",
  medium: "Medium",
  long: "Long",
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
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (!campaignId) {
      setLoading(false)
      setError("No campaign ID provided.")
      return
    }
    getCampaign("school-of-skill", campaignId)
      .then((data) => setCampaign(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [campaignId])

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
  const approvedVariants = campaign.angles.flatMap((a) => a.variants).filter((v) => v.approval_status === "approved").length
  const inReviewVariants = campaign.angles.flatMap((a) => a.variants).filter((v) => v.approval_status === "in_review").length
  const draftVariants = totalVariants - approvedVariants - inReviewVariants

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
          <div className="progress-value" style={{ fontSize: 16, fontWeight: 700 }}>{inReviewVariants}</div>
          <div className="progress-label">in review</div>
        </div>
        <div className="progress-sep" />
        <div>
          <div className="progress-value" style={{ fontSize: 16, fontWeight: 700 }}>{draftVariants}</div>
          <div className="progress-label">draft</div>
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
          <AngleGroup key={angle.id} angle={angle} campaignName={campaign.name} onSaved={triggerToast} />
        ))}
      </div>

      {showToast && <div className="ads-saved-toast">Saved</div>}
    </div>
  )
}

function AngleGroup({ angle, campaignName, onSaved }: { angle: Angle; campaignName: string; onSaved: () => void }) {
  const approvedCount = angle.variants.filter((v) => v.approval_status === "approved").length
  const inReviewCount = angle.variants.filter((v) => v.approval_status === "in_review").length
  const draftCount = angle.variants.filter((v) => v.approval_status === "draft").length
  const statusParts: string[] = []
  if (approvedCount) statusParts.push(`${approvedCount} approved`)
  if (inReviewCount) statusParts.push(`${inReviewCount} in review`)
  if (draftCount) statusParts.push(`${draftCount} draft`)

  return (
    <div className="ads-angle">
      <div className="ads-angle-header">
        <span className="ads-angle-index">{String(angle.index).padStart(2, "0")}</span>
        <div className="ads-angle-info">
          <div className="ads-angle-name">{angle.name}</div>
          <div className="ads-angle-tags">{angle.proposition && <span>{angle.proposition}</span>}</div>
        </div>
        <div className="ads-angle-summary-counts">{statusParts.join(" · ") || "3 draft"}</div>
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
        <button className="ads-btn ads-btn-secondary" style={{ height: 36, padding: "0 14px", fontSize: 13 }}><ImagePlus size={15} strokeWidth={1.75} /> Change</button>
      </div>

      <div className="ads-variants">
        {angle.variants.map((variant) => (
          <AdCard key={variant.id} variant={variant} campaignName={campaignName} angleName={angle.name} sharedCreativeUrl={angle.shared_creative_url} onSaved={onSaved} />
        ))}
      </div>
    </div>
  )
}

function AdCard({ variant, campaignName, angleName, sharedCreativeUrl, onSaved }: {
  variant: CopyVariant
  campaignName: string
  angleName: string
  sharedCreativeUrl: string
  onSaved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [text, setText] = useState({
    primary_text: variant.primary_text || "",
    headline: variant.headline || "",
    description: variant.description || "",
  })
  const [status, setStatus] = useState<AdStatus>(variant.approval_status)

  const creativeUrl = variant.creative_url || sharedCreativeUrl
  const ratio = variant.ratio || "1:1"

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

  const handleApprove = () => {
    setStatus("approved")
    onSaved()
  }

  if (editing) {
    return (
      <div className="ads-ad-card editing">
        <div className="ads-ad-card-top">
          <span className="ads-ad-card-label">{variantLabels[variant.type] || variant.type}</span>
          <span className={`ads-status-pill ${statusClass(status)}`} style={{ height: 22, fontSize: 11 }}><span className="dot" />{statusLabel(status)}</span>
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
          <span className={`ads-status-pill ${statusClass(status)}`} style={{ height: 22, fontSize: 11 }}><span className="dot" />{statusLabel(status)}</span>
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
          <img src={creativeUrl} alt={variant.creative_alt || angleName} />
        ) : (
          <div className="ads-ad-card-creative-placeholder">No creative</div>
        )}
      </div>

      <div className="ads-ad-card-link">
        <Globe size={12} strokeWidth={1.75} />
        <span>{variant.destination_url || "sortmydigital.site"}</span>
      </div>

      <div className="ads-ad-card-link-preview">
        <div className="ads-ad-card-headline">{text.headline || "Headline"}</div>
        <div className="ads-ad-card-description">{text.description || "Description"}</div>
        <div className="ads-ad-card-cta">{variant.cta || "Learn more"}</div>
      </div>

      <div className="ads-ad-card-feed-actions">
        <button className="ads-ad-card-feed-btn approve" onClick={handleApprove}>
          <Check size={15} strokeWidth={2} /> {status === "approved" ? "Approved" : "Approve"}
        </button>
        <button className="ads-ad-card-feed-btn comment" onClick={() => setCommentsOpen(!commentsOpen)}>
          <MessageSquare size={15} strokeWidth={1.75} /> Comment
        </button>
      </div>

      {commentsOpen && (
        <div className="ads-ad-card-comments open">
          {variant.comment_count > 0 ? (
            <div className="ads-comment">
              <div className="ads-comment-avatar">RE</div>
              <div className="ads-comment-body">
                <div className="ads-comment-author">Renaldo</div>
                <div className="ads-comment-text">Reviewing this variant.</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--ads-text-subtle)", marginBottom: 8 }}>No comments yet.</div>
          )}
          <div className="ads-comment-input">
            <input type="text" placeholder="Write a comment…" />
            <button className="ads-btn ads-btn-secondary" style={{ height: 36, padding: "0 14px", fontSize: 13 }}>Post</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Loader({ label }: { label: string }) {
  return (<div className="ads-loader"><div className="ads-loader-spinner" /><p>{label}</p></div>)
}
function ErrorState({ message }: { message: string }) {
  return (<div className="ads-content"><div className="ads-empty"><h2>Couldn't load campaign</h2><p>{message}</p></div></div>)
}

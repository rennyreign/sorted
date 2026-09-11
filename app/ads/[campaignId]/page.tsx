"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Share, Send, ChevronDown, ImagePlus, Check, MessageSquare } from "lucide-react"
import { getCampaign, statusLabel, statusClass, type Campaign, type Angle, type AdStatus } from "@/lib/ads"

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

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.campaignId as string
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedAngle, setExpandedAngle] = useState<string | null>(null)
  const [filter, setFilter] = useState("All")

  useEffect(() => {
    getCampaign("school-of-skill", campaignId)
      .then((data) => {
        setCampaign(data)
        if (data && data.angles.length > 0) setExpandedAngle(data.angles[0].id)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [campaignId])

  const toggleAngle = useCallback((id: string) => {
    setExpandedAngle((prev) => (prev === id ? null : id))
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
  })

  const approvedCount = campaign.angles.filter((a) => a.status === "approved").length
  const totalVariants = campaign.angles.length * 3
  const approvedVariants = campaign.angles.flatMap((a) => a.variants).filter((v) => v.approval_status === "approved").length

  return (
    <div className="ads-content">
      {/* Breadcrumb */}
      <nav className="ads-breadcrumb">
        <Link href="/ads/">Campaigns</Link>
        <span className="sep">/</span>
        <span style={{ fontWeight: 600, color: "var(--ads-ink)" }}>{campaign.name}</span>
      </nav>

      {/* Header */}
      <div className="ads-campaign-header">
        <div>
          <h1>{campaign.name}</h1>
          <div className="ads-campaign-meta">
            <span>{campaign.channel}</span>
            <span>·</span>
            <span>{campaign.audience || "—"}</span>
            {campaign.start_date && (
              <>
                <span>·</span>
                <span>{campaign.start_date}</span>
              </>
            )}
          </div>
          {campaign.goal && <p className="ads-campaign-desc">{campaign.goal}</p>}
        </div>
        <div className="ads-campaign-actions">
          <button className="ads-btn ads-btn-secondary">
            <Share size={18} strokeWidth={1.75} /> Share
          </button>
          <button className="ads-btn ads-btn-primary">
            <Send size={18} strokeWidth={1.75} /> Publish
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="ads-filters">
        <div className="ads-tabs">
          {["All", "Needs review", "Approved", "Draft"].map((f) => (
            <button
              key={f}
              className={`ads-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Layout */}
      <div className="ads-campaign-layout">
        <div className="ads-campaign-main">
          <div className="ads-angle-list">
            {visibleAngles.map((angle) => (
              <AngleRow
                key={angle.id}
                angle={angle}
                expanded={expandedAngle === angle.id}
                onToggle={() => toggleAngle(angle.id)}
              />
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div className="ads-right-rail">
          <div className="ads-rail-card">
            <h3>Campaign progress</h3>
            <div className="progress-ring">
              <div>
                <div className="value">{approvedVariants}<span style={{ fontSize: 18, color: "var(--ads-text-subtle)" }}> / {totalVariants}</span></div>
                <div className="label">variants approved</div>
              </div>
            </div>
          </div>
          {campaign.start_date && (
            <div className="ads-rail-card">
              <h3>Key date</h3>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{campaign.start_date}</div>
            </div>
          )}
          {campaign.audience && (
            <div className="ads-rail-card">
              <h3>Target audience</h3>
              <div style={{ fontSize: 15 }}>{campaign.audience}</div>
            </div>
          )}
          <div className="ads-rail-card">
            <h3>Channels</h3>
            <div style={{ fontSize: 15, textTransform: "capitalize" }}>{campaign.channel}</div>
          </div>
          {campaign.goal && (
            <div className="ads-rail-card">
              <h3>Campaign goal</h3>
              <div style={{ fontSize: 14, color: "var(--ads-text-muted)" }}>{campaign.goal}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AngleRow({ angle, expanded, onToggle }: { angle: Angle; expanded: boolean; onToggle: () => void }) {
  const approvedCount = angle.variants.filter((v) => v.approval_status === "approved").length
  const inReviewCount = angle.variants.filter((v) => v.approval_status === "in_review").length
  const draftCount = angle.variants.filter((v) => v.approval_status === "draft").length

  const statusParts: string[] = []
  if (approvedCount) statusParts.push(`${approvedCount} approved`)
  if (inReviewCount) statusParts.push(`${inReviewCount} in review`)
  if (draftCount) statusParts.push(`${draftCount} draft`)

  return (
    <div className={`ads-angle ${expanded ? "expanded" : ""}`}>
      <div className="ads-angle-summary" onClick={onToggle} role="button" tabIndex={0}>
        <span className="ads-angle-index">{String(angle.index).padStart(2, "0")}</span>
        <div
          className="ads-angle-thumb"
          style={{
            background: angle.shared_creative_url
              ? `url(${angle.shared_creative_url}) center/cover`
              : "linear-gradient(135deg, #E9F3EE 0%, #F2F8DD 100%)",
          }}
        />
        <div className="ads-angle-info">
          <div className="ads-angle-name">{angle.name}</div>
          <div className="ads-angle-tags">
            {angle.proposition && <span>{angle.proposition}</span>}
          </div>
        </div>
        <div className="ads-angle-status-summary">
          {statusParts.join(" · ") || "3 draft"}
        </div>
        <ChevronDown size={20} className="ads-angle-chevron" strokeWidth={1.75} />
      </div>

      {expanded && (
        <div className="ads-angle-editor">
          {/* Shared creative */}
          <div className="ads-shared-creative">
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 10,
                background: angle.shared_creative_url
                  ? `url(${angle.shared_creative_url}) center/cover`
                  : "linear-gradient(135deg, #E9F3EE 0%, #F2F8DD 100%)",
                flexShrink: 0,
              }}
            />
            <div className="ads-shared-creative-info">
              <strong>Shared creative</strong>
              <small>Used by Short, Medium and Long</small>
            </div>
            <button className="ads-btn ads-btn-secondary" style={{ height: 38, padding: "0 16px", fontSize: 14 }}>
              <ImagePlus size={16} strokeWidth={1.75} /> Change
            </button>
          </div>

          {/* Copy variants */}
          <div className="ads-variants">
            {angle.variants.map((variant) => (
              <VariantEditor key={variant.id} variant={variant} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function VariantEditor({ variant }: { variant: any }) {
  const [text, setText] = useState({
    primary_text: variant.primary_text || "",
    headline: variant.headline || "",
    description: variant.description || "",
  })

  return (
    <div className="ads-variant">
      <div className="ads-variant-header">
        <span className="ads-variant-label">{variantLabels[variant.type] || variant.type}</span>
        <span className={`ads-status-pill ${statusClass(variant.approval_status as AdStatus)}`} style={{ height: 24, fontSize: 12 }}>
          <span className="dot" />
          {statusLabel(variant.approval_status as AdStatus)}
        </span>
      </div>

      <div className="ads-field">
        <label>Primary text</label>
        <textarea
          value={text.primary_text}
          onChange={(e) => setText({ ...text, primary_text: e.target.value })}
          maxLength={fieldLimits.primary_text}
          rows={4}
        />
        <span className="char-count">{text.primary_text.length} / {fieldLimits.primary_text}</span>
      </div>

      <div className="ads-field">
        <label>Headline</label>
        <input
          type="text"
          value={text.headline}
          onChange={(e) => setText({ ...text, headline: e.target.value })}
          maxLength={fieldLimits.headline}
        />
        <span className="char-count">{text.headline.length} / {fieldLimits.headline}</span>
      </div>

      <div className="ads-field">
        <label>Description</label>
        <input
          type="text"
          value={text.description}
          onChange={(e) => setText({ ...text, description: e.target.value })}
          maxLength={fieldLimits.description}
        />
        <span className="char-count">{text.description.length} / {fieldLimits.description}</span>
      </div>

      <div className="ads-variant-actions">
        <button className="ads-btn ads-btn-ghost" style={{ color: "var(--ads-green)" }}>
          <Check size={16} strokeWidth={2} /> Approve
        </button>
        <button className="ads-btn ads-btn-ghost">
          <MessageSquare size={16} strokeWidth={1.75} /> Comment
        </button>
      </div>
    </div>
  )
}

function Loader({ label }: { label: string }) {
  return (
    <div className="ads-loader">
      <div className="ads-loader-spinner" />
      <p>{label}</p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="ads-content">
      <div className="ads-empty">
        <h2>Couldn't load campaign</h2>
        <p>{message}</p>
      </div>
    </div>
  )
}

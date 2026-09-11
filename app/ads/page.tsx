"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, MoreHorizontal, Lock } from "lucide-react"
import { getCampaigns, getAccessCode, setAccessCode, statusLabel, statusClass, type Campaign, type AdStatus } from "@/lib/ads"

const filters = ["All", "Active", "Draft", "Completed"] as const
type Filter = (typeof filters)[number]

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<Filter>("All")
  const [search, setSearch] = useState("")
  const [needsCode, setNeedsCode] = useState(false)
  const [codeInput, setCodeInput] = useState("")
  const [codeError, setCodeError] = useState("")

  const loadCampaigns = () => {
    setLoading(true)
    setError("")
    getCampaigns("school-of-skill")
      .then((data) => {
        setCampaigns(data)
        setNeedsCode(false)
      })
      .catch((err) => {
        if (err.message.includes("Access code required")) {
          setNeedsCode(true)
        } else {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    const code = codeInput.trim()
    if (!code) return
    setAccessCode(code)
    setCodeInput("")
    setCodeError("")
    loadCampaigns()
  }

  const visible = campaigns.filter((c) => {
    if (filter === "All") return true
    if (filter === "Active") return c.status === "active" || c.status === "learning"
    if (filter === "Draft") return c.status === "draft" || c.status === "in_review"
    if (filter === "Completed") return c.status === "approved"
    return true
  }).filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))

  if (needsCode) return <AccessGate onSubmit={handleSignIn} codeInput={codeInput} setCodeInput={setCodeInput} error={codeError} />
  if (loading) return <Loader label="Loading campaigns…" />
  if (error) return <ErrorState message={error} onRetry={loadCampaigns} />

  return (
    <div className="ads-content">
      <div className="ads-page-header">
        <div className="ads-page-header-row">
          <div>
            <div className="eyebrow">School of Skill</div>
            <h1>Campaigns</h1>
            <p className="subtitle">Ads we're working on together.</p>
          </div>
          <div className="actions">
            <button className="ads-btn ads-btn-primary">
              <Plus size={20} strokeWidth={2} /> New campaign
            </button>
          </div>
        </div>
      </div>

      <div className="ads-filters">
        <div className="ads-tabs">
          {filters.map((f) => (
            <button key={f} className={`ads-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <input className="ads-search" placeholder="Search campaigns…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {visible.length === 0 ? (
        <div className="ads-empty">
          <h2>No campaigns yet.</h2>
          <p style={{ marginBottom: 20 }}>Create your first campaign to get started.</p>
          <button className="ads-btn ads-btn-primary"><Plus size={20} strokeWidth={2} /> New campaign</button>
        </div>
      ) : (
        <div className="ads-campaign-grid">
          {visible.map((c) => {
            const approvedAngles = c.angles.filter((a) => a.status === "approved").length
            const totalVariants = c.angles.length * 3
            const approvedVariants = c.angles.flatMap((a) => a.variants).filter((v) => v.approval_status === "approved").length
            return (
              <Link key={c.id} href={`/ads/campaign/?id=${encodeURIComponent(c.id)}`} className="ads-card">
                <div className="ads-card-media" style={{ background: c.cover_image ? `url(${c.cover_image}) center/cover` : "linear-gradient(135deg, #E9F3EE 0%, #F2F8DD 100%)" }} />
                <div className="ads-card-body">
                  <div className="ads-card-title">{c.name}</div>
                  <div className="ads-card-meta">{c.audience || "—"}</div>
                  <div className="ads-card-metrics">
                    <span><strong>{c.angles.length}</strong> angles</span>
                    <span><strong>{totalVariants}</strong> variants</span>
                    <span><strong>{approvedVariants}</strong> approved</span>
                  </div>
                  <div className="ads-card-footer">
                    <span className={`ads-status-pill ${statusClass(c.status as AdStatus)}`}>
                      <span className="dot" />
                      {statusLabel(c.status as AdStatus)}
                    </span>
                    <button className="ads-icon-btn" style={{ width: 36, height: 36 }} aria-label="More">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AccessGate({ onSubmit, codeInput, setCodeInput, error }: {
  onSubmit: (e: React.FormEvent) => void
  codeInput: string
  setCodeInput: (v: string) => void
  error: string
}) {
  return (
    <div className="ads-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 80px)" }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--ads-surface-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Lock size={24} strokeWidth={1.75} style={{ color: "var(--ads-green)" }} />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Sorted Ads</h1>
        <p style={{ fontSize: 16, color: "var(--ads-text-muted)", marginBottom: 28 }}>Enter your access code to open the campaign workspace.</p>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Access code"
            autoFocus
            style={{
              width: "100%", height: 48, padding: "0 16px", borderRadius: 12,
              border: "1px solid #DDE0DA", fontSize: 16, outline: "none",
              textAlign: "center", letterSpacing: "0.05em",
            }}
          />
          {error && <p style={{ color: "var(--ads-red)", fontSize: 14 }}>{error}</p>}
          <button type="submit" className="ads-btn ads-btn-primary" style={{ width: "100%" }}>
            Open workspace
          </button>
        </form>
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

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="ads-content">
      <div className="ads-empty">
        <h2>Couldn't load campaigns</h2>
        <p style={{ marginBottom: 20 }}>{message}</p>
        <button className="ads-btn ads-btn-secondary" onClick={onRetry}>Try again</button>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, MoreHorizontal } from "lucide-react"
import { getCampaigns, statusLabel, statusClass, type Campaign, type AdStatus } from "@/lib/ads"

const filters = ["All", "Active", "Draft", "Completed"] as const
type Filter = (typeof filters)[number]

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<Filter>("All")
  const [search, setSearch] = useState("")

  useEffect(() => {
    getCampaigns("school-of-skill")
      .then((data) => setCampaigns(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const visible = campaigns.filter((c) => {
    if (filter === "All") return true
    if (filter === "Active") return c.status === "active" || c.status === "learning"
    if (filter === "Draft") return c.status === "draft" || c.status === "in_review"
    if (filter === "Completed") return c.status === "approved"
    return true
  }).filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <Loader label="Loading campaigns…" />
  if (error) return <ErrorState message={error} />

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
            <button
              key={f}
              className={`ads-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          className="ads-search"
          placeholder="Search campaigns…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {visible.length === 0 ? (
        <div className="ads-empty">
          <h2>No campaigns yet.</h2>
          <p style={{ marginBottom: 20 }}>Create your first campaign to get started.</p>
          <button className="ads-btn ads-btn-primary">
            <Plus size={20} strokeWidth={2} /> New campaign
          </button>
        </div>
      ) : (
        <div className="ads-campaign-grid">
          {visible.map((c) => (
            <Link key={c.id} href={`/ads/${c.id}/`} className="ads-card">
              <div
                className="ads-card-media"
                style={{
                  background: c.cover_image
                    ? `url(${c.cover_image}) center/cover`
                    : "linear-gradient(135deg, #E9F3EE 0%, #F2F8DD 100%)",
                }}
              />
              <div className="ads-card-body">
                <div className="ads-card-title">{c.name}</div>
                <div className="ads-card-meta">{c.audience || "—"}</div>
                <div className="ads-card-metrics">
                  <span><strong>{c.angles.length || "—"}</strong> angles</span>
                  <span><strong>—</strong> variants</span>
                  <span><strong>—</strong> approved</span>
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
          ))}
        </div>
      )}
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
        <h2>Couldn't load campaigns</h2>
        <p>{message}</p>
      </div>
    </div>
  )
}

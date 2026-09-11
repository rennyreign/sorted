"use client"

import { useEffect, useState } from "react"
import { Upload, Search, X, Download, Copy, Trash2, Replace, Film, Image as ImageIcon, Filter } from "lucide-react"
import { getAssets as fetchAssets, type Asset } from "@/lib/ads"

const filterTabs = ["All assets", "Images", "Videos", "Deleted"] as const
type FilterTab = (typeof filterTabs)[number]

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tab, setTab] = useState<FilterTab>("All assets")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Asset | null>(null)

  useEffect(() => {
    fetchAssets("school-of-skill")
      .then((data) => setAssets(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const visible = assets.filter((a) => {
    if (tab === "Images") return a.media_type === "image"
    if (tab === "Videos") return a.media_type === "video"
    if (tab === "Deleted") return false
    return true
  }).filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <Loader label="Loading assets…" />
  if (error) return <div className="ads-content"><div className="ads-empty"><h2>Couldn't load assets</h2><p>{error}</p></div></div>

  return (
    <div className="ads-content">
      <div className="ads-page-header">
        <div className="ads-page-header-row">
          <div>
            <div className="eyebrow">School of Skill</div>
            <h1>Assets</h1>
            <p className="subtitle">Manage the creative used across your campaign.</p>
          </div>
          <div className="actions">
            <button className="ads-btn ads-btn-secondary">
              <Film size={18} strokeWidth={1.75} /> Generate with AI
            </button>
            <button className="ads-btn ads-btn-primary">
              <Upload size={18} strokeWidth={1.75} /> Upload assets
            </button>
          </div>
        </div>
      </div>

      <div className="ads-filters">
        <div className="ads-tabs">
          {filterTabs.map((f) => (
            <button key={f} className={`ads-tab ${tab === f ? "active" : ""}`} onClick={() => setTab(f)}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ads-icon-btn" style={{ width: 44, height: 44 }} aria-label="Filter">
            <Filter size={18} strokeWidth={1.75} />
          </button>
          <input className="ads-search" placeholder="Search assets…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {visible.length === 0 ? (
            <div className="ads-empty">
              <h2>No assets found</h2>
              <p>Upload images or videos to get started.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {visible.map((asset) => (
                <div
                  key={asset.id}
                  className="ads-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelected(asset)}
                >
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: "10px 10px 0 0",
                      background: asset.url ? `url(${asset.url}) center/cover` : "linear-gradient(135deg, #F6F7F3 0%, #E9F3EE 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {!asset.url && (asset.media_type === "video" ? (
                      <Film size={32} strokeWidth={1} style={{ color: "var(--ads-text-subtle)" }} />
                    ) : (
                      <ImageIcon size={32} strokeWidth={1} style={{ color: "var(--ads-text-subtle)" }} />
                    ))}
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ads-text-muted)" }}>{asset.aspect_ratio} · {asset.file_size}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inspector */}
        {selected && (
          <div style={{ width: 320, flexShrink: 0 }}>
            <div className="ads-rail-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--ads-border)" }}>
                <h3 style={{ margin: 0 }}>Asset details</h3>
                <button className="ads-icon-btn" style={{ width: 32, height: 32, border: "none" }} onClick={() => setSelected(null)}>
                  <X size={18} strokeWidth={1.75} />
                </button>
              </div>
              <div style={{ aspectRatio: "1", background: "linear-gradient(135deg, #F6F7F3 0%, #E9F3EE 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {selected.media_type === "video" ? <Film size={48} strokeWidth={1} style={{ color: "var(--ads-text-subtle)" }} /> : <ImageIcon size={48} strokeWidth={1} style={{ color: "var(--ads-text-subtle)" }} />}
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{selected.name}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--ads-text-muted)", marginBottom: 16 }}>
                  <div><strong style={{ color: "var(--ads-ink)" }}>Type:</strong> {selected.media_type}</div>
                  <div><strong style={{ color: "var(--ads-ink)" }}>Dimensions:</strong> {selected.width} × {selected.height}</div>
                  <div><strong style={{ color: "var(--ads-ink)" }}>Aspect ratio:</strong> {selected.aspect_ratio}</div>
                  <div><strong style={{ color: "var(--ads-ink)" }}>File size:</strong> {selected.file_size}</div>
                </div>
                {selected.usage.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Used in</div>
                    {selected.usage.map((u) => (
                      <div key={u} style={{ fontSize: 13, color: "var(--ads-text-muted)", marginBottom: 2 }}>{u}</div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="ads-btn ads-btn-secondary" style={{ height: 38, padding: "0 14px", fontSize: 14 }}>
                    <Replace size={16} strokeWidth={1.75} /> Replace
                  </button>
                  <button className="ads-btn ads-btn-secondary" style={{ height: 38, padding: "0 14px", fontSize: 14 }}>
                    <Download size={16} strokeWidth={1.75} /> Download
                  </button>
                  <button className="ads-btn ads-btn-secondary" style={{ height: 38, padding: "0 14px", fontSize: 14 }}>
                    <Copy size={16} strokeWidth={1.75} /> Duplicate
                  </button>
                  <button className="ads-btn ads-btn-ghost" style={{ height: 38, color: "var(--ads-red)" }}>
                    <Trash2 size={16} strokeWidth={1.75} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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

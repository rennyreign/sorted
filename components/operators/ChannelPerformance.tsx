"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Plus, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { OPERATOR_API_TOKEN } from "@/lib/operatorAuth"

type ChannelFunnelRow = {
  channel: string
  partner_name: string | null
  total: number
  outreached: number
  mockup_revealed: number
  build: number
  quote: number
  paid: number
}

type ContentPost = {
  id: number
  channel: string
  external_id: string | null
  url: string | null
  caption: string | null
  posted_at: string | null
  utm_content: string | null
  latest_views: number | null
  latest_likes: number | null
  latest_comments: number | null
  latest_shares: number | null
  latest_saves: number | null
  latest_captured_at: string | null
  leads_attributed: number
}

const CHANNEL_LABELS: Record<string, string> = {
  outreach: "Cold outreach",
  organic: "Organic / direct",
  partner: "Partners",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  unknown: "Unattributed",
}

function formatNumber(n: number | null): string {
  if (n === null || n === undefined) return "—"
  return n.toLocaleString()
}

function safeRate(num: number, den: number): string {
  if (den === 0) return "—"
  return `${Math.round((num / den) * 100)}%`
}

export default function ChannelPerformance() {
  const [funnel, setFunnel] = useState<ChannelFunnelRow[]>([])
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPost, setShowAddPost] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const [funnelRes, postsRes] = await Promise.all([
      supabase.rpc("operator_get_channel_funnel", { p_operator_token: OPERATOR_API_TOKEN }),
      supabase.rpc("operator_get_content_performance", { p_operator_token: OPERATOR_API_TOKEN }),
    ])
    if (funnelRes.data) setFunnel(funnelRes.data as ChannelFunnelRow[])
    if (postsRes.data) setPosts(postsRes.data as ContentPost[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addPost(form: {
    channel: string
    externalId: string
    url: string
    caption: string
    postedAt: string
  }) {
    setBusy(true)
    await supabase.rpc("operator_upsert_content_post", {
      p_operator_token: OPERATOR_API_TOKEN,
      p_channel: form.channel,
      p_external_id: form.externalId,
      p_url: form.url || null,
      p_caption: form.caption || null,
      p_posted_at: form.postedAt || null,
      p_utm_content: form.externalId,
    })
    await load()
    setBusy(false)
    setShowAddPost(false)
  }

  async function logMetric(postId: number, metrics: { views: number; likes: number; comments: number; shares: number; saves: number }) {
    setBusy(true)
    await supabase.rpc("operator_log_content_metric", {
      p_operator_token: OPERATOR_API_TOKEN,
      p_post_id: postId,
      p_views: metrics.views,
      p_likes: metrics.likes,
      p_comments: metrics.comments,
      p_shares: metrics.shares,
      p_saves: metrics.saves,
      p_source: "manual",
    })
    await load()
    setBusy(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-[#A3A3A3]" />
      </div>
    )
  }

  const maxTotal = Math.max(1, ...funnel.map((f) => f.total))

  return (
    <div className="space-y-10">
      {/* Channel funnel */}
      <section>
        <h3 className="font-sans font-bold text-[#0A0A0A] text-lg tracking-tight mb-4">Performance by channel</h3>
        <div className="bg-white border border-black/[0.08] rounded-2xl p-6 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left border-b border-black/[0.06]">
                <th className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3] pb-3 pr-4">Channel</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3] pb-3 pr-4 text-right">Total</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3] pb-3 pr-4 text-right">Mockup revealed</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3] pb-3 pr-4 text-right">Build</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3] pb-3 pr-4 text-right">Paid</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3] pb-3 text-right">Conv. rate</th>
              </tr>
            </thead>
            <tbody>
              {funnel.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#A3A3A3] text-sm">No attributed leads yet.</td>
                </tr>
              ) : (
                funnel.map((row) => (
                  <tr key={`${row.channel}-${row.partner_name ?? ""}`} className="border-b border-black/[0.04] last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-[#0A0A0A]">{CHANNEL_LABELS[row.channel] ?? row.channel}</p>
                      {row.partner_name && <p className="text-xs text-[#A3A3A3]">{row.partner_name}</p>}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-black/[0.06] rounded-full overflow-hidden hidden sm:block">
                          <div className="h-full bg-[#0A0A0A] rounded-full" style={{ width: `${(row.total / maxTotal) * 100}%` }} />
                        </div>
                        {formatNumber(row.total)}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums">{formatNumber(row.mockup_revealed)}</td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums">{formatNumber(row.build)}</td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums">{formatNumber(row.paid)}</td>
                    <td className="py-3 text-right font-mono tabular-nums font-bold">{safeRate(row.paid, row.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Content performance */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans font-bold text-[#0A0A0A] text-lg tracking-tight">Content performance</h3>
          <button
            onClick={() => setShowAddPost((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#0A0A0A] text-white px-3 py-1.5 rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            <Plus className="size-3.5" /> Log a post
          </button>
        </div>

        {showAddPost && (
          <AddPostForm onSubmit={addPost} onCancel={() => setShowAddPost(false)} busy={busy} />
        )}

        <div className="bg-white border border-black/[0.08] rounded-2xl divide-y divide-black/[0.06]">
          {posts.length === 0 ? (
            <p className="py-8 text-center text-[#A3A3A3] text-sm">
              No content logged yet. TikTok API sync isn&apos;t connected — log posts manually above until it is.
            </p>
          ) : (
            posts.map((post) => (
              <ContentPostRow key={post.id} post={post} onLogMetric={logMetric} busy={busy} />
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function AddPostForm({
  onSubmit,
  onCancel,
  busy,
}: {
  onSubmit: (form: { channel: string; externalId: string; url: string; caption: string; postedAt: string }) => void
  onCancel: () => void
  busy: boolean
}) {
  const [channel, setChannel] = useState("tiktok")
  const [externalId, setExternalId] = useState("")
  const [url, setUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [postedAt, setPostedAt] = useState(() => new Date().toISOString().slice(0, 10))

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl p-5 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="h-10 rounded-lg border border-black/[0.12] px-3 text-sm bg-white"
        >
          <option value="tiktok">TikTok</option>
          <option value="linkedin">LinkedIn</option>
          <option value="youtube">YouTube</option>
        </select>
        <input
          className="h-10 rounded-lg border border-black/[0.12] px-3 text-sm"
          placeholder="Video/post ID (used in your utm_content link)"
          value={externalId}
          onChange={(e) => setExternalId(e.target.value)}
        />
        <input
          className="h-10 rounded-lg border border-black/[0.12] px-3 text-sm sm:col-span-2"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          className="h-10 rounded-lg border border-black/[0.12] px-3 text-sm sm:col-span-2"
          placeholder="Caption / title"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <input
          type="date"
          className="h-10 rounded-lg border border-black/[0.12] px-3 text-sm"
          value={postedAt}
          onChange={(e) => setPostedAt(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSubmit({ channel, externalId, url, caption, postedAt })}
          disabled={!externalId || busy}
          className="text-xs font-medium bg-[#0A0A0A] text-white px-4 py-2 rounded-lg disabled:opacity-40"
        >
          Save post
        </button>
        <button onClick={onCancel} className="text-xs font-medium text-[#525252] px-4 py-2 rounded-lg hover:bg-black/[0.04]">
          Cancel
        </button>
      </div>
    </div>
  )
}

function ContentPostRow({
  post,
  onLogMetric,
  busy,
}: {
  post: ContentPost
  onLogMetric: (postId: number, metrics: { views: number; likes: number; comments: number; shares: number; saves: number }) => void
  busy: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [views, setViews] = useState(String(post.latest_views ?? 0))
  const [likes, setLikes] = useState(String(post.latest_likes ?? 0))
  const [comments, setComments] = useState(String(post.latest_comments ?? 0))
  const [shares, setShares] = useState(String(post.latest_shares ?? 0))
  const [saves, setSaves] = useState(String(post.latest_saves ?? 0))

  function save() {
    onLogMetric(post.id, {
      views: parseInt(views, 10) || 0,
      likes: parseInt(likes, 10) || 0,
      comments: parseInt(comments, 10) || 0,
      shares: parseInt(shares, 10) || 0,
      saves: parseInt(saves, 10) || 0,
    })
    setEditing(false)
  }

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#A3A3A3]">{CHANNEL_LABELS[post.channel] ?? post.channel}</span>
            {post.posted_at && <span className="text-[10px] text-[#C4C4C4]">{new Date(post.posted_at).toLocaleDateString("en-GB")}</span>}
          </div>
          <p className="font-medium text-[#0A0A0A] text-sm truncate max-w-md">{post.caption || post.external_id}</p>
          {post.url && (
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#A3A3A3] hover:text-[#0A0A0A] truncate block max-w-md">
              {post.url}
            </a>
          )}
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className="text-xs font-medium text-[#525252] px-3 py-1.5 rounded-lg border border-black/[0.08] hover:bg-black/[0.04] shrink-0"
        >
          {editing ? "Close" : "Log metrics"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-5 flex-wrap">
        <Metric label="Views" value={post.latest_views} />
        <Metric label="Likes" value={post.latest_likes} />
        <Metric label="Comments" value={post.latest_comments} />
        <Metric label="Shares" value={post.latest_shares} />
        <Metric label="Saves" value={post.latest_saves} />
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <TrendingUp className="size-3.5" /> {post.leads_attributed} lead{post.leads_attributed === 1 ? "" : "s"}
        </span>
      </div>

      {editing && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
          <NumField label="Views" value={views} onChange={setViews} />
          <NumField label="Likes" value={likes} onChange={setLikes} />
          <NumField label="Comments" value={comments} onChange={setComments} />
          <NumField label="Shares" value={shares} onChange={setShares} />
          <NumField label="Saves" value={saves} onChange={setSaves} />
          <button
            onClick={save}
            disabled={busy}
            className="col-span-2 sm:col-span-5 mt-1 text-xs font-medium bg-[#0A0A0A] text-white px-4 py-2 rounded-lg disabled:opacity-40"
          >
            Save snapshot
          </button>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#A3A3A3]">{label}</p>
      <p className="font-mono text-sm font-bold tabular-nums text-[#0A0A0A]">{formatNumber(value)}</p>
    </div>
  )
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#A3A3A3]">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-9 w-full rounded-lg border border-black/[0.12] px-2 text-sm"
      />
    </label>
  )
}

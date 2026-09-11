"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Check, MessageSquare, ChevronLeft, ChevronRight, Lock } from "lucide-react"
import { getAccessCode, setAccessCode, getCampaigns, type Campaign, type Angle, type CopyVariant } from "@/lib/ads"

type ReviewAd = {
  id: string
  angle: string
  variant: string
  primary_text: string
  headline: string
  description: string
  cta: string
  creative_url: string
  creative_alt: string
  status: "pending" | "approved" | "changes_requested"
  comment: string
  fingerprint: string
  campaign_id: string
  campaign_revision: number
}

export default function ClientReviewPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FBFBF7" }}><p style={{ color: "#646763" }}>Loading…</p></div>}>
      <ClientReviewContent />
    </Suspense>
  )
}

function ClientReviewContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("t") || ""
  const campaignId = searchParams.get("campaign") || ""
  const [ads, setAds] = useState<ReviewAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [needsCode, setNeedsCode] = useState(false)
  const [codeInput, setCodeInput] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showComment, setShowComment] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")
  const [campaignName, setCampaignName] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [campaignRevision, setCampaignRevision] = useState(0)

  const loadData = () => {
    setLoading(true)
    setError("")
    getCampaigns("school-of-skill")
      .then((campaigns) => {
        const campaign = campaigns.find((c) => c.id === campaignId) || campaigns[0]
        if (!campaign) throw new Error("Campaign not found")
        setCampaignName(campaign.name)
        setCampaignRevision(campaign.revision)

        const reviewAds: ReviewAd[] = []
        for (const angle of campaign.angles) {
          for (const variant of angle.variants) {
            if (variant.primary_text) {
              reviewAds.push({
                id: variant.id,
                angle: angle.name,
                variant: variant.type.charAt(0).toUpperCase() + variant.type.slice(1),
                primary_text: variant.primary_text,
                headline: variant.headline,
                description: variant.description,
                cta: variant.cta,
                creative_url: variant.creative_url || angle.shared_creative_url,
                creative_alt: variant.creative_alt || angle.shared_creative_alt,
                status: variant.approval_status === "approved" ? "approved" : "pending",
                comment: "",
                fingerprint: variant.fingerprint,
                campaign_id: campaign.id,
                campaign_revision: campaign.revision,
              })
            }
          }
        }
        setAds(reviewAds)
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
    setIsMobile(window.innerWidth < 768)
    loadData()
  }, [])

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    const code = codeInput.trim()
    if (!code) return
    setAccessCode(code)
    setCodeInput("")
    loadData()
  }

  if (needsCode) return <ReviewAccessGate onSubmit={handleSignIn} codeInput={codeInput} setCodeInput={setCodeInput} />
  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FBFBF7" }}><p style={{ color: "#646763" }}>Loading review…</p></div>
  if (error) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FBFBF7" }}><p style={{ color: "#646763" }}>{error}</p></div>

  const approvedCount = ads.filter((a) => a.status === "approved").length

  const approve = (id: string) => setAds((prev) => prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a)))
  const requestChange = (id: string) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, status: "changes_requested", comment: commentText || a.comment } : a)))
    setShowComment(null)
    setCommentText("")
  }
  const approveAll = () => setAds((prev) => prev.map((a) => ({ ...a, status: "approved" })))

  return (
    <div style={{ minHeight: "100vh", background: "#FBFBF7", fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif", color: "#0B0B0A" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid #E3E5DF", background: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.045em" }}>Sorted<span style={{ color: "#B7E315" }}>.</span></span>
          <span style={{ color: "#646763", fontSize: 14 }}>{campaignName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, color: "#646763" }}>{approvedCount} of {ads.length} approved</span>
          <button onClick={approveAll} style={{ padding: "8px 16px", borderRadius: 14, border: "1px solid #E3E5DF", background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Approve all</button>
        </div>
      </header>

      <div style={{ maxWidth: 1240, padding: "32px 32px 48px", margin: "0 auto" }}>
        {isMobile ? (
          <MobileReview ads={ads} currentIndex={currentIndex} onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))} onNext={() => setCurrentIndex((i) => Math.min(ads.length - 1, i + 1))} onApprove={approve} onRequestChange={(id: string) => setShowComment(id)} showComment={showComment} commentText={commentText} setCommentText={setCommentText} onSubmitComment={requestChange} onCancelComment={() => { setShowComment(null); setCommentText("") }} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {ads.map((ad) => (
              <ReviewCard key={ad.id} ad={ad} onApprove={() => approve(ad.id)} onRequestChange={() => setShowComment(ad.id)} showComment={showComment === ad.id} commentText={commentText} setCommentText={setCommentText} onSubmitComment={() => requestChange(ad.id)} onCancelComment={() => { setShowComment(null); setCommentText("") }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewCard({ ad, onApprove, onRequestChange, showComment, commentText, setCommentText, onSubmitComment, onCancelComment }: any) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E3E5DF", borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      {ad.status !== "pending" && (
        <div style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: ad.status === "approved" ? "#EAF7F0" : "#FFF4CE", color: ad.status === "approved" ? "#1B6B48" : "#8A6A25", display: "flex", alignItems: "center", gap: 6 }}>
          {ad.status === "approved" ? <Check size={14} /> : <MessageSquare size={14} />}
          {ad.status === "approved" ? "Approved" : "Changes requested"}
        </div>
      )}
      <div style={{ padding: "16px 20px 0", fontSize: 13, fontWeight: 600, color: "#003E32", textTransform: "uppercase", letterSpacing: "0.05em" }}>{ad.angle} · {ad.variant}</div>
      <div style={{ padding: "8px 20px 16px", fontSize: 15, lineHeight: 1.5 }}>{ad.primary_text}</div>
      <div style={{ width: "100%", aspectRatio: "1", background: ad.creative_url ? `url(${ad.creative_url}) center/cover` : "linear-gradient(135deg, #E9F3EE 0%, #F2F8DD 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!ad.creative_url && <span style={{ color: "#8A8D88", fontSize: 14 }}>Creative preview</span>}
      </div>
      <div style={{ padding: "16px 20px", background: "#F6F7F3", borderBottom: "1px solid #E3E5DF" }}>
        <div style={{ fontSize: 12, color: "#646763", textTransform: "uppercase" }}>schoolofskill.co.uk</div>
        <div style={{ fontSize: 16, fontWeight: 700, margin: "4px 0" }}>{ad.headline}</div>
        <div style={{ fontSize: 13, color: "#646763" }}>{ad.description}</div>
        <div style={{ display: "inline-block", marginTop: 10, padding: "6px 12px", background: "#E2E4E7", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{ad.cta}</div>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", gap: 8 }}>
        <button onClick={onApprove} disabled={ad.status === "approved"} style={{ flex: 1, height: 42, borderRadius: 14, border: "none", background: ad.status === "approved" ? "#EAF7F0" : "#003E32", color: ad.status === "approved" ? "#1B6B48" : "white", fontSize: 14, fontWeight: 600, cursor: ad.status === "approved" ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Check size={16} /> {ad.status === "approved" ? "Approved" : "Approve"}
        </button>
        <button onClick={onRequestChange} style={{ flex: 1, height: 42, borderRadius: 14, border: "1px solid #E3E5DF", background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <MessageSquare size={16} /> Request change
        </button>
      </div>
      {showComment && (
        <div style={{ padding: "0 20px 20px" }}>
          <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="What would you like changed?" style={{ width: "100%", minHeight: 80, padding: 10, borderRadius: 10, border: "1px solid #DDE0DA", fontSize: 14, fontFamily: "inherit", resize: "vertical" }} autoFocus />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={onSubmitComment} style={{ padding: "8px 16px", borderRadius: 14, border: "none", background: "#003E32", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Submit</button>
            <button onClick={onCancelComment} style={{ padding: "8px 16px", borderRadius: 14, border: "1px solid #E3E5DF", background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
      {ad.comment && ad.status === "changes_requested" && !showComment && (
        <div style={{ padding: "0 20px 20px", fontSize: 14, color: "#646763" }}><strong>Your comment:</strong> {ad.comment}</div>
      )}
    </div>
  )
}

function MobileReview({ ads, currentIndex, onPrev, onNext, onApprove, onRequestChange, showComment, commentText, setCommentText, onSubmitComment, onCancelComment }: any) {
  const ad = ads[currentIndex]
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onPrev} disabled={currentIndex === 0} style={{ width: 44, height: 44, borderRadius: 14, border: "1px solid #E3E5DF", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentIndex === 0 ? 0.4 : 1 }}><ChevronLeft size={20} /></button>
        <span style={{ fontSize: 14, color: "#646763" }}>{currentIndex + 1} of {ads.length}</span>
        <button onClick={onNext} disabled={currentIndex === ads.length - 1} style={{ width: 44, height: 44, borderRadius: 14, border: "1px solid #E3E5DF", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentIndex === ads.length - 1 ? 0.4 : 1 }}><ChevronRight size={20} /></button>
      </div>
      <ReviewCard ad={ad} onApprove={onApprove} onRequestChange={onRequestChange} showComment={showComment === ad.id} commentText={commentText} setCommentText={setCommentText} onSubmitComment={onSubmitComment} onCancelComment={onCancelComment} />
    </div>
  )
}

function ReviewAccessGate({ onSubmit, codeInput, setCodeInput }: {
  onSubmit: (e: React.FormEvent) => void
  codeInput: string
  setCodeInput: (v: string) => void
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#FBFBF7", fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F0F2ED", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Lock size={24} strokeWidth={1.75} style={{ color: "#003E32" }} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Sorted Ads</h1>
        <p style={{ fontSize: 16, color: "#646763", marginBottom: 28 }}>Enter your review access code to see the campaign.</p>
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
          <button type="submit" style={{ width: "100%", height: 48, borderRadius: 12, border: "none", background: "#003E32", color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
            Open review
          </button>
        </form>
      </div>
    </div>
  )
}

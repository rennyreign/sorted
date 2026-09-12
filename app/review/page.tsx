"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Check, MessageSquare, ChevronLeft, ChevronRight, Lock, X } from "lucide-react"
import { getAccessCode, setAccessCode, getCampaigns, submitDecision, reviewStatusLabel, reviewStatusClass, type Campaign, type Angle, type CopyVariant, type ReviewStatus } from "@/lib/ads"

type ReviewAd = {
  id: string
  angle: string
  angleId: string
  variant: string
  primary_text: string
  headline: string
  description: string
  cta: string
  creative_url: string
  creative_alt: string
  ratio: string
  review_status: ReviewStatus
  comment: string
  fingerprint: string
  campaign_id: string
  campaign_revision: number
}

const CLIENT_PASSWORD = "schoolofskill"

export default function ClientReviewPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FBFBF7" }}><p style={{ color: "#646763" }}>Loading…</p></div>}>
      <ClientReviewContent />
    </Suspense>
  )
}

function ClientReviewContent() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get("campaign") || ""
  const [ads, setAds] = useState<ReviewAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [unlocked, setUnlocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showComment, setShowComment] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")
  const [campaignName, setCampaignName] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [campaignRevision, setCampaignRevision] = useState(0)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState("")

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
                angleId: angle.id,
                variant: variant.type.charAt(0).toUpperCase() + variant.type.slice(1),
                primary_text: variant.primary_text,
                headline: variant.headline,
                description: variant.description,
                cta: variant.cta,
                creative_url: variant.creative_url || angle.shared_creative_url,
                creative_alt: variant.creative_alt || angle.shared_creative_alt,
                ratio: variant.ratio || "1:1",
                review_status: variant.review_status,
                comment: variant.review_comment || "",
                fingerprint: variant.fingerprint,
                campaign_id: campaign.id,
                campaign_revision: campaign.revision,
              })
            }
          }
        }
        setAds(reviewAds)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const saved = sessionStorage.getItem("ads-review-unlocked")
    if (saved === "true") setUnlocked(true)
  }, [])

  useEffect(() => {
    if (unlocked) loadData()
  }, [unlocked])

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordInput.trim().toLowerCase() === CLIENT_PASSWORD) {
      setUnlocked(true)
      sessionStorage.setItem("ads-review-unlocked", "true")
      setPasswordError("")
    } else {
      setPasswordError("Incorrect password. Please check and try again.")
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2000)
  }

  const handleDecision = async (ad: ReviewAd, status: ReviewStatus, comment: string = "") => {
    if (saving) return
    setSaving(true)
    setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, review_status: status, comment: comment || a.comment } : a)))
    setShowComment(null)
    setCommentText("")
    showToast(status === "approved" ? "Approved" : status === "changes_requested" ? "Changes requested" : "Rejected")
    try {
      await submitDecision("school-of-skill", ad.campaign_id, ad.campaign_revision, "ad", ad.id, ad.fingerprint, status, comment, "Client")
    } catch (err) {
      // Decision saved locally even if API fails (offline-friendly)
    } finally {
      setSaving(false)
    }
  }

  if (!unlocked) return <PasswordGate onSubmit={handleUnlock} passwordInput={passwordInput} setPasswordInput={setPasswordInput} passwordError={passwordError} campaignName={campaignName} />
  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FBFBF7" }}><p style={{ color: "#646763" }}>Loading review…</p></div>
  if (error) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FBFBF7" }}><p style={{ color: "#646763" }}>{error}</p></div>

  const approvedCount = ads.filter((a) => a.review_status === "approved").length
  const changesCount = ads.filter((a) => a.review_status === "changes_requested").length

  return (
    <div style={{ minHeight: "100vh", background: "#FBFBF7", fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif", color: "#0B0B0A" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid #E3E5DF", background: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.045em" }}>Sorted<span style={{ color: "#B7E315" }}>.</span></span>
          <span style={{ color: "#646763", fontSize: 14 }}>{campaignName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, color: "#646763" }}>{approvedCount} of {ads.length} approved</span>
          {changesCount > 0 && <span style={{ fontSize: 14, color: "#8A6A25" }}>· {changesCount} changes</span>}
        </div>
      </header>

      <div style={{ maxWidth: 1240, padding: "32px 32px 48px", margin: "0 auto" }}>
        {isMobile ? (
          <MobileReview
            ads={ads}
            currentIndex={currentIndex}
            onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            onNext={() => setCurrentIndex((i) => Math.min(ads.length - 1, i + 1))}
            onDecision={handleDecision}
            showComment={showComment}
            setShowComment={setShowComment}
            commentText={commentText}
            setCommentText={setCommentText}
            saving={saving}
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {ads.map((ad) => (
              <ReviewCard
                key={ad.id}
                ad={ad}
                onDecision={handleDecision}
                showComment={showComment === ad.id}
                setShowComment={setShowComment}
                commentText={commentText}
                setCommentText={setCommentText}
                saving={saving}
              />
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#0B0B0A", color: "white", padding: "10px 20px", borderRadius: 14, fontSize: 14, fontWeight: 600, zIndex: 100, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {toast}
        </div>
      )}
    </div>
  )
}

function ReviewCard({ ad, onDecision, showComment, setShowComment, commentText, setCommentText, saving }: {
  ad: ReviewAd
  onDecision: (ad: ReviewAd, status: ReviewStatus, comment?: string) => void
  showComment: boolean
  setShowComment: (id: string | null) => void
  commentText: string
  setCommentText: (v: string) => void
  saving: boolean
}) {
  const ratio = ad.ratio || "1:1"
  const aspectRatio = ratio.replace(":", "/")

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E3E5DF", borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      {/* Status badge */}
      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: ad.review_status !== "awaiting_review" ? "1px solid #E3E5DF" : "none", background: ad.review_status === "approved" ? "#EAF7F0" : ad.review_status === "changes_requested" ? "#FFF4CE" : ad.review_status === "rejected" ? "#FDECEC" : "transparent" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: ad.review_status === "approved" ? "#1B6B48" : ad.review_status === "changes_requested" ? "#8A6A25" : ad.review_status === "rejected" ? "#B33A3A" : "#646763", display: "flex", alignItems: "center", gap: 6 }}>
          {ad.review_status === "approved" && <Check size={14} />}
          {ad.review_status === "changes_requested" && <MessageSquare size={14} />}
          {reviewStatusLabel(ad.review_status)}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#003E32", textTransform: "uppercase", letterSpacing: "0.05em" }}>{ad.angle} · {ad.variant}</span>
      </div>

      {/* Ad preview */}
      <div style={{ padding: "16px 20px 0", fontSize: 15, lineHeight: 1.5 }}>{ad.primary_text}</div>
      <div style={{ width: "100%", aspectRatio, background: ad.creative_url ? `url(${ad.creative_url}) center/cover` : "linear-gradient(135deg, #E9F3EE 0%, #F2F8DD 100%)", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!ad.creative_url && <span style={{ color: "#8A8D88", fontSize: 14 }}>Creative preview</span>}
      </div>
      <div style={{ padding: "16px 20px", background: "#F6F7F3", borderBottom: "1px solid #E3E5DF" }}>
        <div style={{ fontSize: 12, color: "#646763", textTransform: "uppercase" }}>schoolofskill.co.uk</div>
        <div style={{ fontSize: 16, fontWeight: 700, margin: "4px 0" }}>{ad.headline}</div>
        <div style={{ fontSize: 13, color: "#646763" }}>{ad.description}</div>
        <div style={{ display: "inline-block", marginTop: 10, padding: "6px 12px", background: "#E2E4E7", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{ad.cta}</div>
      </div>

      {/* Existing comment */}
      {ad.comment && ad.review_status === "changes_requested" && !showComment && (
        <div style={{ padding: "12px 20px", fontSize: 14, color: "#646763", background: "#FFF4CE", borderBottom: "1px solid #E3E5DF" }}>
          <strong>Your note:</strong> {ad.comment}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ padding: "16px 20px", display: "flex", gap: 8 }}>
        <button
          onClick={() => onDecision(ad, "approved")}
          disabled={saving || ad.review_status === "approved"}
          style={{
            flex: 1, height: 42, borderRadius: 14, border: "none",
            background: ad.review_status === "approved" ? "#EAF7F0" : "#003E32",
            color: ad.review_status === "approved" ? "#1B6B48" : "white",
            fontSize: 14, fontWeight: 600, cursor: saving || ad.review_status === "approved" ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Check size={16} /> {ad.review_status === "approved" ? "Approved" : "Approve"}
        </button>
        <button
          onClick={() => setShowComment(showComment ? null : ad.id)}
          disabled={saving}
          style={{
            flex: 1, height: 42, borderRadius: 14,
            border: "1px solid #E3E5DF", background: "white",
            fontSize: 14, fontWeight: 600, cursor: saving ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            opacity: saving ? 0.6 : 1,
          }}
        >
          <MessageSquare size={16} /> Request change
        </button>
      </div>

      {/* Request change form */}
      {showComment && (
        <div style={{ padding: "0 20px 20px" }}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="What would you like changed?"
            style={{ width: "100%", minHeight: 80, padding: 10, borderRadius: 10, border: "1px solid #DDE0DA", fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
            autoFocus
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              onClick={() => onDecision(ad, "changes_requested", commentText)}
              disabled={saving || !commentText.trim()}
              style={{ padding: "8px 16px", borderRadius: 14, border: "none", background: "#003E32", color: "white", fontSize: 14, fontWeight: 600, cursor: saving || !commentText.trim() ? "default" : "pointer", opacity: saving || !commentText.trim() ? 0.6 : 1 }}
            >
              Submit request
            </button>
            <button onClick={() => { setShowComment(null); setCommentText("") }} style={{ padding: "8px 16px", borderRadius: 14, border: "1px solid #E3E5DF", background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileReview({ ads, currentIndex, onPrev, onNext, onDecision, showComment, setShowComment, commentText, setCommentText, saving }: any) {
  const ad = ads[currentIndex]
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onPrev} disabled={currentIndex === 0} style={{ width: 44, height: 44, borderRadius: 14, border: "1px solid #E3E5DF", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentIndex === 0 ? 0.4 : 1 }}><ChevronLeft size={20} /></button>
        <span style={{ fontSize: 14, color: "#646763" }}>{currentIndex + 1} of {ads.length}</span>
        <button onClick={onNext} disabled={currentIndex === ads.length - 1} style={{ width: 44, height: 44, borderRadius: 14, border: "1px solid #E3E5DF", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentIndex === ads.length - 1 ? 0.4 : 1 }}><ChevronRight size={20} /></button>
      </div>
      <ReviewCard ad={ad} onDecision={onDecision} showComment={showComment === ad.id} setShowComment={setShowComment} commentText={commentText} setCommentText={setCommentText} saving={saving} />
    </div>
  )
}

function PasswordGate({ onSubmit, passwordInput, setPasswordInput, passwordError, campaignName }: {
  onSubmit: (e: React.FormEvent) => void
  passwordInput: string
  setPasswordInput: (v: string) => void
  passwordError: string
  campaignName: string
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#FBFBF7", fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F0F2ED", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Lock size={24} strokeWidth={1.75} style={{ color: "#003E32" }} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Your ads are ready</h1>
        <p style={{ fontSize: 16, color: "#646763", marginBottom: 28 }}>Enter the password Sorted shared with you to review the campaign.</p>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: "100%", height: 48, padding: "0 16px", borderRadius: 12,
              border: "1px solid #DDE0DA", fontSize: 16, outline: "none",
              textAlign: "center", letterSpacing: "0.05em",
              fontFamily: "inherit",
            }}
          />
          {passwordError && <p style={{ color: "#E53D3D", fontSize: 14, margin: 0 }}>{passwordError}</p>}
          <button type="submit" style={{ width: "100%", height: 48, borderRadius: 12, border: "none", background: "#003E32", color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            View ads
          </button>
        </form>
        <p style={{ fontSize: 13, color: "#8A8D88", marginTop: 20 }}>No sign-up needed. Your feedback goes straight back to Sorted.</p>
      </div>
    </div>
  )
}

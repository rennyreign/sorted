"use client"

import { useEffect, useState } from "react"
import { Check, MessageSquare, ChevronLeft, ChevronRight, X } from "lucide-react"

type ReviewAd = {
  id: string
  angle: string
  variant: string
  primary_text: string
  headline: string
  description: string
  cta: string
  creative_url: string
  status: "pending" | "approved" | "changes_requested"
  comment: string
}

export default function ClientReviewPage({ params }: { params: { shareToken: string } }) {
  const [ads, setAds] = useState<ReviewAd[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showComment, setShowComment] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")
  const [campaignName, setCampaignName] = useState("")

  useEffect(() => {
    // Placeholder — will be wired to share token lookup
    setCampaignName("Youth Camp | Parents")
    setAds([
      { id: "1", angle: "Recognition", variant: "Short", primary_text: "Your child already has the instinct. We just sharpen it.", headline: "Seen the potential?", description: "Book a camp place today.", cta: "Learn more", creative_url: "", status: "pending", comment: "" },
      { id: "2", angle: "Recognition", variant: "Medium", primary_text: "They've been working on their game all year. Now they need the right room to grow in.", headline: "Ready for the next level?", description: "September camp. Limited places.", cta: "Sign up", creative_url: "", status: "pending", comment: "" },
      { id: "3", angle: "Recognition", variant: "Long", primary_text: "Last year, 40 players walked into our camp with potential. They left with a plan, a network, and the kind of coaching that changes how they see the game.", headline: "Where potential meets opportunity", description: "Register for September camp.", cta: "Register now", creative_url: "", status: "pending", comment: "" },
      { id: "4", angle: "Belief shift", variant: "Short", primary_text: "Talent gets noticed. Belief gets you in the room.", headline: "Do they believe yet?", description: "Camp starts September.", cta: "Learn more", creative_url: "", status: "pending", comment: "" },
      { id: "5", angle: "Belief shift", variant: "Medium", primary_text: "We don't just train players. We build the belief that gets them into rooms they didn't think were for them.", headline: "Belief is the skill", description: "Book a place at camp.", cta: "Sign up", creative_url: "", status: "pending", comment: "" },
      { id: "6", angle: "Last year", variant: "Long", primary_text: "Last year, they went to UCLA. This year, it could be your child. The path starts at camp.", headline: "Where could they go next?", description: "September camp. Register today.", cta: "Register now", creative_url: "", status: "pending", comment: "" },
    ])
    setLoading(false)
  }, [])

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FBFBF7" }}><p style={{ color: "#646763" }}>Loading review…</p></div>

  const approvedCount = ads.filter((a) => a.status === "approved").length
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  const approve = (id: string) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a)))
  }

  const requestChange = (id: string) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, status: "changes_requested", comment: commentText || a.comment } : a)))
    setShowComment(null)
    setCommentText("")
  }

  const approveAll = () => {
    setAds((prev) => prev.map((a) => ({ ...a, status: "approved" })))
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FBFBF7", fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif", color: "#0B0B0A" }}>
      {/* Header — no sidebar, no internal nav */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px", borderBottom: "1px solid #E3E5DF", background: "#FFFFFF",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.045em" }}>Sorted<span style={{ color: "#B7E315" }}>.</span></span>
          <span style={{ color: "#646763", fontSize: 14 }}>{campaignName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, color: "#646763" }}>{approvedCount} of {ads.length} approved</span>
          <button onClick={approveAll} style={{
            padding: "8px 16px", borderRadius: 14, border: "1px solid #E3E5DF",
            background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Approve all</button>
        </div>
      </header>

      {/* Review grid */}
      <div style={{ maxWidth: 1240, padding: "32px 32px 48px", margin: "0 auto" }}>
        {isMobile ? (
          /* Mobile: one card at a time with prev/next */
          <MobileReview
            ads={ads}
            currentIndex={currentIndex}
            onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            onNext={() => setCurrentIndex((i) => Math.min(ads.length - 1, i + 1))}
            onApprove={approve}
            onRequestChange={(id) => setShowComment(id)}
            showComment={showComment}
            commentText={commentText}
            setCommentText={setCommentText}
            onSubmitComment={requestChange}
            onCancelComment={() => { setShowComment(null); setCommentText("") }}
          />
        ) : (
          /* Desktop: 3-column grid */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {ads.map((ad) => (
              <ReviewCard
                key={ad.id}
                ad={ad}
                onApprove={() => approve(ad.id)}
                onRequestChange={() => setShowComment(ad.id)}
                showComment={showComment === ad.id}
                commentText={commentText}
                setCommentText={setCommentText}
                onSubmitComment={() => requestChange(ad.id)}
                onCancelComment={() => { setShowComment(null); setCommentText("") }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewCard({ ad, onApprove, onRequestChange, showComment, commentText, setCommentText, onSubmitComment, onCancelComment }: {
  ad: ReviewAd
  onApprove: () => void
  onRequestChange: () => void
  showComment: boolean
  commentText: string
  setCommentText: (v: string) => void
  onSubmitComment: () => void
  onCancelComment: () => void
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E3E5DF",
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      {/* Status bar */}
      {ad.status !== "pending" && (
        <div style={{
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 600,
          background: ad.status === "approved" ? "#EAF7F0" : "#FFF4CE",
          color: ad.status === "approved" ? "#1B6B48" : "#8A6A25",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          {ad.status === "approved" ? <Check size={14} /> : <MessageSquare size={14} />}
          {ad.status === "approved" ? "Approved" : "Changes requested"}
        </div>
      )}

      {/* Angle / variant label */}
      <div style={{ padding: "16px 20px 0", fontSize: 13, fontWeight: 600, color: "#003E32", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {ad.angle} · {ad.variant}
      </div>

      {/* Primary copy */}
      <div style={{ padding: "8px 20px 16px", fontSize: 15, lineHeight: 1.5 }}>
        {ad.primary_text}
      </div>

      {/* Creative */}
      <div style={{
        width: "100%",
        aspectRatio: "1",
        background: "linear-gradient(135deg, #E9F3EE 0%, #F2F8DD 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span style={{ color: "#8A8D88", fontSize: 14 }}>Creative preview</span>
      </div>

      {/* Headline / description / CTA */}
      <div style={{ padding: "16px 20px", background: "#F6F7F3", borderBottom: "1px solid #E3E5DF" }}>
        <div style={{ fontSize: 12, color: "#646763", textTransform: "uppercase" }}>schoolofskill.co.uk</div>
        <div style={{ fontSize: 16, fontWeight: 700, margin: "4px 0" }}>{ad.headline}</div>
        <div style={{ fontSize: 13, color: "#646763" }}>{ad.description}</div>
        <div style={{
          display: "inline-block",
          marginTop: 10,
          padding: "6px 12px",
          background: "#E2E4E7",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
        }}>{ad.cta}</div>
      </div>

      {/* Actions */}
      <div style={{ padding: "16px 20px", display: "flex", gap: 8 }}>
        <button
          onClick={onApprove}
          disabled={ad.status === "approved"}
          style={{
            flex: 1, height: 42, borderRadius: 14, border: "none",
            background: ad.status === "approved" ? "#EAF7F0" : "#003E32",
            color: ad.status === "approved" ? "#1B6B48" : "white",
            fontSize: 14, fontWeight: 600, cursor: ad.status === "approved" ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Check size={16} /> {ad.status === "approved" ? "Approved" : "Approve"}
        </button>
        <button
          onClick={onRequestChange}
          style={{
            flex: 1, height: 42, borderRadius: 14, border: "1px solid #E3E5DF",
            background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <MessageSquare size={16} /> Request change
        </button>
      </div>

      {/* Comment form */}
      {showComment && (
        <div style={{ padding: "0 20px 20px" }}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="What would you like changed?"
            style={{
              width: "100%", minHeight: 80, padding: 10, borderRadius: 10,
              border: "1px solid #DDE0DA", fontSize: 14, fontFamily: "inherit", resize: "vertical",
            }}
            autoFocus
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={onSubmitComment} style={{
              padding: "8px 16px", borderRadius: 14, border: "none",
              background: "#003E32", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>Submit</button>
            <button onClick={onCancelComment} style={{
              padding: "8px 16px", borderRadius: 14, border: "1px solid #E3E5DF",
              background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Existing comment */}
      {ad.comment && ad.status === "changes_requested" && !showComment && (
        <div style={{ padding: "0 20px 20px", fontSize: 14, color: "#646763" }}>
          <strong>Your comment:</strong> {ad.comment}
        </div>
      )}
    </div>
  )
}

function MobileReview({ ads, currentIndex, onPrev, onNext, onApprove, onRequestChange, showComment, commentText, setCommentText, onSubmitComment, onCancelComment }: any) {
  const ad = ads[currentIndex]
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onPrev} disabled={currentIndex === 0} style={{
          width: 44, height: 44, borderRadius: 14, border: "1px solid #E3E5DF",
          background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          opacity: currentIndex === 0 ? 0.4 : 1,
        }}>
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontSize: 14, color: "#646763" }}>{currentIndex + 1} of {ads.length}</span>
        <button onClick={onNext} disabled={currentIndex === ads.length - 1} style={{
          width: 44, height: 44, borderRadius: 14, border: "1px solid #E3E5DF",
          background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          opacity: currentIndex === ads.length - 1 ? 0.4 : 1,
        }}>
          <ChevronRight size={20} />
        </button>
      </div>
      <ReviewCard
        ad={ad}
        onApprove={onApprove}
        onRequestChange={onRequestChange}
        showComment={showComment === ad.id}
        commentText={commentText}
        setCommentText={setCommentText}
        onSubmitComment={onSubmitComment}
        onCancelComment={onCancelComment}
      />
    </div>
  )
}

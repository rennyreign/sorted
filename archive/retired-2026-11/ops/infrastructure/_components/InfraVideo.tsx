"use client"

import { useRef, useState } from "react"
import { trackEvent } from "@/lib/tracking"
import styles from "../infrastructure.module.css"

export function InfraVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  function play() {
    videoRef.current?.play()
    trackEvent("infrastructure_video_played", { cta_location: "hero_poster" })
  }

  return (
    <div className={styles.videoCard}>
      <video
        ref={videoRef}
        src="/ops/ai-infrastructure.mp4"
        poster="/ops/ai-infrastructure-poster.jpg"
        preload="none"
        controls={playing}
        playsInline
        className={styles.video}
        onPlay={() => setPlaying(true)}
        aria-label="AI-powered operational infrastructure"
      />
      {!playing && (
        <button
          type="button"
          onClick={play}
          aria-label="Play the infrastructure overview video"
          className={styles.videoOverlay}
        >
          <span className={styles.videoPlayBtn} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.9-6.86a1.03 1.03 0 0 0 0-1.76L9.56 4.26A1.03 1.03 0 0 0 8 5.14Z" />
            </svg>
          </span>
          <span className={styles.videoCaption}>How this works in practice</span>
        </button>
      )}
    </div>
  )
}

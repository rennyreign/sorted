"use client"

import { useRef, useState } from "react"
import { Play } from "lucide-react"
import { trackEvent } from "@/lib/tracking"

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  function play() {
    videoRef.current?.play()
    trackEvent("founder_video_played", { cta_location: "hero_poster" })
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#0C0C0C]">
      <video
        id="founder-video"
        ref={videoRef}
        src="/agencies/campaign-angles.mp4"
        poster="/agencies/campaign-angles-poster.jpg"
        preload="none"
        controls={playing}
        playsInline
        className="aspect-[4/5] w-full object-cover"
        onPlay={() => setPlaying(true)}
        aria-label="How a campaign angle is manufactured"
      />
      {!playing && (
        <button
          type="button"
          onClick={play}
          aria-label="Play the Sorted introduction video"
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 transition-colors duration-200 hover:bg-black/30"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D4FF00]">
            <Play size={22} className="ml-1 fill-[#0C0C0C] text-[#0C0C0C]" aria-hidden="true" />
          </span>
          <span className="text-[13px] font-medium text-white/80">See a campaign angle built</span>
        </button>
      )}
    </div>
  )
}

export function VideoWatchButton() {
  function watch() {
    const video = document.getElementById("founder-video") as HTMLVideoElement | null
    if (!video) return
    video.scrollIntoView({ behavior: "smooth", block: "center" })
    video.play()
    trackEvent("founder_video_played", { cta_location: "hero_button" })
  }

  return (
    <button
      type="button"
      onClick={watch}
      className="inline-flex items-center gap-2.5 text-sm font-semibold text-[#0C0C0C] transition-opacity duration-200 hover:opacity-70"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4FF00]">
        <Play size={14} className="ml-0.5 fill-[#0C0C0C] text-[#0C0C0C]" aria-hidden="true" />
      </span>
      <span className="text-left leading-tight">
        Watch a 2 min
        <br />
        <span className="font-medium text-[#6E6E6A]">founder overview</span>
      </span>
    </button>
  )
}

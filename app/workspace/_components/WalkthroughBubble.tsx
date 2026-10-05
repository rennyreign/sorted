"use client"

import { useRef, useState } from "react"
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react"

type Payload = Record<string, string | number | boolean | null | undefined>

type Props = {
  src: string
  speakerName?: string
  onEvent: (event: string, payload?: Payload) => void
}

const DIRECT_VIDEO = /\.(mp4|webm|mov|m4v)(\?|$)/i

const BTN =
  "grid size-7 place-items-center rounded-full bg-[#070707] text-white shadow-md transition-colors hover:bg-[#1A1A1A] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DFFF00] p-2 box-content min-h-[28px] min-w-[28px]"

export default function WalkthroughBubble({ src, speakerName, onEvent }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const playedOnce = useRef(false)

  const positionSeconds = () => Math.round((videoRef.current?.currentTime ?? 0) * 10) / 10

  const play = () => {
    const v = videoRef.current
    if (!v) return
    void v.play()
  }

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play()
    } else {
      v.pause()
    }
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    onEvent("walkthrough_muted", { muted: v.muted })
  }

  const dismiss = () => {
    videoRef.current?.pause()
    onEvent("walkthrough_dismissed", { position_seconds: positionSeconds() })
    setDismissed(true)
  }

  const restore = () => {
    setDismissed(false)
    play()
  }

  // Non-direct-file URLs can't play inline — fall back to a plain pill link.
  if (!DIRECT_VIDEO.test(src)) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 z-20 inline-flex h-9 items-center rounded-full bg-[#070707] px-4 text-[11px] font-bold text-white shadow-lg transition-colors hover:bg-[#1A1A1A] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#070707] sm:bottom-6 sm:right-6"
      >
        Hear the thinking ↗
      </a>
    )
  }

  if (dismissed) {
    return (
      <button
        type="button"
        onClick={restore}
        aria-label="Play explanation"
        className="absolute bottom-4 right-4 z-20 inline-flex h-9 items-center gap-2 rounded-full bg-[#070707] px-4 text-[11px] font-bold text-white shadow-lg transition-colors hover:bg-[#1A1A1A] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#070707] motion-reduce:transition-none sm:bottom-6 sm:right-6"
      >
        <Play className="size-3.5" strokeWidth={2.4} />
        Play explanation
      </button>
    )
  }

  // Circular progress ring — stroke-dashoffset driven by timeupdate.
  const R = 70
  const CIRC = 2 * Math.PI * R

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-20 sm:bottom-6 sm:right-6">
      <div className="pointer-events-auto relative">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause explanation" : "Play explanation"}
          className="group relative block size-24 rounded-full ring-4 ring-[#070707]/90 shadow-[0_10px_30px_rgba(7,7,7,0.35)] transition-transform duration-150 hover:scale-[1.03] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#070707] motion-reduce:transition-none motion-reduce:hover:scale-100 sm:size-[148px]"
        >
          <video
            ref={videoRef}
            src={src}
            playsInline
            preload="metadata"
            aria-label={`Explanation from ${speakerName ?? "Sorted"}`}
            className="size-full rounded-full object-cover"
            onPlay={() => {
              setPlaying(true)
              if (!playedOnce.current) {
                playedOnce.current = true
                onEvent("walkthrough_played", { src })
              }
            }}
            onPause={() => {
              setPlaying(false)
              if (playedOnce.current && !videoRef.current?.ended) {
                onEvent("walkthrough_paused", { position_seconds: positionSeconds() })
              }
            }}
            onEnded={() => {
              setPlaying(false)
              onEvent("walkthrough_completed")
            }}
            onTimeUpdate={(e) => {
              const v = e.currentTarget
              if (v.duration > 0) setProgress(v.currentTime / v.duration)
            }}
          />
          {/* progress ring */}
          <svg
            className="pointer-events-none absolute inset-0 size-full -rotate-90"
            viewBox="0 0 148 148"
            aria-hidden
          >
            <circle
              cx="74" cy="74" r={R}
              fill="none" stroke="#DFFF00" strokeWidth="3"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              strokeLinecap="round"
            />
          </svg>
          {/* play/pause overlay */}
          <span
            className={`absolute inset-0 grid place-items-center rounded-full bg-[#070707]/35 transition-opacity duration-150 motion-reduce:transition-none ${
              playing ? "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" : "opacity-100"
            }`}
            aria-hidden
          >
            {playing ? (
              <Pause className="size-8 text-white drop-shadow sm:size-10" strokeWidth={2.2} />
            ) : (
              <Play className="size-8 text-white drop-shadow sm:size-10" strokeWidth={2.2} />
            )}
          </span>
        </button>

        {/* label pill */}
        <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#070707] px-3 py-1 text-[11px] font-bold text-white shadow-md">
          Hear the thinking{speakerName ? ` · ${speakerName}` : ""}
        </span>

        {/* mute + close on the ring edge */}
        <div className="absolute -right-1 -top-1 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss explanation"
            className={BTN}
          >
            <X className="size-3.5" strokeWidth={2.6} />
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute explanation" : "Mute explanation"}
            aria-pressed={muted}
            className={BTN}
          >
            {muted ? (
              <VolumeX className="size-3.5" strokeWidth={2.2} />
            ) : (
              <Volume2 className="size-3.5" strokeWidth={2.2} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

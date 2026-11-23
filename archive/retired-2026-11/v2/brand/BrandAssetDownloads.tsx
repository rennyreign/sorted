"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDownToLine, Check, Copy } from "lucide-react"

const SITE_URL = "https://sortmydigital.site"

const downloads = [
  ["Wordmark · light surface", "/brand/sorted-wordmark-on-light.png", "PNG"],
  ["Wordmark · dark surface", "/brand/sorted-wordmark-on-dark.png", "PNG"],
  ["Compact · light surface", "/brand/sorted-compact-on-light.png", "PNG"],
  ["Compact · dark surface", "/brand/sorted-compact-on-dark.png", "PNG"],
  ["Brand token card", "/brand/sorted-brand-token-card.png", "PNG"],
] as const

type CopyStatus = "idle" | "copied" | "error"

async function writeToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement("textarea")
  textarea.value = value
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()

  const copied = document.execCommand("copy")
  textarea.remove()

  if (!copied) throw new Error("Clipboard copy failed")
}

export default function BrandAssetDownloads() {
  const [copiedFile, setCopiedFile] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle")
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, [])

  async function copyUrl(file: string) {
    const url = `${SITE_URL}${file}`

    try {
      await writeToClipboard(url)
      setCopiedFile(file)
      setCopyStatus("copied")
    } catch {
      setCopiedFile(file)
      setCopyStatus("error")
    }

    if (resetTimer.current) clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => {
      setCopiedFile(null)
      setCopyStatus("idle")
    }, 3000)
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {downloads.map(([label, file, format], index) => {
        const assetUrl = `${SITE_URL}${file}`
        const isCurrent = copiedFile === file
        const copied = isCurrent && copyStatus === "copied"
        const failed = isCurrent && copyStatus === "error"

        return (
          <article
            key={file}
            className={`group flex min-w-0 flex-col rounded-[12px] border border-black/10 bg-[#fbfbfa] transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-black/25 hover:bg-[#f7f1e8] ${index === downloads.length - 1 ? "sm:col-span-2" : ""}`}
          >
            <div className="flex min-h-16 items-center justify-between gap-4 px-5 py-3">
              <span className="text-[12px] font-black">
                {label}
                <span className="ml-2 font-mono text-[9px] text-black/38">{format}</span>
              </span>
              <a
                href={file}
                download
                aria-label={`Download ${label}`}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white transition-colors duration-200 hover:border-black hover:bg-[#dfff00] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff00]/60"
              >
                <ArrowDownToLine className="size-4" strokeWidth={2.7} />
              </a>
            </div>
            <div className="flex min-w-0 items-center gap-3 border-t border-black/8 px-5 py-3">
              <span className="min-w-0 flex-1 truncate font-mono text-[9px] font-bold text-black/45" title={assetUrl}>
                {assetUrl}
              </span>
              <button
                type="button"
                onClick={() => copyUrl(file)}
                aria-label={`Copy URL for ${label}`}
                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-[10px] font-black transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff00]/60 ${copied ? "border-black bg-[#dfff00]" : failed ? "border-red-600 bg-red-50 text-red-700" : "border-black/10 bg-white hover:border-black"}`}
              >
                {copied ? <Check className="size-3.5" strokeWidth={3} /> : <Copy className="size-3.5" strokeWidth={2.7} />}
                {copied ? "Copied" : failed ? "Try again" : "Copy URL"}
              </button>
            </div>
          </article>
        )
      })}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {copyStatus === "copied" ? "Logo URL copied to clipboard." : copyStatus === "error" ? "The logo URL could not be copied." : ""}
      </p>
    </div>
  )
}

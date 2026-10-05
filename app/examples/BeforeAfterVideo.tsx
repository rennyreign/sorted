type BeforeAfterVideoProps = {
  className?: string
}

export function BeforeAfterVideo({ className = "" }: BeforeAfterVideoProps) {
  return (
    <figure
      className={`group relative aspect-video w-full overflow-hidden rounded-[16px] border border-black/12 bg-[#090a0a] text-white shadow-[0_24px_70px_rgba(0,0,0,0.14)] ${className}`}
      aria-label="Before and after website walkthrough video"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="https://sortedstorage.s3.amazonaws.com/school-of-skill-landscape-4k.mp4"
        poster="/examples/thumbnail-overlay.png"
        preload="metadata"
        controls
        playsInline
      />
    </figure>
  )
}

import { ArrowUpRight, Star } from "lucide-react"
import type { GoogleReviewsData } from "@/lib/googleReviews"

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7 shrink-0">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.86A6.02 6.02 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.48l3.34-2.62Z" />
      <path fill="#EA4335" d="M12 6.01c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.95 5.52l3.34 2.62C7.18 7.77 9.39 6.01 12 6.01Z" />
    </svg>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={`size-4 ${index < Math.round(rating) ? "fill-[#fbbc04] text-[#fbbc04]" : "fill-white/15 text-white/15"}`}
          strokeWidth={1.8}
        />
      ))}
    </span>
  )
}

export function GoogleReviews({ data }: { data: GoogleReviewsData }) {
  return (
    <section aria-labelledby="google-reviews-heading" className="overflow-hidden rounded-[18px] bg-white/[0.055] shadow-[0_22px_55px_rgba(0,0,0,0.22)] ring-1 ring-white/10">
      <div className="flex flex-col gap-5 border-b border-white/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-white">
            <GoogleMark />
          </span>
          <div>
            <p id="google-reviews-heading" className="text-[16px] font-black tracking-[-0.025em]">Google reviews</p>
            <p className="mt-1 text-[12px] font-semibold text-white/55">Verified feedback for {data.businessName}</p>
          </div>
        </div>
        <a
          href={data.profileUrl}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-3 self-start rounded-full border border-white/15 px-4 py-2.5 transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] sm:self-auto"
        >
          <strong className="text-[19px] tracking-[-0.035em]">{data.rating.toFixed(1)}</strong>
          <Stars rating={data.rating} />
          <span className="text-[11px] font-bold text-white/55">{data.reviewCount} reviews</span>
          <ArrowUpRight className="size-4 text-white/45 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.4} />
        </a>
      </div>

      <div className="grid lg:grid-cols-[1.17fr_0.83fr]">
        {data.reviews.slice(0, 2).map((review, index) => (
          <blockquote key={`${review.authorName}-${review.text}`} className={`flex flex-col px-6 py-7 sm:px-7 ${index > 0 ? "border-t border-white/10 lg:border-l lg:border-t-0" : ""}`}>
            <Stars rating={review.rating} />
            <p className="mt-5 text-[14px] font-semibold leading-[1.62] tracking-[-0.015em] text-white/84">“{review.text}”</p>
            <footer className="mt-auto flex items-end justify-between gap-4 pt-6">
              <div>
                <a href={review.authorUrl} target="_blank" rel="noreferrer" className="text-[12px] font-black transition-colors duration-200 hover:text-[#dfff00]">
                  {review.authorName}
                </a>
                <p className="mt-1 text-[11px] font-semibold text-white/45">{review.relativeTime}</p>
              </div>
              <a href={review.reviewUrl} target="_blank" rel="noreferrer" aria-label={`Read ${review.authorName}'s review on Google`} className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.07] text-white/55 transition-colors duration-200 hover:bg-[#dfff00] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00]">
                <ArrowUpRight className="size-4" strokeWidth={2.4} />
              </a>
            </footer>
          </blockquote>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-black/20 px-6 py-4 sm:px-7">
        <p className="text-[11px] font-semibold text-white/45">Reviews supplied by Google</p>
        <a href={data.writeReviewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[11px] font-black text-white underline decoration-white/30 underline-offset-4 transition-colors duration-200 hover:text-[#dfff00]">
          Leave a Google review <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
        </a>
      </div>
    </section>
  )
}

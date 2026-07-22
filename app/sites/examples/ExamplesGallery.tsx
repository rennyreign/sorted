"use client"

import { useMemo, useState } from "react"
import { examples, SitePreviewCard, type SiteExample } from "../_components/SitesPrimitives"

const extraExamples: SiteExample[] = [
  {
    ...examples[3],
    slug: "ember-oak",
    title: "Ember & Oak",
    category: "Hospitality",
    description: "Modern restaurant in the heart of Brighton.",
    headline: "Great food. Good wine. Good times.",
    result: "20 hour mockup",
  },
  {
    ...examples[1],
    slug: "harrison-co",
    title: "Harrison & Co",
    category: "Professional services",
    description: "Legal advice for individuals and businesses.",
    headline: "Clear advice. Better outcomes.",
    result: "23 hour mockup",
  },
]

const galleryExamples = [...examples, ...extraExamples]
const filters = ["All", "Home services", "Health & fitness", "Hospitality", "Retail", "Professional services", "Other"]

export function ExamplesGallery() {
  const [activeFilter, setActiveFilter] = useState("All")

  const filteredExamples = useMemo(() => {
    if (activeFilter === "All") return galleryExamples
    if (activeFilter === "Other") {
      return galleryExamples.filter((example) => !filters.slice(1, -1).some((filter) => matchesCategory(example.category, filter)))
    }
    return galleryExamples.filter((example) => matchesCategory(example.category, activeFilter))
  }, [activeFilter])

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-3">
        {filters.map((filter) => {
          const active = filter === activeFilter
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`h-11 rounded-full border px-5 text-[12px] font-bold transition-all hover:-translate-y-0.5 ${
                active ? "border-black bg-[#070707] text-white shadow-[0_12px_26px_rgba(0,0,0,0.14)]" : "border-black/20 bg-white text-black"
              }`}
            >
              {filter}
            </button>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExamples.map((example) => (
          <SitePreviewCard key={example.slug} example={example} />
        ))}
      </div>
    </>
  )
}

function matchesCategory(category: string, filter: string) {
  const normalizedCategory = category.toLowerCase()
  const normalizedFilter = filter.toLowerCase()
  return normalizedCategory === normalizedFilter || normalizedCategory.includes(normalizedFilter.replace(" services", ""))
}

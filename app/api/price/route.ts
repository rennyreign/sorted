import { NextRequest, NextResponse } from "next/server"

export type JobType =
  | "website"
  | "landing-page"
  | "logo"
  | "ads"
  | "google-profile"
  | "social"
  | "other"

export interface PriceResult {
  summary: string
  price: number
  currency: string
  deliveryDays: number
  includes: string[]
  jobType: JobType
  confidence: "estimated" | "confirmed"
}

const pricing: Record<JobType, { price: number; deliveryDays: number; includes: string[]; label: string }> = {
  "website": {
    price: 149,
    deliveryDays: 2,
    label: "business website",
    includes: ["Up to 5 pages", "Mobile responsive", "Contact form", "Hosted and live"],
  },
  "landing-page": {
    price: 99,
    deliveryDays: 1,
    label: "landing page",
    includes: ["Single page", "Mobile responsive", "Lead capture form", "Hosted and live"],
  },
  "logo": {
    price: 79,
    deliveryDays: 1,
    label: "logo design",
    includes: ["3 initial concepts", "PNG, SVG and PDF files", "Full usage rights"],
  },
  "ads": {
    price: 129,
    deliveryDays: 2,
    label: "social ad campaign",
    includes: ["3 ad creatives", "Copy written for you", "All platform sizes", "Ready to publish"],
  },
  "google-profile": {
    price: 49,
    deliveryDays: 1,
    label: "Google Business Profile",
    includes: ["Full profile setup", "Categories and keywords", "Photo upload", "Review strategy"],
  },
  "social": {
    price: 99,
    deliveryDays: 2,
    label: "social content pack",
    includes: ["10 branded posts", "Captions written", "Sized per platform", "Content calendar"],
  },
  "other": {
    price: 149,
    deliveryDays: 2,
    label: "digital job",
    includes: ["Scoped to your brief", "Delivered digitally", "3 versions included"],
  },
}

function inferJobType(text: string): JobType {
  const t = text.toLowerCase()
  if (t.match(/landing[\s-]?page|sign[\s-]?up|opt[\s-]?in|squeeze/)) return "landing-page"
  if (t.match(/website|web site|\bsite\b|online presence|web presence/)) return "website"
  if (t.match(/\blogo\b|brand identity|rebrand/)) return "logo"
  if (t.match(/facebook ad|meta ad|instagram ad|\bad\b|\bads\b|paid social|boost/)) return "ads"
  if (t.match(/google business|gmb|google profile|google maps|maps listing/)) return "google-profile"
  if (t.match(/social media|instagram post|content pack|tiktok|linkedin post/)) return "social"
  return "other"
}

function buildSummary(jobType: JobType, business: string): string {
  const tier = pricing[jobType]
  const biz = business ? ` for ${business}` : ""
  return `Sounds like you need a ${tier.label}${biz}. Based on what you've described, here's what we'd charge.`
}

export async function POST(req: NextRequest) {
  const { whatYouNeed, business } = await req.json()

  // ─── LLM hook ────────────────────────────────────────────────────────────
  // When you're ready to wire up an LLM, replace the block below with:
  //
  // const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  // const completion = await ai.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   messages: [
  //     { role: "system", content: PRICING_SYSTEM_PROMPT },
  //     { role: "user", content: `Brief: ${whatYouNeed}\nBusiness: ${business}` },
  //   ],
  //   response_format: { type: "json_object" },
  // })
  // return NextResponse.json(JSON.parse(completion.choices[0].message.content!))
  // ─────────────────────────────────────────────────────────────────────────

  const jobType = inferJobType(whatYouNeed)
  const tier = pricing[jobType]

  const result: PriceResult = {
    summary: buildSummary(jobType, business),
    price: tier.price,
    currency: "GBP",
    deliveryDays: tier.deliveryDays,
    includes: tier.includes,
    jobType,
    confidence: "estimated",
  }

  await new Promise((r) => setTimeout(r, 1600))

  return NextResponse.json(result)
}

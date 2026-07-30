"use client"

import { useState } from "react"
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  Home,
  Info,
  LineChart,
  LockKeyhole,
  MessageCircle,
  PoundSterling,
  Send,
  Star,
  UsersRound,
} from "lucide-react"
import { v2Bakeshop, v2Highlight, v2Marker } from "../_components/V2Primitives"

const ranges = [
  {
    label: "Apr 1 - Apr 30, 2025",
    value: 18420,
    investment: 6000,
    before: { hoursLost: 42, response: 18, reviews: 14, followUp: 23, revenueLost: 2300 },
    after: { hours: 286, response: 3, reviews: 214, followUp: 100, revenue: 2900 },
    chart: [0, 12, 28, 61, 92, 118, 135, 164, 176, 204, 218, 246],
  },
  {
    label: "Mar 1 - Mar 31, 2025",
    value: 16240,
    investment: 6000,
    before: { hoursLost: 40, response: 21, reviews: 12, followUp: 19, revenueLost: 2100 },
    after: { hours: 254, response: 4, reviews: 187, followUp: 92, revenue: 2600 },
    chart: [0, 8, 21, 50, 84, 106, 121, 146, 158, 181, 198, 222],
  },
  {
    label: "Feb 1 - Feb 28, 2025",
    value: 13790,
    investment: 6000,
    before: { hoursLost: 38, response: 24, reviews: 10, followUp: 18, revenueLost: 1900 },
    after: { hours: 226, response: 5, reviews: 160, followUp: 84, revenue: 2200 },
    chart: [0, 7, 18, 39, 70, 94, 108, 129, 143, 162, 177, 196],
  },
] as const

const systems = [
  { label: "Missed Call Text-Back", metric: "81 leads", value: 81 },
  { label: "Review Generation", metric: "214 reviews", value: 72 },
  { label: "Enquiry Responder", metric: "417 replies", value: 69 },
  { label: "Website & Booking", metric: "34 bookings", value: 55 },
  { label: "CRM & Follow-up", metric: "100% rate", value: 74 },
]

const sidebar = [
  { key: "overview", label: "Overview", icon: Home },
  { key: "time", label: "Time Returned", icon: Clock3 },
  { key: "customers", label: "Customers", icon: UsersRound },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "revenue", label: "Revenue", icon: BarChart3 },
  { key: "investment", label: "Investment", icon: CircleDollarSign },
] as const

const pageCopy = {
  overview: ["Your Results", "See what's changed since you started with Sorted."],
  time: ["Time Returned", "Where your team got capacity back this month."],
  customers: ["Customers", "How enquiries move from first contact to booked work."],
  reviews: ["Reviews", "How your local proof and reputation are growing."],
  revenue: ["Revenue", "What money was recovered, protected, or created."],
  investment: ["Investment", "What you paid for, what it returned, and what comes next."],
} as const

const timeBreakdown = [
  ["Missed Call Text-Back", "9.5 hrs", "1.2 hrs", "8.3 hrs"],
  ["Enquiry Responder", "14 hrs", "2.5 hrs", "11.5 hrs"],
  ["Website & Booking", "11 hrs", "3 hrs", "8 hrs"],
  ["CRM & Follow-up", "7.5 hrs", "1.7 hrs", "5.8 hrs"],
]

const sources = [
  ["Website", 148, 91],
  ["Google", 122, 84],
  ["WhatsApp", 73, 67],
  ["Social", 48, 31],
  ["Referrals", 26, 24],
] as const

const reviewRows = [
  ["Requests sent", "312", "+44"],
  ["Customers opened", "271", "+38"],
  ["Reviews completed", "214", "+27"],
  ["Average rating", "4.9", "+0.2"],
]

const revenueRows = [
  ["Missed calls recovered", "£840", "29%"],
  ["Bookings recovered", "£1,120", "39%"],
  ["Review-led enquiries", "£520", "18%"],
  ["Follow-up wins", "£420", "14%"],
]

const planItems = ["Diagnostic review", "Routine replacement", "Capacity dashboard", "Monthly results review", "Next routine roadmap"]

type RangeData = (typeof ranges)[number]
type NavKey = (typeof sidebar)[number]["key"]

export function ResultsDashboard() {
  const [rangeIndex, setRangeIndex] = useState(0)
  const [activeNav, setActiveNav] = useState<NavKey>("overview")
  const [activeMetric, setActiveMetric] = useState("hours")
  const [activeSystem, setActiveSystem] = useState(systems[0].label)
  const data = ranges[rangeIndex]
  const netValue = data.value - data.investment
  const returnRate = Math.round((netValue / data.investment) * 100)
  const glance = getGlance(data, netValue)
  const selectedMetric = glance.find((item) => item.key === activeMetric) ?? glance[0]
  const selectedSystem = systems.find((system) => system.label === activeSystem) ?? systems[0]
  const [pageTitle, pageDescription] = pageCopy[activeNav]

  return (
    <main className={`${v2Marker.variable} ${v2Highlight.variable} ${v2Bakeshop.variable} min-h-screen overflow-x-hidden bg-[#fbfbfa] text-[#070707]`}>
      <div className="grid min-h-screen min-w-0 lg:grid-cols-[236px_1fr]">
        <aside className="flex min-w-0 flex-col overflow-x-hidden overflow-y-auto bg-[#070707] px-5 py-6 text-white lg:sticky lg:top-0 lg:h-screen">
          <a href="/ops" className="inline-flex min-h-11 items-center text-[33px] font-black leading-none tracking-[-0.045em] sm:text-[40px]" aria-label="Sorted V2 home">
            Sorted<span className="[font-family:var(--font-v2-bakeshop)] text-[#cfe900]">.ops</span>
          </a>

          <nav className="mt-8 grid max-w-full grid-cols-2 gap-2 pb-2 sm:grid-cols-3 lg:grid-cols-1 lg:gap-2.5 lg:pb-0">
            {sidebar.map((item) => {
              const Icon = item.icon
              const active = activeNav === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveNav(item.key)
                    if (item.key === "time") setActiveMetric("hours")
                    if (item.key === "customers") setActiveMetric("enquiries")
                    if (item.key === "reviews") setActiveMetric("reviews")
                    if (item.key === "revenue") setActiveMetric("revenue")
                    if (item.key === "investment") setActiveMetric("value")
                  }}
                  className={`flex min-h-14 items-center gap-3 rounded-[12px] px-3 text-[13px] font-semibold transition-all lg:h-[56px] lg:gap-4 lg:px-4 lg:text-[15px] ${
                    active ? "bg-white/10 text-[#dfff00]" : "text-white/92 hover:bg-white/7"
                  }`}
                >
                  <Icon className="size-6" strokeWidth={2.1} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="mt-7 grid gap-3 lg:mt-auto">
            <div className="rounded-[18px] border border-white/13 bg-white/[0.03] p-4">
              <p className="text-[12px] text-white/55">Plan</p>
              <p className="mt-2 text-[15px] font-black text-[#dfff00]">Growth</p>
              <p className="mt-5 text-[12px] text-white/55">Since</p>
              <p className="mt-2 text-[17px] font-black">Nov 2024</p>
              <p className="mt-5 text-[12px] text-white/55">Next report</p>
              <p className="mt-2 text-[17px] font-black">Jun 1, 2025</p>
            </div>
            <button type="button" className="inline-flex h-12 items-center justify-center gap-3 rounded-[16px] border border-white/14 text-[13px] font-black transition-colors hover:bg-white/8">
              <Download className="size-5" strokeWidth={2.3} />
              Download report
            </button>
          </div>
        </aside>

        <section className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 xl:px-14">
          <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-[clamp(2.45rem,3.7vw,3.55rem)] font-black leading-[0.95] tracking-[-0.06em]">{pageTitle}</h1>
              <p className="mt-4 text-[16px] font-semibold text-black/62">
                {pageDescription}
                <span className="ml-2 inline-block h-[5px] w-16 translate-y-1 rotate-[-4deg] rounded-full bg-[#dfff00]" />
              </p>
            </div>
            <label className="relative w-full max-w-[292px]">
              <span className="sr-only">Report date range</span>
              <CalendarDays className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2" strokeWidth={2.2} />
              <select
                value={rangeIndex}
                onChange={(event) => setRangeIndex(Number(event.target.value))}
                className="h-[58px] w-full appearance-none rounded-[16px] border border-black/12 bg-white px-14 text-[15px] font-black outline-none shadow-[0_10px_28px_rgba(0,0,0,0.04)]"
              >
                {ranges.map((range, index) => (
                  <option key={range.label} value={index}>{range.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-5 top-1/2 size-5 -translate-y-1/2" strokeWidth={2.2} />
            </label>
          </header>

          {activeNav === "overview" ? (
            <OverviewView data={data} glance={glance} netValue={netValue} returnRate={returnRate} activeMetric={activeMetric} selectedMetric={selectedMetric} selectedSystem={selectedSystem} activeSystem={activeSystem} setActiveMetric={setActiveMetric} setActiveSystem={setActiveSystem} />
          ) : null}
          {activeNav === "time" ? <TimeView data={data} /> : null}
          {activeNav === "customers" ? <CustomersView data={data} /> : null}
          {activeNav === "reviews" ? <ReviewsView data={data} /> : null}
          {activeNav === "revenue" ? <RevenueView data={data} netValue={netValue} /> : null}
          {activeNav === "investment" ? <InvestmentView data={data} netValue={netValue} returnRate={returnRate} /> : null}

          <p className="mx-auto mt-8 flex max-w-[900px] items-center justify-center gap-3 text-center text-[13px] font-semibold text-black/68">
            <LockKeyhole className="size-4 shrink-0" strokeWidth={2.2} />
            These results are estimated based on data from your systems. They show the impact of the systems and optimisations we've implemented together.
          </p>
        </section>
      </div>
    </main>
  )
}

function getGlance(data: RangeData, netValue: number) {
  return [
    { key: "hours", label: "Hours returned", value: `${data.after.hours}`, suffix: "hrs", note: "This month", delta: "32 hrs vs last month", icon: Clock3 },
    { key: "enquiries", label: "Enquiries received", value: "417", suffix: "", note: "This month", delta: "18% vs last month", icon: LineChart },
    { key: "reviews", label: "Review growth", value: `+${data.after.reviews - data.before.reviews}`, suffix: "", note: "Net new reviews", delta: "27 vs last month", icon: Star },
    { key: "revenue", label: "Revenue recovered", value: `£${data.after.revenue.toLocaleString()}`, suffix: "", note: "This month", delta: "12% vs last month", icon: CircleDollarSign },
    { key: "value", label: "Net value created", value: `£${netValue.toLocaleString()}`, suffix: "", note: "Since starting", delta: "£2,180 vs last month", icon: LineChart },
  ]
}

function OverviewView({
  data,
  glance,
  netValue,
  returnRate,
  activeMetric,
  selectedMetric,
  selectedSystem,
  activeSystem,
  setActiveMetric,
  setActiveSystem,
}: {
  data: RangeData
  glance: ReturnType<typeof getGlance>
  netValue: number
  returnRate: number
  activeMetric: string
  selectedMetric: ReturnType<typeof getGlance>[number]
  selectedSystem: (typeof systems)[number]
  activeSystem: string
  setActiveMetric: (key: string) => void
  setActiveSystem: (system: string) => void
}) {
  return (
    <>
      <section className="mt-11 grid gap-8 xl:grid-cols-[1fr_1.15fr_1fr] 2xl:gap-10">
        <BeforeAfterCard title="Before Sorted" tone="before" rows={[
          ["Hours lost each month", `${data.before.hoursLost} hrs`, Clock3],
          ["Average response time", `${data.before.response} hrs`, Clock3],
          ["Reviews", `${data.before.reviews}`, Star],
          ["Follow-up rate", `${data.before.followUp}%`, LineChart],
          ["Estimated revenue lost", `£${data.before.revenueLost.toLocaleString()} /month`, PoundSterling],
        ]} foot="Manual work. Missed opportunities. Lost time." />

        <HeroValue data={data} netValue={netValue} returnRate={returnRate} />

        <BeforeAfterCard title="After Sorted" tone="after" rows={[
          ["Hours returned", `${data.after.hours} hrs`, Clock3],
          ["Average response time", `${data.after.response} min`, Clock3],
          ["Reviews", `${data.after.reviews}`, Star],
          ["Follow-up rate", `${data.after.followUp}%`, LineChart],
          ["Revenue recovered", `£${data.after.revenue.toLocaleString()} /month`, CircleDollarSign],
        ]} foot="Time back. More leads. Stronger business." />
      </section>

      <section className="mt-10">
        <h2 className="text-[22px] font-black tracking-[-0.04em]">At a glance</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {glance.map((metric) => (
            <MetricCard key={metric.key} metric={metric} active={activeMetric === metric.key} onClick={() => setActiveMetric(metric.key)} />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_1.05fr_1.2fr]">
        <ChartCard title={`${selectedMetric.label} over time`} selected={selectedMetric.value} suffix={selectedMetric.suffix} points={data.chart} />
        <SystemsCard activeSystem={activeSystem} onSelect={setActiveSystem} />
        <ScoreCard system={selectedSystem.label} metric={selectedSystem.metric} />
      </section>
    </>
  )
}

function TimeView({ data }: { data: RangeData }) {
  return (
    <>
      <section className="mt-9 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <FocusHero icon={Clock3} label="Capacity returned" value={`${data.after.hours} hrs`} copy="Equivalent to 35.75 working days returned this month." />
        <ChartCard title="Hours returned by month" selected={`${data.after.hours}`} suffix="hrs" points={data.chart} />
      </section>
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DataTable title="Where time came back" columns={["Routine", "Before", "After", "Saved"]} rows={timeBreakdown} />
        <SimpleList title="Systems saving the most time" items={systems.map((system) => [system.label, system.metric])} />
      </section>
    </>
  )
}

function CustomersView({ data }: { data: RangeData }) {
  return (
    <>
      <section className="mt-9 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <FocusHero icon={MessageCircle} label="Enquiries received" value="417" copy={`${data.after.response} minute average first response. Fewer warm leads left waiting.`} />
        <FunnelCard />
      </section>
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SourceCard />
        <DataTable title="Recovered opportunities" columns={["Source", "Enquiries", "Converted"]} rows={sources.map(([source, enquiries, converted]) => [source, `${enquiries}`, `${converted}`])} />
      </section>
    </>
  )
}

function ReviewsView({ data }: { data: RangeData }) {
  return (
    <>
      <section className="mt-9 grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
        <FocusHero icon={Star} label="Review growth" value={`+${data.after.reviews - data.before.reviews}`} copy={`Moved from ${data.before.reviews} reviews to ${data.after.reviews}.`} />
        <ScoreCard system="Review Generation" metric={`${data.after.reviews} reviews`} />
        <SimpleList title="Best request moments" items={[["After completed job", "62% completion"], ["After free intro", "48% completion"], ["After positive reply", "41% completion"]]} />
      </section>
      <section className="mt-8">
        <DataTable title="Review request performance" columns={["Metric", "Current", "Change"]} rows={reviewRows} />
      </section>
    </>
  )
}

function RevenueView({ data, netValue }: { data: RangeData; netValue: number }) {
  return (
    <>
      <section className="mt-9 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <FocusHero icon={PoundSterling} label="Revenue recovered" value={`£${data.after.revenue.toLocaleString()}`} copy={`£${netValue.toLocaleString()} net value created since starting Sorted.`} />
        <ChartCard title="Recovered revenue trend" selected={`£${data.after.revenue.toLocaleString()}`} suffix="" points={data.chart.map((point) => Math.round(point * 12))} />
      </section>
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DataTable title="Revenue by system" columns={["System", "Recovered", "Share"]} rows={revenueRows} />
        <ProjectionCard current={data.after.revenue} />
      </section>
    </>
  )
}

function InvestmentView({ data, netValue, returnRate }: { data: RangeData; netValue: number; returnRate: number }) {
  return (
    <>
      <section className="mt-9 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <HeroValue data={data} netValue={netValue} returnRate={returnRate} />
        <FocusHero icon={CircleDollarSign} label="Return on investment" value={`${returnRate}%`} copy="The dashboard compares estimated value created against Sorted investment to date." />
      </section>
      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SimpleList title="Included in current plan" items={planItems.map((item) => [item, "Active"])} />
        <DataTable title="Investment return" columns={["Item", "Value", "Status"]} rows={[["Investment", `£${data.investment.toLocaleString()}`, "Paid"], ["Gross value", `£${data.value.toLocaleString()}`, "Created"], ["Net value", `£${netValue.toLocaleString()}`, "Positive"], ["Return", `${returnRate}%`, "Tracked"]]} />
      </section>
    </>
  )
}

function HeroValue({ data, netValue, returnRate }: { data: RangeData; netValue: number; returnRate: number }) {
  return (
    <article className="rounded-[18px] bg-[#dfff00] p-7 text-center shadow-[0_18px_50px_rgba(180,205,0,0.22)] xl:px-8 xl:py-8">
      <p className="inline-flex items-center gap-2 text-[13px] font-black uppercase xl:text-[14px]">Estimated value created <Info className="size-4" /></p>
      <p className="mt-5 text-[clamp(3.1rem,4.8vw,4.35rem)] font-black leading-none tracking-[-0.07em]">£{data.value.toLocaleString()}</p>
      <p className="mt-4 text-[15px] font-bold">since starting Sorted</p>
      <div className="mx-auto mt-7 grid max-w-[430px] grid-cols-2 gap-2 rounded-[12px] bg-white p-3 shadow-[0_14px_28px_rgba(0,0,0,0.08)]">
        <ValueStat label="Investment" value={`£${data.investment.toLocaleString()}`} />
        <ValueStat label="Return" value={`${returnRate}%`} green />
        <ValueStat label="Net value" value={`+£${netValue.toLocaleString()}`} green wide />
      </div>
      <p className="mt-6 [font-family:var(--font-v2-marker)] text-[20px] uppercase leading-none">Real change. Real impact.</p>
    </article>
  )
}

function FocusHero({ icon: Icon, label, value, copy }: { icon: typeof Clock3; label: string; value: string; copy: string }) {
  return (
    <article className="rounded-[18px] bg-[#070707] p-8 text-white shadow-[0_18px_44px_rgba(0,0,0,0.16)]">
      <span className="grid size-14 place-items-center rounded-full bg-[#dfff00] text-black">
        <Icon className="size-7" strokeWidth={2.4} />
      </span>
      <p className="mt-8 text-[13px] font-black uppercase text-white/65">{label}</p>
      <p className="mt-3 text-[clamp(3.6rem,7vw,6.4rem)] font-black leading-none tracking-[-0.08em] text-[#dfff00]">{value}</p>
      <p className="mt-6 max-w-[520px] text-[17px] font-semibold leading-[1.45] text-white/82">{copy}</p>
    </article>
  )
}

function ValueStat({ label, value, green = false, wide = false }: { label: string; value: string; green?: boolean; wide?: boolean }) {
  return (
    <div className={`min-w-0 rounded-[10px] bg-[#fbfbfa] px-3 py-3 text-center ${wide ? "col-span-2" : ""}`}>
      <p className="text-[10px] font-black uppercase leading-none">{label}</p>
      <p className={`mt-3 whitespace-nowrap text-[clamp(1.35rem,1.9vw,1.9rem)] font-black leading-none tracking-[-0.05em] ${green ? "text-[#009f19]" : ""}`}>{value}</p>
    </div>
  )
}

function BeforeAfterCard({ title, tone, rows, foot }: { title: string; tone: "before" | "after"; rows: [string, string, typeof Clock3][]; foot: string }) {
  const green = tone === "after"
  return (
    <article className={`rounded-[18px] p-7 shadow-[0_18px_44px_rgba(0,0,0,0.06)] xl:p-8 ${green ? "bg-[#fbfff0]" : "bg-white"}`}>
      <h2 className="inline-flex items-center gap-2 text-[15px] font-black uppercase xl:text-[16px]">{title} <Info className="size-4" /></h2>
      <div className="mt-7 grid gap-5">
        {rows.map(([label, value, Icon]) => (
          <div key={label} className="grid grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-4">
            <Icon className={`size-5 ${green ? "text-[#009f19]" : "text-black/60"}`} strokeWidth={2.1} />
            <p className="min-w-0 text-[14px] font-semibold leading-tight">{label}</p>
            <p className="whitespace-nowrap text-[19px] font-black tracking-[-0.04em] xl:text-[20px]">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-10 text-[14px] font-semibold leading-[1.45] text-black/68">{foot}</p>
    </article>
  )
}

function MetricCard({ metric, active, onClick }: { metric: ReturnType<typeof getGlance>[number]; active: boolean; onClick: () => void }) {
  const Icon = metric.icon
  return (
    <button type="button" onClick={onClick} className={`rounded-[16px] border bg-white p-6 text-left shadow-[0_14px_36px_rgba(0,0,0,0.045)] transition-all hover:-translate-y-0.5 ${active ? "border-[#dfff00] ring-4 ring-[#dfff00]/30" : "border-black/10"}`}>
      <span className="grid size-12 place-items-center rounded-full bg-[#dfff00]">
        <Icon className="size-6" strokeWidth={2.1} />
      </span>
      <p className="mt-5 text-[12px] font-black uppercase">{metric.label}</p>
      <p className="mt-2 text-[30px] font-black leading-none tracking-[-0.06em]">{metric.value} <span className="text-[18px]">{metric.suffix}</span></p>
      <p className="mt-4 text-[14px] font-semibold text-black/58">{metric.note}</p>
      <p className="mt-4 text-[13px] font-black text-[#009f19]">↑ {metric.delta}</p>
    </button>
  )
}

function ChartCard({ title, selected, suffix, points }: { title: string; selected: string; suffix: string; points: readonly number[] }) {
  const max = Math.max(...points, 300)
  const width = 520
  const height = 220
  const path = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width
    const y = height - (point / max) * (height - 18)
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(" ")
  const area = `${path} L ${width} ${height} L 0 ${height} Z`

  return (
    <article className="rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_14px_36px_rgba(0,0,0,0.045)]">
      <h2 className="text-[19px] font-black tracking-[-0.04em]">{title}</h2>
      <div className="relative mt-6 overflow-hidden rounded-[12px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[250px] w-full overflow-visible" role="img" aria-label={title}>
          <defs>
            <linearGradient id="v2DashboardChartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#dfff00" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#dfff00" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 100, 200, 300].map((line) => {
            const y = height - (line / max) * (height - 18)
            return (
              <g key={line}>
                <line x1="0" x2={width} y1={y} y2={y} stroke="rgba(0,0,0,.1)" />
                <text x="0" y={y - 6} fontSize="12" fontWeight="700" fill="rgba(0,0,0,.62)">{line}</text>
              </g>
            )
          })}
          <path d={area} fill="url(#v2DashboardChartFill)" />
          <path d={path} fill="none" stroke="#dfff00" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => {
            const x = (index / (points.length - 1)) * width
            const y = height - (point / max) * (height - 18)
            return <circle key={`${point}-${index}`} cx={x} cy={y} r={index % 3 === 0 || index === points.length - 1 ? 5 : 0} fill="#dfff00" stroke="#bfd800" strokeWidth="2" />
          })}
        </svg>
        <div className="absolute right-4 top-2 rounded-[12px] border border-[#dfff00] bg-white px-4 py-3 text-center shadow-[0_8px_18px_rgba(0,0,0,0.06)]">
          <p className="text-[15px] font-black">{selected} {suffix}</p>
          <p className="text-[11px] font-semibold text-black/62">Total to date</p>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-6 text-center text-[11px] font-semibold text-black/55">
        {["Nov '24", "Dec '24", "Jan '25", "Feb '25", "Mar '25", "Apr '25"].map((month) => <span key={month}>{month}</span>)}
      </div>
    </article>
  )
}

function SystemsCard({ activeSystem, onSelect }: { activeSystem: string; onSelect: (system: string) => void }) {
  return (
    <article className="rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_14px_36px_rgba(0,0,0,0.045)]">
      <h2 className="text-[19px] font-black tracking-[-0.04em]">Top systems driving results</h2>
      <div className="mt-7 grid gap-5">
        {systems.map((system) => (
          <button key={system.label} type="button" onClick={() => onSelect(system.label)} className="grid min-h-11 grid-cols-1 items-center gap-2 text-left sm:grid-cols-[1fr_128px_auto] sm:gap-4">
            <span className={`text-[13px] font-bold ${activeSystem === system.label ? "text-black" : "text-black/70"}`}>{system.label}</span>
            <span className="h-2 rounded-full bg-black/10">
              <span className="block h-full rounded-full bg-[#dfff00]" style={{ width: `${system.value}%` }} />
            </span>
            <span className="text-[12px] font-black">{system.metric}</span>
          </button>
        ))}
      </div>
      <a href="/ops/how-it-works" className="mt-8 inline-flex min-h-11 items-center gap-4 text-[13px] font-black">
        View all systems <ArrowRight className="size-4" />
      </a>
    </article>
  )
}

function ScoreCard({ system, metric }: { system: string; metric: string }) {
  return (
    <article className="rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_14px_36px_rgba(0,0,0,0.045)]">
      <h2 className="text-[19px] font-black tracking-[-0.04em]">Your performance score</h2>
      <div className="mt-7 grid gap-7 md:grid-cols-[150px_1fr] md:items-center">
        <div className="relative grid size-[150px] place-items-center rounded-full bg-[conic-gradient(#dfff00_0_82%,#f1f5d7_82%_100%)]">
          <div className="grid size-[112px] place-items-center rounded-full bg-white">
            <p className="text-[43px] font-black tracking-[-0.08em]">A+</p>
          </div>
        </div>
        <div className="grid gap-3">
          {["Time Savings", "Customer Response", "Reviews", "Lead Recovery", "Overall Impact"].map((item, index) => (
            <p key={item} className="flex items-center justify-between gap-4 text-[13px] font-semibold">
              {item}
              <span className="flex gap-1 text-[#dfff00]">
                {Array.from({ length: 5 }).map((_, starIndex) => <Star key={starIndex} className={`size-4 ${index === 2 && starIndex === 4 ? "" : "fill-current"}`} strokeWidth={2.2} />)}
              </span>
            </p>
          ))}
        </div>
      </div>
      <div className="mt-7 rounded-[12px] bg-[#f5f9df] p-5">
        <p className="flex gap-3 text-[13px] font-semibold leading-[1.45]">
          <Star className="mt-0.5 size-5 shrink-0 text-[#c8e300]" strokeWidth={2.3} />
          Excellent work. {system} is currently driving {metric}, and your systems are performing exceptionally well.
        </p>
      </div>
    </article>
  )
}

function DataTable({ title, columns, rows }: { title: string; columns: string[]; rows: readonly (readonly string[])[] }) {
  return (
    <article className="overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-[0_14px_36px_rgba(0,0,0,0.045)]">
      <div className="border-b border-black/10 p-6">
        <h2 className="text-[20px] font-black tracking-[-0.04em]">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead className="bg-[#f7f7f3] text-[11px] font-black uppercase text-black/55">
            <tr>{columns.map((column) => <th key={column} className="px-5 py-4">{column}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-black/10 text-[13px] font-bold">
            {rows.map((row) => (
              <tr key={row.join("-")}>{row.map((cell, index) => <td key={cell} className={`px-5 py-4 ${index === row.length - 1 ? "text-[#009f19]" : ""}`}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function SimpleList({ title, items }: { title: string; items: readonly (readonly string[])[] }) {
  return (
    <article className="rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_14px_36px_rgba(0,0,0,0.045)]">
      <h2 className="text-[20px] font-black tracking-[-0.04em]">{title}</h2>
      <div className="mt-6 grid gap-3">
        {items.map(([label, value]) => (
          <p key={label} className="flex items-center justify-between gap-4 rounded-[12px] bg-[#f7f7f3] px-4 py-3 text-[13px] font-bold">
            <span>{label}</span>
            <span className="text-[#009f19]">{value}</span>
          </p>
        ))}
      </div>
    </article>
  )
}

function FunnelCard() {
  const steps = [["Enquiries", 417], ["Replied", 389], ["Booked", 94], ["Customers", 34]] as const
  return (
    <article className="rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_14px_36px_rgba(0,0,0,0.045)]">
      <h2 className="text-[20px] font-black tracking-[-0.04em]">Customer flow</h2>
      <div className="mt-7 grid gap-4">
        {steps.map(([label, value], index) => (
          <div key={label} className="grid grid-cols-[100px_1fr_60px] items-center gap-4">
            <p className="text-[13px] font-black">{label}</p>
            <span className="h-4 rounded-full bg-black/10">
              <span className="block h-full rounded-full bg-[#dfff00]" style={{ width: `${Math.max(18, 100 - index * 22)}%` }} />
            </span>
            <p className="text-right text-[18px] font-black">{value}</p>
          </div>
        ))}
      </div>
    </article>
  )
}

function SourceCard() {
  return (
    <article className="rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_14px_36px_rgba(0,0,0,0.045)]">
      <h2 className="text-[20px] font-black tracking-[-0.04em]">Sources creating demand</h2>
      <div className="mt-7 grid gap-4">
        {sources.map(([source, enquiries]) => (
          <div key={source}>
            <div className="flex justify-between text-[13px] font-black">
              <span>{source}</span>
              <span>{enquiries} enquiries</span>
            </div>
            <span className="mt-2 block h-3 rounded-full bg-black/10">
              <span className="block h-full rounded-full bg-[#dfff00]" style={{ width: `${Math.min(100, enquiries / 1.6)}%` }} />
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}

function ProjectionCard({ current }: { current: number }) {
  return (
    <article className="rounded-[18px] border border-black/10 bg-[#070707] p-6 text-white shadow-[0_14px_36px_rgba(0,0,0,0.12)]">
      <h2 className="text-[20px] font-black tracking-[-0.04em]">Projected annual recovery</h2>
      <p className="mt-7 text-[clamp(3rem,6vw,5rem)] font-black leading-none tracking-[-0.08em] text-[#dfff00]">£{(current * 12).toLocaleString()}</p>
      <p className="mt-5 max-w-[360px] text-[14px] font-semibold leading-[1.45] text-white/72">Based on this month continuing at the same rate. Figures stay visible so assumptions can be challenged.</p>
    </article>
  )
}

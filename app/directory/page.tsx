import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { SitesFooter, SitesHeader, SitesPage, Underline } from "../sites/_components/SitesPrimitives"

export const metadata: Metadata = {
  title: "Directory | Sorted",
  description: "Every part of Sorted, linked in one place — public pages, client hubs, decks and internal tools.",
  robots: { index: false, follow: false },
}

type Item = {
  label: string
  href: string
  note?: string
  code?: string
}

type Group = {
  id: string
  title: string
  blurb: string
  items: Item[]
}

const groups: Group[] = [
  {
    id: "front-door",
    title: "Front door",
    blurb: "Where every visitor starts.",
    items: [
      { label: "Switchboard — “Where’s your business getting stuck?”", href: "/", note: "Routes visitors to the right service" },
    ],
  },
  {
    id: "websites",
    title: "Websites",
    blurb: "The build-first website service. See the page, then decide.",
    items: [
      { label: "Websites home", href: "/websites", note: "Main service page" },
      { label: "How we work", href: "/howitworks", note: "The process explained" },
      { label: "Pricing", href: "/pricing", note: "£999 UK / $1,299 US, fixed scope" },
      { label: "Our work", href: "/examples", note: "Portfolio of client sites" },
      { label: "What we improve", href: "/what-else-we-do", note: "Turning visitors into enquiries, with Facebook and Instagram ad creatives" },
      { label: "Content editing", href: "/website-updates", note: "What clients can edit after launch" },
      { label: "Free website (US)", href: "/free-website", note: "US-specific landing page" },
    ],
  },
  {
    id: "assistants",
    title: "AI assistants",
    blurb: "A tailored AI assistant that does real work for a business.",
    items: [
      { label: "Assistants home", href: "/assistants", note: "Now the homepage" },
      { label: "How it works", href: "/assistants#try", note: "One job, one result" },
      { label: "Assistants pricing", href: "/assistants/pricing" },
      { label: "About us", href: "/assistants/about" },
    ],
  },
  {
    id: "partners",
    title: "Partners",
    blurb: "The referral programme — partners earn £75–£300 per website.",
    items: [
      { label: "Partners home", href: "/partners", note: "Public pitch" },
      { label: "Apply", href: "/partners/apply" },
      { label: "Partner login", href: "/partners/login", note: "Each partner signs in with their own email + password" },
      { label: "Partner dashboard", href: "/partners/dashboard", note: "Referrals & earnings (login required)" },
      { label: "What you earn", href: "/partners/what-you-earn", note: "Commission tiers" },
      { label: "Selling Sorted", href: "/partners/selling-sorted", note: "The partner playbook" },
      { label: "Enterprise briefing", href: "/partners/enterprise-deck", note: "Manufacturing infrastructure deck" },
    ],
  },
  {
    id: "decks",
    title: "Decks & handbook",
    blurb: "How the business is presented and run.",
    items: [
      { label: "Outreach deck", href: "/outreach-deck", note: "How Sorted finds prospects and manufactures proof" },
      { label: "Enterprise deck", href: "/partners/enterprise-deck", note: "Private partner briefing" },
      { label: "Sorted OS", href: "/sorted-os", note: "The full operating handbook", code: "sorted2026" },
      { label: "Brand", href: "/brand", note: "Design & voice reference" },
    ],
  },
  {
    id: "client-hubs",
    title: "Client hubs",
    blurb: "What a client sees once work is underway.",
    items: [
      { label: "Client workspace", href: "/workspace?slug=joshi-accounting-services", note: "Each client gets their own link — example shown: Joshi Accounting" },
      { label: "SortedUpdates", href: "/sorted-updates", note: "The content editor included with every site" },
      { label: "Ad review portal", href: "/ads", note: "Where clients approve campaigns — each client has their own access code" },
    ],
  },
  {
    id: "proposals",
    title: "Proposal examples",
    blurb: "Pre-delivery pages shown to a prospect before they pay. Passwords included.",
    items: [
      { label: "School of Skill", href: "/proposals/school-of-skill", code: "sos2026" },
      { label: "Raffles Restaurant", href: "/proposals/raffles-restaurant", code: "raffles2026" },
      { label: "Party World", href: "/proposals/party-world", code: "thepresidents" },
      { label: "Edgbaston Tuition Centre", href: "/proposals/edgbaston-tuition-centre", code: "edgbaston2026" },
      { label: "Sebastian MD", href: "/proposals/sebastian-md", code: "sebastian2026" },
      { label: "Shropshire Tents", href: "/proposals/shropshire-tents", code: "shropshire2026" },
    ],
  },
  {
    id: "deliveries",
    title: "Delivery examples",
    blurb: "“You’ve Been Sorted” pages — what a client sees at handover.",
    items: [
      { label: "Savannah Villegas", href: "/clients/savannah-villegas", code: "savannah2026" },
      { label: "BodySharp Fitness", href: "/clients/bodysharp", code: "mikey2026" },
      { label: "Gracie Barra Halesowen", href: "/clients/gb-halesowen", code: "gracie2026" },
      { label: "Derma Botanica", href: "/clients/derma-botanica", code: "derma2026" },
      { label: "Feroza", href: "/clients/feroza", code: "feroza2026" },
      { label: "Roye Abramson", href: "/clients/roye-abramson", code: "roye2026" },
      { label: "Advocate Better Care", href: "/clients/advocate-better-care", code: "mark2026" },
      { label: "Sandra", href: "/clients/sandra", code: "sandra2026" },
      { label: "Warwickshire STR", href: "/clients/warwickshire-str", note: "Open — no password" },
      { label: "Raffles Malaysian", href: "/clients/raffles-malaysian-restaurant", note: "Open — no password" },
    ],
  },
  {
    id: "back-office",
    title: "Back office",
    blurb: "Internal tools — keep these private.",
    items: [
      { label: "Prospect Finder", href: "/operators/prospect-finder", note: "Sourcing dashboard", code: "sorted2026" },
      { label: "Scorecard", href: "/operators/scorecard", code: "sorted2026" },
      { label: "Costs", href: "/operators/costs", code: "sorted2026" },
    ],
  },
]

const navLabels: Record<string, string> = {
  "AI automation": "Automation",
  "Decks & handbook": "Decks",
  "Proposal examples": "Proposals",
  "Delivery examples": "Deliveries",
}
const navLinks = groups.map((g) => [g.id, navLabels[g.title] ?? g.title, `#${g.id}`] as const)

export default function DirectoryPage() {
  return (
    <SitesPage>
      <SitesHeader links={navLinks} bare logoHref="/directory" />

      <section className="mx-auto max-w-[1220px] px-5 pb-8 pt-14 sm:px-8 sm:pt-20">
        <p className="text-[12px] font-black uppercase tracking-[0.16em] text-black/45">Sorted · Directory</p>
        <h1 className="mt-4 max-w-[720px] text-[clamp(3rem,4.8vw,4.8rem)] font-black leading-[0.94] tracking-[-0.05em]">
          Everything, linked.
        </h1>
        <Underline className="mt-5 w-[min(280px,72vw)]" />
        <p className="mt-6 max-w-[560px] text-[16px] font-semibold leading-[1.6] tracking-[-0.02em] text-black/72">
          One page for every public page, client hub, deck and internal tool in Sorted.
          Passwords are shown where a page needs one — share carefully, this page is not public.
        </p>

        <div className="mt-10 grid gap-px overflow-hidden rounded-[18px] bg-black/10 sm:grid-cols-3">
          {[
            ["What we sell", "Websites for local businesses, built before payment. We show the finished page first, bundled with social media ad creatives. The client decides after seeing it."],
            ["What it fixes", "A business that looks trustworthy gets more enquiries. Better design, real proof, and an easy way to get in touch."],
            ["Where it goes next", "Winning enquiries is half the job. We then help clients handle them, from replies and quotes to follow-ups and payments, through automation."],
          ].map(([title, copy]) => (
            <div key={title} className="bg-[#f7f1e8] p-6">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-black/45">{title}</p>
              <p className="mt-3 text-[15px] font-semibold leading-[1.55] text-black/75">{copy}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[18px] font-black tracking-[-0.02em]">
          More trust → more enquiries → more customers.
        </p>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 pb-20 sm:px-8">
        <div className="grid gap-12">
          {groups.map((group, gi) => (
            <div key={group.title} id={group.id} className="scroll-mt-24">
              <div className="flex items-end justify-between gap-6 border-b border-black/12 pb-5">
                <div>
                  <p className="text-[12px] font-black text-black/35">{String(gi + 1).padStart(2, "0")}</p>
                  <h2 className="mt-1 text-[clamp(1.7rem,3vw,2.4rem)] font-black leading-none tracking-[-0.045em]">{group.title}</h2>
                  <p className="mt-2 max-w-[560px] text-[14px] font-semibold leading-[1.5] text-black/62">{group.blurb}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <a
                    key={item.href + item.label}
                    href={item.href}
                    className="group flex flex-col justify-between gap-3 rounded-[14px] border border-black/10 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-black/25 hover:shadow-[0_14px_40px_rgba(0,0,0,0.08)]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[15px] font-black leading-[1.2] tracking-[-0.02em]">{item.label}</h3>
                        <ArrowUpRight className="size-4 shrink-0 text-black/35 transition-colors group-hover:text-black" strokeWidth={2.6} />
                      </div>
                      {item.note ? (
                        <p className="mt-1.5 text-[13px] font-semibold leading-[1.45] text-black/62">{item.note}</p>
                      ) : null}
                    </div>
                    {item.code ? (
                      <span className="inline-flex w-fit items-center rounded-lg bg-[#070707] px-2.5 py-1 font-mono text-[12px] font-bold text-[#dfff00]">
                        {item.code}
                      </span>
                    ) : null}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SitesFooter />
    </SitesPage>
  )
}

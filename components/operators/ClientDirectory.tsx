"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { CLIENTS, docSignSlug, type ClientDoc, type ClientRecord, type ClientDocType } from "@/lib/clientDirectory"
import { getAllAgreements, type Agreement } from "@/lib/agreements"

type ProspectMatch = {
  crm_status: string
  review_slug: string | null
}

type Filter = "all" | "signed" | "awaiting" | "proposal" | "post-sale"

const DOC_TYPE_ORDER: ClientDocType[] = ["proposal", "agreement", "quote", "delivery", "invoice", "checklist"]

const CRM_LABELS: Record<string, string> = {
  new: "New",
  outreached: "Outreached",
  responded: "Responded",
  mockup_revealed: "Mockup Revealed",
  build: "Build",
  quote: "Quote",
  paid: "Paid",
  lost: "Lost",
  na: "N/A",
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function ClientDirectory() {
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [prospects, setProspects] = useState<Record<string, ProspectMatch>>({})
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [agreementsData, { data: prospectData }] = await Promise.all([
        getAllAgreements(),
        supabase
          .from("prospects")
          .select("name, crm_status, review_slug")
          .not("crm_status", "in", '("new","lost","na")'),
      ])

      setAgreements(agreementsData)

      const map: Record<string, ProspectMatch> = {}
      for (const p of prospectData ?? []) {
        if (p.name) map[normalise(p.name)] = { crm_status: p.crm_status, review_slug: p.review_slug }
      }
      setProspects(map)
      setLoading(false)
    }
    load()
  }, [])

  // Latest signature per doc slug
  const latestBySlug = useMemo(() => {
    const map = new Map<string, Agreement>()
    for (const a of agreements) {
      if (!map.has(a.slug)) map.set(a.slug, a)
    }
    return map
  }, [agreements])

  function prospectFor(client: ClientRecord): ProspectMatch | null {
    const key = normalise(client.prospectName ?? client.name)
    return prospects[key] ?? null
  }

  function clientSignature(client: ClientRecord): Agreement | null {
    // A client counts as signed if any of its signable docs has a signature
    for (const doc of client.docs) {
      if (!doc.signable) continue
      const a = latestBySlug.get(docSignSlug(doc))
      if (a) return a
    }
    return null
  }

  const filtered = useMemo(() => {
    const q = normalise(query)
    return CLIENTS.filter((client) => {
      if (q && !normalise(client.name).includes(q) && !client.slug.includes(q)) return false
      const sig = clientSignature(client)
      const hasProposal = client.docs.some((d) => d.type === "proposal")
      const hasPostSale = client.docs.some((d) => d.type !== "proposal")
      switch (filter) {
        case "signed": return sig !== null
        case "awaiting": return client.docs.some((d) => d.signable) && sig === null
        case "proposal": return hasProposal && !hasPostSale
        case "post-sale": return hasPostSale
        default: return true
      }
    })
  }, [query, filter, latestBySlug, prospects])

  async function copyPath(path: string) {
    const url = `https://sortmydigital.site${path}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(path)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // clipboard unavailable — no-op
    }
  }

  if (loading) {
    return (
      <main className="max-w-[680px] mx-auto px-6 sm:px-10 pt-16 pb-32">
        <div className="flex justify-center pt-24">
          <div className="w-5 h-5 border-2 border-black/[0.1] border-t-[#0A0A0A] rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  const signedCount = CLIENTS.filter((c) => clientSignature(c) !== null).length

  return (
    <main className="max-w-[680px] mx-auto px-6 sm:px-10 pt-16 pb-32">

      {/* Meta label */}
      <div className="mb-14">
        <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-1">
          Client Directory
        </p>
        <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">
          Every client URL — proposals, agreements, deliveries
        </p>
      </div>

      <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-4">
        Clients.
      </h1>
      <p className="text-[#525252] text-lg leading-relaxed mb-10">
        {CLIENTS.length} clients · {agreements.length} signature{agreements.length === 1 ? "" : "s"} on record · {signedCount} signed
      </p>

      {/* Search + filters */}
      <div className="mb-10 space-y-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients…"
          className="w-full px-4 py-3 bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/[0.3] transition-colors"
        />
        <div className="flex flex-wrap gap-2">
          {([
            ["all", "All"],
            ["signed", "Signed"],
            ["awaiting", "Awaiting signature"],
            ["proposal", "Proposal stage"],
            ["post-sale", "Post-sale"],
          ] as [Filter, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                filter === value
                  ? "bg-[#0A0A0A] text-[#FAFAFA]"
                  : "text-[#525252] hover:text-[#0A0A0A] hover:bg-black/[0.05] border border-black/[0.08]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Client cards */}
      <div className="space-y-6">
        {filtered.map((client) => (
          <ClientCard
            key={client.slug}
            client={client}
            prospect={prospectFor(client)}
            latestBySlug={latestBySlug}
            copied={copied}
            onCopy={copyPath}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-[#A3A3A3] py-8 text-center">No clients match.</p>
        )}
      </div>
    </main>
  )
}

function ClientCard({
  client,
  prospect,
  latestBySlug,
  copied,
  onCopy,
}: {
  client: ClientRecord
  prospect: ProspectMatch | null
  latestBySlug: Map<string, Agreement>
  copied: string | null
  onCopy: (path: string) => void
}) {
  const docs = [...client.docs].sort(
    (a, b) => DOC_TYPE_ORDER.indexOf(a.type) - DOC_TYPE_ORDER.indexOf(b.type)
  )

  return (
    <div className="bg-white border border-black/[0.08] rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-sans font-bold text-[#0A0A0A] text-lg tracking-tight">{client.name}</h2>
          <p className="font-mono text-[11px] text-[#C4C4C4] mt-0.5">{client.slug}</p>
        </div>
        {prospect && (
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#737373] bg-black/[0.04] px-2.5 py-1 rounded-md shrink-0">
            {CRM_LABELS[prospect.crm_status] ?? prospect.crm_status}
          </span>
        )}
      </div>

      {/* Docs */}
      <div className="border-t border-black/[0.06]">
        {docs.map((doc) => (
          <DocRow
            key={doc.path}
            doc={doc}
            agreement={latestBySlug.get(docSignSlug(doc)) ?? null}
            copied={copied === doc.path}
            onCopy={() => onCopy(doc.path)}
          />
        ))}

        {/* Review page (from prospect match) */}
        {prospect?.review_slug && (
          <DocRow
            doc={{ type: "proposal", label: "Review Page", path: `/review/${prospect.review_slug}` }}
            agreement={null}
            copied={copied === `/review/${prospect.review_slug}`}
            onCopy={() => onCopy(`/review/${prospect.review_slug}`)}
            suppressSignature
          />
        )}

        {/* Live site */}
        {client.liveUrl && (
          <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-black/[0.06]">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#A3A3A3] w-20 shrink-0">
                Live site
              </span>
              <a
                href={client.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#0A0A0A] font-medium truncate hover:underline"
              >
                {client.liveUrl.replace(/^https?:\/\//, "")}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DocRow({
  doc,
  agreement,
  copied,
  onCopy,
  suppressSignature = false,
}: {
  doc: ClientDoc
  agreement: Agreement | null
  copied: boolean
  onCopy: () => void
  suppressSignature?: boolean
}) {
  return (
    <div className="px-6 py-3 border-t border-black/[0.06] first:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#A3A3A3] w-20 shrink-0">
            {doc.type}
          </span>
          <a
            href={doc.path}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[#0A0A0A] font-medium truncate hover:underline"
          >
            {doc.label}
          </a>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {doc.password && (
            <span className="font-mono text-[11px] text-[#737373] bg-black/[0.04] px-2 py-0.5 rounded" title="Page password">
              {doc.password}
            </span>
          )}
          <button
            onClick={onCopy}
            className="text-[11px] font-medium text-[#737373] hover:text-[#0A0A0A] px-2 py-1 rounded transition-colors"
          >
            {copied ? "Copied" : "Copy URL"}
          </button>
        </div>
      </div>
      {doc.signable && !suppressSignature && (
        <div className="mt-1.5 ml-[5.75rem]">
          {agreement ? (
            <p className="text-xs text-green-700">
              Signed by {agreement.signer_name} · {formatDate(agreement.signed_at)}
            </p>
          ) : (
            <p className="text-xs text-amber-600">Awaiting signature</p>
          )}
        </div>
      )}
    </div>
  )
}

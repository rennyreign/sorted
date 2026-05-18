import { demoSession } from "@/lib/sorted-updates"

export default async function SortedHistoryPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const response = await fetch(`${baseUrl}/api/sorted-updates/history?client_id=${demoSession.client_id}`, {
    cache: "no-store",
  }).catch(() => null)
  const payload = response ? await response.json() : { changes: [] }
  const changes = Array.isArray(payload.changes) ? payload.changes : []

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-6 py-10 text-[#171411]">
      <div className="mx-auto max-w-4xl">
        <a href="/sorted/chat" className="text-sm font-bold text-[#756c5f]">Back to chat</a>
        <h1 className="mt-6 text-4xl font-black tracking-tight">Change history</h1>
        <div className="mt-8 space-y-3">
          {changes.length === 0 ? (
            <div className="rounded-3xl border border-black/10 bg-white p-6 text-sm text-[#756c5f]">
              No recorded changes yet. History appears here once the operator backend is connected and requests are processed.
            </div>
          ) : (
            changes.map((change: { change_id: string; status: string; summary: string; preview_url?: string }) => (
              <article key={change.change_id} className="rounded-3xl border border-black/10 bg-white p-6">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#756c5f]">{change.status}</p>
                <h2 className="mt-2 text-lg font-black">{change.summary}</h2>
                {change.preview_url ? <a className="mt-3 inline-block text-sm font-bold" href={change.preview_url}>Open preview</a> : null}
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

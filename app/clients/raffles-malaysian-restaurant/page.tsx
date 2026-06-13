import { Download } from "lucide-react"

const PDF_URL = "/invoices/raffles-malaysian-restaurant-social-media-setup.pdf"

const paymentRows = [
  ["Name", "Renaldo Lee Edmondson"],
  ["Account number", "17897633"],
  ["Sort code", "23-14-70"],
  ["Bank", "Wise Payments Limited"],
  ["Bank address", "1st Floor, Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom"],
]

export default function RafflesInvoicePage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-8 text-[#0A0A0A] sm:px-10">
      <div className="mx-auto max-w-[760px]">
        <header className="mb-12">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-[#737373]">Quote + invoice</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Raffles Malaysian Restaurant</h1>
        </header>

        <section className="mb-8 rounded-lg border border-black/[0.08] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex flex-col gap-4 border-b border-black/[0.08] pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#737373]">Invoice</p>
              <p className="mt-2 text-lg font-bold">SORTED-RAFFLES-004</p>
            </div>
            <div className="text-sm leading-6 text-[#525252] sm:text-right">
              <p>Issued: 12 June 2026</p>
              <p>Due: On receipt</p>
            </div>
          </div>

          <div className="mb-8 overflow-hidden rounded-lg border border-black/[0.08]">
            <div className="grid grid-cols-[1fr_auto] bg-[#F5F5F2] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#737373]">
              <span>Line item</span>
              <span>Amount</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-6 px-4 py-5 text-sm">
              <div>
                <p className="font-semibold text-[#0A0A0A]">Social media setup</p>
                <p className="mt-1 text-[#737373]">One-off setup service for Raffles Malaysian Restaurant.</p>
              </div>
              <p className="font-mono font-semibold">£150.00</p>
            </div>
            <div className="grid grid-cols-[1fr_auto] border-t border-black/[0.08] px-4 py-4">
              <p className="font-semibold">Total due</p>
              <p className="font-mono text-xl font-bold">£150.00</p>
            </div>
          </div>

          <a
            href={PDF_URL}
            download
            className="inline-flex items-center gap-2 rounded-lg bg-[#0A0A0A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
          >
            <Download size={17} aria-hidden="true" />
            Download PDF
          </a>
        </section>

        <section className="mb-10 rounded-lg border border-black/[0.08] bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.15em] text-[#737373]">Payment details</p>
          <div className="space-y-3 text-sm">
            {paymentRows.map(([label, value]) => (
              <div key={label} className="grid gap-1 border-b border-black/[0.06] pb-3 last:border-0 last:pb-0 sm:grid-cols-[150px_1fr]">
                <span className="text-[#737373]">{label}</span>
                <span className="font-medium text-[#0A0A0A]">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-[#737373]">
            Please use the account number and sort code for UK bank transfer payments.
          </p>
        </section>

        <footer className="pb-12 text-sm leading-6 text-[#737373]">
          <p>Quote prepared by Sorted for Raffles Malaysian Restaurant.</p>
        </footer>
      </div>
    </main>
  )
}

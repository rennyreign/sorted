import Link from "next/link";
import { Plus } from "lucide-react";
import { Container, PageHeader, PrimaryLink, EmptyState } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";
import { getInvoices, getDashboardStats, getSettings } from "@/lib/data";
import { formatMoney } from "@/lib/currencies";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function InvoiceLogPage() {
  const invoices = getInvoices();
  const stats = getDashboardStats();
  const settings = getSettings();

  const statCards = [
    { label: "Invoices", value: String(stats.total) },
    {
      label: "Outstanding",
      value: formatMoney(stats.outstanding, settings.default_currency),
      hint: "sent + overdue",
    },
    { label: "Paid", value: String(stats.paidCount) },
    { label: "Drafts", value: String(stats.draftCount) },
  ];

  return (
    <Container>
      <PageHeader
        label="SortedInvoice"
        title="Invoices"
        action={
          <PrimaryLink href="/invoices/new">
            <Plus size={16} strokeWidth={2.4} />
            New invoice
          </PrimaryLink>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-black/[0.08] bg-white p-5"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#A3A3A3]">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
              {card.value}
            </p>
            {card.hint && (
              <p className="mt-1 text-[11px] text-[#A3A3A3]">{card.hint}</p>
            )}
          </div>
        ))}
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          body="Create your first invoice to start keeping a log of digital service work."
          action={
            <PrimaryLink href="/invoices/new">
              <Plus size={16} strokeWidth={2.4} />
              New invoice
            </PrimaryLink>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.08]">
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                  Invoice
                </th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                  Client
                </th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                  Issued
                </th>
                <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                  Status
                </th>
                <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-black/[0.05] last:border-0 hover:bg-black/[0.015] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="font-mono text-sm font-medium text-[#0A0A0A] hover:underline"
                    >
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#525252]">
                    {inv.client_name}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#737373]">
                    {formatDate(inv.issue_date)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-sm font-medium text-[#0A0A0A] tabular-nums">
                    {formatMoney(inv.total, inv.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}

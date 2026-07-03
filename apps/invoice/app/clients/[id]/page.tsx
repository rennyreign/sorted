import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { Container, PageHeader, EmptyState } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";
import DeleteClientButton from "@/components/DeleteClientButton";
import {
  getClient,
  getInvoicesForClient,
  clientHasInvoices,
} from "@/lib/data";
import { formatMoney } from "@/lib/currencies";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clientId = Number(id);
  const client = getClient(clientId);
  if (!client) notFound();

  const invoices = getInvoicesForClient(clientId);
  const hasInvoices = clientHasInvoices(clientId);

  return (
    <Container>
      <PageHeader
        label="Client"
        title={client.name}
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`/clients/${client.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-black/[0.12] px-4 py-2 text-sm font-medium text-[#525252] hover:bg-black/[0.02] transition-colors"
            >
              <Pencil size={15} />
              Edit
            </Link>
            <DeleteClientButton id={client.id} disabled={hasInvoices} />
          </div>
        }
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-black/[0.08] bg-white p-5 text-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
            Details
          </p>
          <dl className="mt-3 space-y-1.5">
            {client.contact_name && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[#A3A3A3]">Contact</dt>
                <dd className="text-[#0A0A0A]">{client.contact_name}</dd>
              </div>
            )}
            {client.email && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[#A3A3A3]">Email</dt>
                <dd className="text-[#0A0A0A]">{client.email}</dd>
              </div>
            )}
            {client.address && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[#A3A3A3]">Address</dt>
                <dd className="whitespace-pre-line text-[#0A0A0A]">
                  {client.address}
                </dd>
              </div>
            )}
          </dl>
        </div>
        {client.notes && (
          <div className="rounded-xl border border-black/[0.08] bg-white p-5 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
              Notes
            </p>
            <p className="mt-3 whitespace-pre-line text-[#525252]">
              {client.notes}
            </p>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold tracking-tight text-[#0A0A0A] text-lg">
          Invoices
        </h2>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0A0A0A] hover:underline"
        >
          <Plus size={15} strokeWidth={2.2} />
          New invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices for this client"
          body="Invoices you raise for this client will show up here."
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

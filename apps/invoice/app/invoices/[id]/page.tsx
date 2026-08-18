import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFullInvoice } from "@/lib/data";
import { formatMoney, getCurrency } from "@/lib/currencies";
import { formatDate, STATUS_LABELS } from "@/lib/format";
import InvoiceActions from "@/components/InvoiceActions";

export const dynamic = "force-dynamic";

export default async function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = getFullInvoice(Number(id));
  if (!data) notFound();

  const { invoice, client, items, bankAccount, company, totals } = data;
  const currency = getCurrency(invoice.currency);

  const bankRows: [string, string, string?][] = bankAccount
    ? ([
        ["Bank", bankAccount.bank_name],
        ["Account name", bankAccount.account_name],
        ["Account number", bankAccount.account_number],
        ["Account type", bankAccount.account_type],
        ["Routing number", bankAccount.routing, "For wire & ACH"],
        ["IBAN", bankAccount.iban],
        ["SWIFT / BIC", bankAccount.swift],
        ["Bank address", bankAccount.bank_address],
      ].filter(([, v]) => v && v.trim() !== "") as [string, string, string?][])
    : [];

  return (
    <div className="mx-auto max-w-3xl px-6 sm:px-10 py-10 sm:py-14">
      {/* Toolbar */}
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] hover:text-[#0A0A0A]"
          >
            ← Invoices
          </Link>
          <p className="mt-2 font-mono text-lg font-medium text-[#0A0A0A]">
            {invoice.invoice_number}
          </p>
        </div>
        <InvoiceActions id={invoice.id} status={invoice.status} />
      </div>

      {/* Printable invoice */}
      <article className="print-area rounded-2xl border border-black/[0.08] bg-white p-8 sm:p-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#A3A3A3]">
              Invoice
            </p>
            <h1 className="mt-2 font-extrabold tracking-tight text-[#0A0A0A] text-3xl">
              {invoice.invoice_number}
            </h1>
            <p className="mt-2 text-sm text-[#737373]">
              Status: {STATUS_LABELS[invoice.status]}
            </p>
          </div>
          {invoice.show_company_name === 1 && company.company_name && (
            <div className="text-right">
              {company.company_logo ? (
                <Image
                  src={company.company_logo}
                  alt={company.company_name}
                  width={160}
                  height={56}
                  className="ml-auto h-14 w-auto object-contain"
                  unoptimized
                />
              ) : (
                <p className="font-extrabold tracking-tight text-[#0A0A0A] text-xl">
                  {company.company_name}
                </p>
              )}
              {company.company_email && (
                <p className="mt-1 text-sm text-[#737373]">
                  {company.company_email}
                </p>
              )}
              {company.company_address && (
                <p className="mt-1 whitespace-pre-line text-sm text-[#737373]">
                  {company.company_address}
                </p>
              )}
              {company.company_registration && (
                <p className="mt-1 text-xs text-[#A3A3A3]">
                  {company.company_registration}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bill to + dates */}
        <div className="mt-10 grid grid-cols-2 gap-6 border-t border-black/[0.08] pt-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
              Billed to
            </p>
            <p className="mt-2 font-semibold text-[#0A0A0A]">{client.name}</p>
            {client.contact_name && (
              <p className="text-sm text-[#737373]">{client.contact_name}</p>
            )}
            {client.email && (
              <p className="text-sm text-[#737373]">{client.email}</p>
            )}
            {client.address && (
              <p className="mt-1 whitespace-pre-line text-sm text-[#737373]">
                {client.address}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="mb-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                Issue date
              </p>
              <p className="text-sm text-[#0A0A0A]">
                {formatDate(invoice.issue_date)}
              </p>
            </div>
            <div className="mb-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                Due date
              </p>
              <p className="text-sm text-[#0A0A0A]">
                {formatDate(invoice.due_date)}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                Currency
              </p>
              <p className="text-sm text-[#0A0A0A]">
                {currency.code} — {currency.name}
              </p>
            </div>
          </div>
        </div>

        {/* Line items */}
        <table className="mt-8 w-full text-left">
          <thead>
            <tr className="border-b border-black/[0.12]">
              <th className="w-full pb-2 pr-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                Description
              </th>
              <th className="pb-2 pl-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] whitespace-nowrap">
                Unit
              </th>
              <th className="pb-2 pl-4 text-right font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] whitespace-nowrap">
                Qty
              </th>
              <th className="pb-2 pl-4 text-right font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] whitespace-nowrap">
                Rate
              </th>
              <th className="pb-2 pl-4 text-right font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] whitespace-nowrap">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-black/[0.06]">
                <td className="py-3 pr-4 text-sm text-[#0A0A0A]">
                  {item.description}
                </td>
                <td className="py-3 pl-4 text-sm text-[#737373] whitespace-nowrap">{item.unit}</td>
                <td className="py-3 pl-4 text-right font-mono text-sm text-[#525252] tabular-nums whitespace-nowrap">
                  {item.quantity}
                </td>
                <td className="py-3 pl-4 text-right font-mono text-sm text-[#525252] tabular-nums whitespace-nowrap">
                  {formatMoney(item.unit_price, invoice.currency)}
                </td>
                <td className="py-3 pl-4 text-right font-mono text-sm text-[#0A0A0A] tabular-nums whitespace-nowrap">
                  {formatMoney(
                    item.quantity * item.unit_price,
                    invoice.currency,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-[#737373]">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">
                {formatMoney(totals.subtotal, invoice.currency)}
              </span>
            </div>
            {invoice.tax_rate > 0 && (
              <div className="flex justify-between text-[#737373]">
                <span>Tax ({invoice.tax_rate}%)</span>
                <span className="font-mono tabular-nums">
                  {formatMoney(totals.tax, invoice.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between rounded-lg bg-[#0A0A0A] px-4 py-3 font-semibold text-[#FAFAFA]">
              <span>Total due</span>
              <span className="font-mono tabular-nums">
                {formatMoney(totals.total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Bank details + notes */}
        {(bankRows.length > 0 || invoice.notes) && (
          <div className="mt-10 border-t border-black/[0.08] pt-6">
            {bankRows.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                  Payment details
                </p>
                <dl className="mt-3 grid grid-cols-[8rem_1fr] gap-y-2.5 text-sm sm:grid-cols-[10rem_1fr]">
                  {bankRows.map(([k, v, caption]) => (
                    <Fragment key={k}>
                      <dt className="pr-4 text-[#A3A3A3]">{k}</dt>
                      <dd className="text-[#0A0A0A]">
                        {v}
                        {caption && (
                          <span className="ml-2 text-xs text-[#A3A3A3]">
                            ({caption})
                          </span>
                        )}
                      </dd>
                    </Fragment>
                  ))}
                </dl>
              </div>
            )}
            {invoice.notes && (
              <div className={bankRows.length > 0 ? "mt-6" : ""}>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                  Notes
                </p>
                <p className="mt-3 whitespace-pre-line text-sm text-[#525252]">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </article>
    </div>
  );
}

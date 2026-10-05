"use client";

import { Banknote, Plus, Trash2 } from "lucide-react";
import { PAYMENT_METHODS, type Payment } from "@/lib/types";
import { formatMoney } from "@/lib/currencies";
import {
  formatDate,
  PAYMENT_METHOD_LABELS,
  paymentMethodLabel,
  todayISO,
} from "@/lib/format";
import {
  recordPaymentAction,
  deletePaymentAction,
} from "@/lib/actions";
import { inputClass, labelClass } from "./ui";

export default function PaymentsSection({
  invoiceId,
  currency,
  payments,
  amountPaid,
  balance,
  total,
}: {
  invoiceId: number;
  currency: string;
  payments: Payment[];
  amountPaid: number;
  balance: number;
  total: number;
}) {
  const fullyPaid = balance <= 0 && total > 0;

  const summary = [
    { label: "Invoice total", value: formatMoney(total, currency) },
    { label: "Paid to date", value: formatMoney(amountPaid, currency) },
    {
      label: fullyPaid ? "Balance" : "Balance due",
      value: formatMoney(Math.max(balance, 0), currency),
    },
  ];

  return (
    <section className="no-print mt-8 rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Banknote size={18} className="text-[#737373]" />
          <h2 className="font-bold tracking-tight text-[#0A0A0A] text-lg">
            Payments
          </h2>
        </div>
        {fullyPaid && (
          <span className="inline-flex items-center rounded-full border border-[#0A0A0A] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#0A0A0A]">
            Paid in full
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {summary.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-black/[0.06] bg-[#FAFAFA] px-4 py-3"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">
              {s.label}
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-[#0A0A0A] tabular-nums">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {payments.length > 0 && (
        <table className="mt-6 w-full text-left">
          <thead>
            <tr className="border-b border-black/[0.08]">
              <th className="pb-2 pr-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                Date
              </th>
              <th className="pb-2 px-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                Method
              </th>
              <th className="pb-2 px-4 w-full font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                Note
              </th>
              <th className="pb-2 pl-4 text-right font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
                Amount
              </th>
              <th className="pb-2 pl-4" />
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-black/[0.05] last:border-0">
                <td className="py-2.5 pr-4 text-sm text-[#525252] whitespace-nowrap">
                  {formatDate(p.paid_at)}
                </td>
                <td className="py-2.5 px-4 text-sm text-[#525252] whitespace-nowrap">
                  {paymentMethodLabel(p.method)}
                </td>
                <td className="py-2.5 px-4 text-sm text-[#737373]">
                  {p.note || "—"}
                </td>
                <td className="py-2.5 pl-4 text-right font-mono text-sm font-medium text-[#0A0A0A] tabular-nums whitespace-nowrap">
                  {formatMoney(p.amount, currency)}
                </td>
                <td className="py-2.5 pl-4 text-right">
                  <form
                    action={deletePaymentAction}
                    onSubmit={(e) => {
                      if (!confirm("Delete this payment?")) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="invoice_id" value={invoiceId} />
                    <button
                      type="submit"
                      className="text-[#C4C4C4] hover:text-[#0A0A0A] transition-colors"
                      aria-label="Delete payment"
                    >
                      <Trash2 size={14} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!fullyPaid && (
        <form
          action={recordPaymentAction}
          className="mt-6 border-t border-black/[0.08] pt-5"
        >
          <input type="hidden" name="invoice_id" value={invoiceId} />
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">
            Record a payment
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="payment-amount" className={labelClass}>
                Amount ({currency})
              </label>
              <input
                id="payment-amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                defaultValue={balance > 0 ? balance.toFixed(2) : undefined}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="payment-date" className={labelClass}>
                Date
              </label>
              <input
                id="payment-date"
                name="paid_at"
                type="date"
                required
                defaultValue={todayISO()}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="payment-method" className={labelClass}>
                Method
              </label>
              <select
                id="payment-method"
                name="method"
                defaultValue="bank_transfer"
                className={inputClass}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="payment-note" className={labelClass}>
                Note
              </label>
              <input
                id="payment-note"
                name="note"
                type="text"
                placeholder="Optional"
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0A0A0A] px-4 py-2 text-sm font-semibold text-[#FAFAFA] hover:bg-[#2a2a2a] transition-colors"
          >
            <Plus size={15} strokeWidth={2.4} />
            Record payment
          </button>
        </form>
      )}
    </section>
  );
}

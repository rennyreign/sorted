"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { CURRENCIES, formatMoney } from "@/lib/currencies";
import {
  INVOICE_STATUSES,
  LINE_ITEM_UNITS,
  type BankAccount,
  type Client,
} from "@/lib/types";
import { STATUS_LABELS } from "@/lib/format";
import { inputClass, labelClass } from "@/components/ui";

type Item = {
  key: string;
  description: string;
  unit: string;
  quantity: string;
  unit_price: string;
};

export type InvoiceFormValues = {
  id?: number;
  client_id: number;
  status: string;
  currency: string;
  issue_date: string;
  due_date: string;
  tax_rate: number;
  notes: string;
  bank_account_id: number | null;
  show_company_name: boolean;
  items: {
    description: string;
    unit: string;
    quantity: number;
    unit_price: number;
  }[];
};

let counter = 0;
const nextKey = () => `item-${counter++}`;

function emptyItem(): Item {
  return {
    key: nextKey(),
    description: "",
    unit: "project",
    quantity: "1",
    unit_price: "0",
  };
}

export default function InvoiceForm({
  action,
  clients,
  bankAccounts,
  initial,
  submitLabel,
}: {
  action: (form: FormData) => void;
  clients: Client[];
  bankAccounts: BankAccount[];
  initial: InvoiceFormValues;
  submitLabel: string;
}) {
  const [currency, setCurrency] = useState(initial.currency);
  const [taxRate, setTaxRate] = useState(String(initial.tax_rate));
  const [items, setItems] = useState<Item[]>(
    initial.items.length > 0
      ? initial.items.map((i) => ({
          key: nextKey(),
          description: i.description,
          unit: i.unit,
          quantity: String(i.quantity),
          unit_price: String(i.unit_price),
        }))
      : [emptyItem()],
  );

  const updateItem = (key: string, patch: Partial<Item>) =>
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, ...patch } : it)),
    );

  const removeItem = (key: string) =>
    setItems((prev) =>
      prev.length > 1 ? prev.filter((it) => it.key !== key) : prev,
    );

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, it) => sum + Number(it.quantity || 0) * Number(it.unit_price || 0),
      0,
    );
    const tax = subtotal * (Number(taxRate || 0) / 100);
    return { subtotal, tax, total: subtotal + tax };
  }, [items, taxRate]);

  return (
    <form action={action} className="space-y-10">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      {/* Meta */}
      <section className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Client</label>
          <select
            name="client_id"
            defaultValue={initial.client_id || ""}
            required
            className={inputClass}
          >
            <option value="" disabled>
              Select a client…
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select
            name="status"
            defaultValue={initial.status}
            className={inputClass}
          >
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Issue date</label>
          <input
            type="date"
            name="issue_date"
            defaultValue={initial.issue_date}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Due date</label>
          <input
            type="date"
            name="due_date"
            defaultValue={initial.due_date}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Currency</label>
          <select
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={inputClass}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Tax rate (%)</label>
          <input
            type="number"
            name="tax_rate"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            min="0"
            step="0.01"
            className={inputClass}
          />
        </div>
      </section>

      {/* Line items */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#737373]">
            Line items
          </label>
        </div>
        <div className="space-y-3">
          {items.map((item) => {
            const amount =
              Number(item.quantity || 0) * Number(item.unit_price || 0);
            return (
              <div
                key={item.key}
                className="grid grid-cols-12 gap-2 rounded-xl border border-black/[0.08] bg-white p-3"
              >
                <div className="col-span-12 sm:col-span-5">
                  <input
                    name="item_description"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.key, { description: e.target.value })
                    }
                    placeholder="Description (e.g. Landing page build)"
                    className={inputClass}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <select
                    name="item_unit"
                    value={item.unit}
                    onChange={(e) =>
                      updateItem(item.key, { unit: e.target.value })
                    }
                    className={inputClass}
                  >
                    {LINE_ITEM_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    name="item_quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.key, { quantity: e.target.value })
                    }
                    placeholder="Qty"
                    className={inputClass}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    name="item_unit_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(item.key, { unit_price: e.target.value })
                    }
                    placeholder="Rate"
                    className={inputClass}
                  />
                </div>
                <div className="col-span-12 sm:col-span-1 flex items-center justify-between sm:justify-end gap-2">
                  <span className="font-mono text-xs text-[#737373] tabular-nums sm:hidden">
                    {formatMoney(amount, currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    aria-label="Remove line item"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A3A3A3] hover:bg-black/[0.04] hover:text-[#0A0A0A] transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyItem()])}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-black/[0.12] px-4 py-2 text-sm font-medium text-[#525252] hover:bg-black/[0.02] transition-colors"
        >
          <Plus size={15} strokeWidth={2.2} />
          Add line item
        </button>
      </section>

      {/* Totals preview */}
      <section className="ml-auto w-full max-w-xs space-y-2 rounded-xl border border-black/[0.08] bg-white p-4 text-sm">
        <div className="flex justify-between text-[#737373]">
          <span>Subtotal</span>
          <span className="font-mono tabular-nums">
            {formatMoney(totals.subtotal, currency)}
          </span>
        </div>
        <div className="flex justify-between text-[#737373]">
          <span>Tax ({Number(taxRate || 0)}%)</span>
          <span className="font-mono tabular-nums">
            {formatMoney(totals.tax, currency)}
          </span>
        </div>
        <div className="flex justify-between border-t border-black/[0.08] pt-2 font-semibold text-[#0A0A0A]">
          <span>Total</span>
          <span className="font-mono tabular-nums">
            {formatMoney(totals.total, currency)}
          </span>
        </div>
      </section>

      {/* Bank + options */}
      <section className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Bank details to show</label>
          <select
            name="bank_account_id"
            defaultValue={initial.bank_account_id ?? ""}
            className={inputClass}
          >
            <option value="">None</option>
            {bankAccounts.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label || b.bank_name} ({b.currency})
              </option>
            ))}
          </select>
          {bankAccounts.length === 0 && (
            <p className="mt-1.5 text-xs text-[#A3A3A3]">
              Add bank accounts in{" "}
              <Link href="/settings" className="underline">
                Settings
              </Link>
              .
            </p>
          )}
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2.5 rounded-lg border border-black/[0.12] bg-white px-3.5 py-2.5 text-sm text-[#0A0A0A] cursor-pointer w-full">
            <input
              type="checkbox"
              name="show_company_name"
              defaultChecked={initial.show_company_name}
              className="h-4 w-4 accent-[#0A0A0A]"
            />
            Show company name on invoice
          </label>
        </div>
      </section>

      <section>
        <label className={labelClass}>Notes</label>
        <textarea
          name="notes"
          defaultValue={initial.notes}
          rows={3}
          placeholder="Payment terms, thank-you note, reference…"
          className={inputClass}
        />
      </section>

      <div className="flex items-center gap-3 border-t border-black/[0.08] pt-6">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0A0A0A] px-6 py-2.5 text-sm font-semibold text-[#FAFAFA] hover:bg-[#2a2a2a] transition-colors"
        >
          {submitLabel}
        </button>
        <Link
          href="/"
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-[#737373] hover:text-[#0A0A0A] transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

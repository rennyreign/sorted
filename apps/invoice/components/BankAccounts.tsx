"use client";

import { Fragment, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CURRENCIES } from "@/lib/currencies";
import type { BankAccount } from "@/lib/types";
import { inputClass, labelClass } from "@/components/ui";
import {
  createBankAccountAction,
  updateBankAccountAction,
  deleteBankAccountAction,
} from "@/lib/actions";

const ACCOUNT_TYPES = ["Checking", "Savings"];

const FIELDS: { name: keyof BankAccount; label: string; placeholder: string }[] =
  [
    { name: "label", label: "Label", placeholder: "USD ACH (Wise)" },
    { name: "bank_name", label: "Bank name", placeholder: "Wise" },
    { name: "account_name", label: "Account name", placeholder: "Your Name Ltd" },
    { name: "account_number", label: "Account number", placeholder: "12345678" },
    { name: "routing", label: "Routing number (ACH & wire)", placeholder: "084009519" },
    { name: "bank_address", label: "Bank address", placeholder: "108 W 13th St, Wilmington, DE 19801, United States" },
    { name: "iban", label: "IBAN (international only)", placeholder: "BE00 0000 0000 0000" },
    { name: "swift", label: "SWIFT / BIC (international only)", placeholder: "TRWIUS35XXX" },
  ];

function BankForm({
  action,
  initial,
  onDone,
  submitLabel,
}: {
  action: (form: FormData) => void;
  initial?: BankAccount;
  onDone: () => void;
  submitLabel: string;
}) {
  return (
    <form
      action={(fd) => {
        action(fd);
        onDone();
      }}
      className="rounded-xl border border-black/[0.12] bg-white p-5 space-y-4"
    >
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <Fragment key={f.name}>
            <div>
              <label className={labelClass}>{f.label}</label>
              <input
                name={f.name}
                defaultValue={initial ? String(initial[f.name] ?? "") : ""}
                placeholder={f.placeholder}
                className={inputClass}
              />
            </div>
            {f.name === "account_number" && (
              <div>
                <label className={labelClass}>Account type</label>
                <select
                  name="account_type"
                  defaultValue={initial?.account_type ?? ""}
                  className={inputClass}
                >
                  <option value="">Select account type</option>
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Fragment>
        ))}
        <div>
          <label className={labelClass}>Currency</label>
          <select
            name="currency"
            defaultValue={initial?.currency ?? "USD"}
            className={inputClass}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-[#0A0A0A] px-5 py-2 text-sm font-semibold text-[#FAFAFA] hover:bg-[#2a2a2a] transition-colors"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg px-4 py-2 text-sm font-medium text-[#737373] hover:text-[#0A0A0A]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function BankAccounts({ accounts }: { accounts: BankAccount[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {accounts.map((acc) =>
        editingId === acc.id ? (
          <BankForm
            key={acc.id}
            action={updateBankAccountAction}
            initial={acc}
            onDone={() => setEditingId(null)}
            submitLabel="Save account"
          />
        ) : (
          <div
            key={acc.id}
            className="flex items-start justify-between gap-4 rounded-xl border border-black/[0.08] bg-white p-5"
          >
            <div className="text-sm">
              <p className="font-semibold text-[#0A0A0A]">
                {acc.label || acc.bank_name || "Bank account"}{" "}
                <span className="font-mono text-[11px] font-normal text-[#A3A3A3]">
                  {acc.currency}
                </span>
              </p>
              <p className="mt-1 text-[#737373]">
                {[
                  acc.account_name,
                  acc.iban || acc.account_number,
                  acc.account_type,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditingId(acc.id)}
                aria-label="Edit account"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A3A3A3] hover:bg-black/[0.04] hover:text-[#0A0A0A] transition-colors"
              >
                <Pencil size={15} />
              </button>
              <form
                action={deleteBankAccountAction}
                onSubmit={(e) => {
                  if (!confirm("Delete this bank account?")) e.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={acc.id} />
                <button
                  type="submit"
                  aria-label="Delete account"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A3A3A3] hover:bg-black/[0.04] hover:text-[#0A0A0A] transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </form>
            </div>
          </div>
        ),
      )}

      {adding ? (
        <BankForm
          action={createBankAccountAction}
          onDone={() => setAdding(false)}
          submitLabel="Add account"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-black/[0.12] px-4 py-2 text-sm font-medium text-[#525252] hover:bg-black/[0.02] transition-colors"
        >
          <Plus size={15} strokeWidth={2.2} />
          Add bank account
        </button>
      )}
    </div>
  );
}

"use client";

import { useRef } from "react";
import Link from "next/link";
import { Download, Pencil, Trash2 } from "lucide-react";
import { INVOICE_STATUSES, type InvoiceStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/format";
import {
  updateInvoiceStatusAction,
  deleteInvoiceAction,
} from "@/lib/actions";

export default function InvoiceActions({
  id,
  status,
}: {
  id: number;
  status: InvoiceStatus;
}) {
  const statusFormRef = useRef<HTMLFormElement>(null);

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <form ref={statusFormRef} action={updateInvoiceStatusAction}>
        <input type="hidden" name="id" value={id} />
        <select
          name="status"
          defaultValue={status}
          onChange={() => statusFormRef.current?.requestSubmit()}
          className="rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm font-medium text-[#0A0A0A] focus:outline-none focus:border-black/[0.3]"
          aria-label="Change status"
        >
          {INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </form>

      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-lg bg-[#0A0A0A] px-4 py-2 text-sm font-semibold text-[#FAFAFA] hover:bg-[#2a2a2a] transition-colors"
      >
        <Download size={15} strokeWidth={2.2} />
        Export PDF
      </button>

      <Link
        href={`/invoices/${id}/edit`}
        className="inline-flex items-center gap-2 rounded-lg border border-black/[0.12] px-4 py-2 text-sm font-medium text-[#525252] hover:bg-black/[0.02] transition-colors"
      >
        <Pencil size={15} />
        Edit
      </Link>

      <form
        action={deleteInvoiceAction}
        onSubmit={(e) => {
          if (!confirm("Delete this invoice? This cannot be undone.")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg border border-black/[0.12] px-4 py-2 text-sm font-medium text-[#737373] hover:bg-black/[0.02] hover:text-[#0A0A0A] transition-colors"
        >
          <Trash2 size={15} />
          Delete
        </button>
      </form>
    </div>
  );
}

"use client";

import { Trash2 } from "lucide-react";
import { deleteClientAction } from "@/lib/actions";

export default function DeleteClientButton({
  id,
  disabled,
}: {
  id: number;
  disabled: boolean;
}) {
  if (disabled) {
    return (
      <span
        title="Clients with invoices can't be deleted"
        className="inline-flex items-center gap-2 rounded-lg border border-black/[0.08] px-4 py-2 text-sm font-medium text-[#C4C4C4] cursor-not-allowed"
      >
        <Trash2 size={15} />
        Delete
      </span>
    );
  }

  return (
    <form
      action={deleteClientAction}
      onSubmit={(e) => {
        if (!confirm("Delete this client? This cannot be undone.")) {
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
  );
}

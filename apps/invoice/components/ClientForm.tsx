import Link from "next/link";
import type { Client } from "@/lib/types";
import { inputClass, labelClass } from "@/components/ui";

export default function ClientForm({
  action,
  initial,
  submitLabel,
}: {
  action: (form: FormData) => void;
  initial?: Client;
  submitLabel: string;
}) {
  return (
    <form action={action} className="max-w-xl space-y-5">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div>
        <label className={labelClass}>Client / company name</label>
        <input
          name="name"
          required
          defaultValue={initial?.name ?? ""}
          placeholder="Acme Studios"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Contact name</label>
        <input
          name="contact_name"
          defaultValue={initial?.contact_name ?? ""}
          placeholder="Jane Doe"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          name="email"
          type="email"
          defaultValue={initial?.email ?? ""}
          placeholder="jane@acme.com"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Address</label>
        <textarea
          name="address"
          rows={3}
          defaultValue={initial?.address ?? ""}
          placeholder="Street, city, country"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={initial?.notes ?? ""}
          placeholder="Internal notes about this client"
          className={inputClass}
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0A0A0A] px-6 py-2.5 text-sm font-semibold text-[#FAFAFA] hover:bg-[#2a2a2a] transition-colors"
        >
          {submitLabel}
        </button>
        <Link
          href="/clients"
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-[#737373] hover:text-[#0A0A0A] transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

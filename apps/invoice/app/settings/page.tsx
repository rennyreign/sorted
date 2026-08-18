import Image from "next/image";
import { Container, PageHeader, inputClass, labelClass } from "@/components/ui";
import BankAccounts from "@/components/BankAccounts";
import { getSettings, getBankAccounts } from "@/lib/data";
import { saveSettingsAction } from "@/lib/actions";
import { CURRENCIES } from "@/lib/currencies";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const settings = getSettings();
  const accounts = getBankAccounts();

  return (
    <Container>
      <PageHeader label="Configuration" title="Settings" />

      {/* Company */}
      <section className="mb-12">
        <h2 className="mb-1 font-bold tracking-tight text-[#0A0A0A] text-lg">
          Company
        </h2>
        <p className="mb-5 text-sm text-[#737373]">
          Shown on invoices when &ldquo;Show company name&rdquo; is enabled.
        </p>
        <form action={saveSettingsAction} className="max-w-xl space-y-5">
          <div>
            <label className={labelClass}>Company name</label>
            <input
              name="company_name"
              defaultValue={settings.company_name}
              className={inputClass}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Company email</label>
              <input
                name="company_email"
                type="email"
                defaultValue={settings.company_email}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Registration / VAT no.</label>
              <input
                name="company_registration"
                defaultValue={settings.company_registration}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Company address</label>
            <textarea
              name="company_address"
              rows={3}
              defaultValue={settings.company_address}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Logo path</label>
            <div className="flex items-center gap-4">
              <input
                name="company_logo"
                placeholder="/logos/adx-engine.png"
                defaultValue={settings.company_logo}
                className={inputClass}
              />
              {settings.company_logo && (
                <div className="flex h-12 w-24 shrink-0 items-center justify-center rounded-lg border border-black/[0.08] bg-white p-1">
                  <Image
                    src={settings.company_logo}
                    alt="Company logo"
                    width={96}
                    height={40}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs text-[#A3A3A3]">
              Path to a logo file in <code>public/</code> (e.g.{" "}
              <code>/logos/adx-engine.png</code>). Shown on invoices instead
              of the company name.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Default currency</label>
              <select
                name="default_currency"
                defaultValue={settings.default_currency}
                className={inputClass}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Invoice prefix</label>
              <input
                name="invoice_prefix"
                defaultValue={settings.invoice_prefix}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Default tax (%)</label>
              <input
                name="default_tax_rate"
                type="number"
                min="0"
                step="0.01"
                defaultValue={settings.default_tax_rate}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Default invoice notes</label>
            <textarea
              name="default_notes"
              rows={2}
              defaultValue={settings.default_notes}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-[#0A0A0A] px-6 py-2.5 text-sm font-semibold text-[#FAFAFA] hover:bg-[#2a2a2a] transition-colors"
          >
            Save settings
          </button>
        </form>
      </section>

      {/* Bank accounts */}
      <section className="border-t border-black/[0.08] pt-10">
        <h2 className="mb-1 font-bold tracking-tight text-[#0A0A0A] text-lg">
          Bank accounts
        </h2>
        <p className="mb-5 text-sm text-[#737373]">
          Add the bank details you invoice with. Pick which set to show per
          invoice.
        </p>
        <BankAccounts accounts={accounts} />
      </section>
    </Container>
  );
}

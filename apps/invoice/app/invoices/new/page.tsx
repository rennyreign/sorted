import Link from "next/link";
import { Container, PageHeader, EmptyState, PrimaryLink } from "@/components/ui";
import InvoiceForm from "@/components/InvoiceForm";
import { createInvoiceAction } from "@/lib/actions";
import { getClients, getBankAccounts, getSettings } from "@/lib/data";
import { todayISO, addDaysISO } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function NewInvoicePage() {
  const clients = getClients();
  const bankAccounts = getBankAccounts();
  const settings = getSettings();

  if (clients.length === 0) {
    return (
      <Container>
        <PageHeader label="New invoice" title="Create invoice" />
        <EmptyState
          title="Add a client first"
          body="An invoice needs a client. Create a client account, then come back to bill them."
          action={<PrimaryLink href="/clients/new">Add client</PrimaryLink>}
        />
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        label="New invoice"
        title="Create invoice"
        action={
          <Link
            href="/"
            className="text-sm font-medium text-[#737373] hover:text-[#0A0A0A]"
          >
            Back to invoices
          </Link>
        }
      />
      <InvoiceForm
        action={createInvoiceAction}
        clients={clients}
        bankAccounts={bankAccounts}
        submitLabel="Create invoice"
        initial={{
          client_id: 0,
          status: "draft",
          currency: settings.default_currency,
          issue_date: todayISO(),
          due_date: addDaysISO(14),
          tax_rate: settings.default_tax_rate,
          notes: settings.default_notes,
          bank_account_id: bankAccounts[0]?.id ?? null,
          show_company_name: true,
          items: [],
        }}
      />
    </Container>
  );
}

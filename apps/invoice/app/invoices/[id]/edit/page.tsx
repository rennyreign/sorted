import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui";
import InvoiceForm from "@/components/InvoiceForm";
import { updateInvoiceAction } from "@/lib/actions";
import {
  getClients,
  getBankAccounts,
  getInvoice,
  getLineItems,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = getInvoice(Number(id));
  if (!invoice) notFound();

  const clients = getClients();
  const bankAccounts = getBankAccounts();
  const items = getLineItems(invoice.id);

  return (
    <Container>
      <PageHeader
        label={`Editing ${invoice.invoice_number}`}
        title="Edit invoice"
        action={
          <Link
            href={`/invoices/${invoice.id}`}
            className="text-sm font-medium text-[#737373] hover:text-[#0A0A0A]"
          >
            Back to invoice
          </Link>
        }
      />
      <InvoiceForm
        action={updateInvoiceAction}
        clients={clients}
        bankAccounts={bankAccounts}
        submitLabel="Save changes"
        initial={{
          id: invoice.id,
          client_id: invoice.client_id,
          status: invoice.status,
          currency: invoice.currency,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          tax_rate: invoice.tax_rate,
          notes: invoice.notes,
          bank_account_id: invoice.bank_account_id,
          show_company_name: invoice.show_company_name === 1,
          items: items.map((i) => ({
            description: i.description,
            unit: i.unit,
            quantity: i.quantity,
            unit_price: i.unit_price,
          })),
        }}
      />
    </Container>
  );
}

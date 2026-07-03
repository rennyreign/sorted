import Link from "next/link";
import { Plus } from "lucide-react";
import { Container, PageHeader, PrimaryLink, EmptyState } from "@/components/ui";
import { getClients } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function ClientsPage() {
  const clients = getClients();

  return (
    <Container>
      <PageHeader
        label="Accounts"
        title="Clients"
        action={
          <PrimaryLink href="/clients/new">
            <Plus size={16} strokeWidth={2.4} />
            Add client
          </PrimaryLink>
        }
      />

      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          body="Add a client account to start billing them for digital service work."
          action={<PrimaryLink href="/clients/new">Add client</PrimaryLink>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/clients/${c.id}`}
              className="rounded-xl border border-black/[0.08] bg-white p-5 hover:border-black/[0.2] transition-colors"
            >
              <p className="font-semibold text-[#0A0A0A]">{c.name}</p>
              {c.contact_name && (
                <p className="mt-0.5 text-sm text-[#737373]">{c.contact_name}</p>
              )}
              {c.email && (
                <p className="text-sm text-[#A3A3A3]">{c.email}</p>
              )}
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[#A3A3A3]">
                {c.invoice_count} invoice{c.invoice_count === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}

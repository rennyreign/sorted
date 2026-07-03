import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui";
import ClientForm from "@/components/ClientForm";
import { updateClientAction } from "@/lib/actions";
import { getClient } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClient(Number(id));
  if (!client) notFound();

  return (
    <Container>
      <PageHeader
        label="Accounts"
        title="Edit client"
        action={
          <Link
            href={`/clients/${client.id}`}
            className="text-sm font-medium text-[#737373] hover:text-[#0A0A0A]"
          >
            Back to client
          </Link>
        }
      />
      <ClientForm
        action={updateClientAction}
        initial={client}
        submitLabel="Save changes"
      />
    </Container>
  );
}

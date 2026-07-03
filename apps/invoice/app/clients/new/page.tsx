import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import ClientForm from "@/components/ClientForm";
import { createClientAction } from "@/lib/actions";

export default function NewClientPage() {
  return (
    <Container>
      <PageHeader
        label="Accounts"
        title="Add client"
        action={
          <Link
            href="/clients"
            className="text-sm font-medium text-[#737373] hover:text-[#0A0A0A]"
          >
            Back to clients
          </Link>
        }
      />
      <ClientForm action={createClientAction} submitLabel="Add client" />
    </Container>
  );
}

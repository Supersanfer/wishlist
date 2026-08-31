import Link from "next/link";

import { createOccasion } from "@/app/actions/occasions";
import { AppPage, PageHeader } from "@/components/page-shell";
import { requirePairedUser } from "@/lib/auth";
import { OccasionForm } from "../occasion-form";

export const metadata = { title: "Nueva ocasión" };

export default async function NewOccasionPage() {
  await requirePairedUser();

  return (
    <AppPage>
      <PageHeader
        title="Nueva ocasión"
        action={
          <Link href="/occasions" className="pt-1 text-sm text-muted">
            Cancelar
          </Link>
        }
      />
      <OccasionForm action={createOccasion} submitLabel="Crear ocasión" pendingLabel="Creando…" />
    </AppPage>
  );
}

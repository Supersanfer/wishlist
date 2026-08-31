import Link from "next/link";

import { createSharedItem } from "@/app/actions/shared";
import { AppPage, PageHeader } from "@/components/page-shell";
import { requirePairedUser } from "@/lib/auth";
import { SharedForm } from "../shared-form";

export const metadata = { title: "Añadir a la lista conjunta" };

export default async function NewSharedPage() {
  await requirePairedUser();

  return (
    <AppPage>
      <PageHeader
        title="Algo para los dos"
        action={
          <Link href="/shared" className="pt-1 text-sm text-muted">
            Cancelar
          </Link>
        }
      />
      <SharedForm
        action={createSharedItem}
        submitLabel="Añadir a la lista"
        pendingLabel="Guardando…"
      />
    </AppPage>
  );
}

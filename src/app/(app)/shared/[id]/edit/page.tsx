import Link from "next/link";
import { notFound } from "next/navigation";

import { updateSharedItem } from "@/app/actions/shared";
import { AppPage, PageHeader } from "@/components/page-shell";
import { requirePairedUser } from "@/lib/auth";
import { getSharedItem } from "@/lib/queries/shared";
import { SharedForm } from "../../shared-form";
import { DeleteSharedItem } from "./delete-shared-item";

export const metadata = { title: "Editar elemento" };

export default async function EditSharedPage({ params }: PageProps<"/shared/[id]/edit">) {
  await requirePairedUser();
  const { id } = await params;

  const item = await getSharedItem(id);
  if (!item) notFound();

  return (
    <AppPage>
      <PageHeader
        title="Editar"
        action={
          <Link href="/shared" className="pt-1 text-sm text-muted">
            Cancelar
          </Link>
        }
      />
      <SharedForm
        action={updateSharedItem}
        item={item}
        submitLabel="Guardar cambios"
        pendingLabel="Guardando…"
      />
      <DeleteSharedItem id={item.id} />
    </AppPage>
  );
}

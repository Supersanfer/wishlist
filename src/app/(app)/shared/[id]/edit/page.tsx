import { notFound } from "next/navigation";

import { deleteSharedItem, updateSharedItem } from "@/app/actions/shared";
import { DeleteItem } from "@/components/delete-item";
import { AppPage, FormHeader } from "@/components/page-shell";
import { requirePairedUser } from "@/lib/auth";
import { resolveItemImageUrl } from "@/lib/queries/storage";
import { getSharedItem } from "@/lib/queries/shared";
import { SharedForm } from "../../shared-form";

export const metadata = { title: "Editar elemento" };

export default async function EditSharedPage({ params }: PageProps<"/shared/[id]/edit">) {
  await requirePairedUser();
  const { id } = await params;

  const item = await getSharedItem(id);
  if (!item) notFound();
  const imagePreviewUrl = await resolveItemImageUrl(item.image_path, item.image_url);

  return (
    <AppPage>
      <FormHeader title="Editar" backTo="/shared" />
      <SharedForm
        action={updateSharedItem}
        item={item}
        imagePreviewUrl={imagePreviewUrl}
        submitLabel="Guardar cambios"
        pendingLabel="Guardando…"
      />
      <DeleteItem
        id={item.id}
        action={deleteSharedItem}
        label="Eliminar de la lista"
        question="¿Eliminarlo de vuestra lista? No se puede deshacer."
        confirmLabel="Sí, eliminar"
        pendingLabel="Eliminando…"
      />
    </AppPage>
  );
}

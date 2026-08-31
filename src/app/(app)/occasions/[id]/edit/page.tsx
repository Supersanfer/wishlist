import { notFound } from "next/navigation";

import { deleteOccasion, updateOccasion } from "@/app/actions/occasions";
import { DeleteItem } from "@/components/delete-item";
import { AppPage, FormHeader } from "@/components/page-shell";
import { requirePairedUser } from "@/lib/auth";
import { getOwnOccasion } from "@/lib/queries/occasions";
import { OccasionForm } from "../../occasion-form";

export const metadata = { title: "Editar ocasión" };

export default async function EditOccasionPage({ params }: PageProps<"/occasions/[id]/edit">) {
  const user = await requirePairedUser();
  const { id } = await params;

  const occasion = await getOwnOccasion(user.id, id);
  if (!occasion) notFound();

  return (
    <AppPage>
      <FormHeader title="Editar ocasión" backTo="/occasions" />
      <OccasionForm
        action={updateOccasion}
        occasion={occasion}
        submitLabel="Guardar cambios"
        pendingLabel="Guardando…"
      />
      <DeleteItem
        id={occasion.id}
        action={deleteOccasion}
        label="Eliminar esta ocasión"
        question="¿Eliminar la ocasión? Los deseos asociados se conservan, sólo se quedan sin ocasión."
        confirmLabel="Sí, eliminar"
        pendingLabel="Eliminando…"
      />
    </AppPage>
  );
}

import { notFound } from "next/navigation";

import { updateOccasion } from "@/app/actions/occasions";
import { AppPage, FormHeader } from "@/components/page-shell";
import { requirePairedUser } from "@/lib/auth";
import { getOwnOccasion } from "@/lib/queries/occasions";
import { OccasionForm } from "../../occasion-form";
import { DeleteOccasion } from "./delete-occasion";

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
      <DeleteOccasion id={occasion.id} />
    </AppPage>
  );
}

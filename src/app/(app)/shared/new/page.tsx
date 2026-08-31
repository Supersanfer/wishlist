import { createSharedItem } from "@/app/actions/shared";
import { AppPage, FormHeader } from "@/components/page-shell";
import { requirePairedUser } from "@/lib/auth";
import { SharedForm } from "../shared-form";

export const metadata = { title: "Añadir a la lista conjunta" };

export default async function NewSharedPage() {
  await requirePairedUser();

  return (
    <AppPage>
      <FormHeader title="Algo para los dos" backTo="/shared" />
      <SharedForm
        action={createSharedItem}
        submitLabel="Añadir a la lista"
        pendingLabel="Guardando…"
      />
    </AppPage>
  );
}

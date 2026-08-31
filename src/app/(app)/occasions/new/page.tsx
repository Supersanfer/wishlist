import { createOccasion } from "@/app/actions/occasions";
import { AppPage, FormHeader } from "@/components/page-shell";
import { requirePairedUser } from "@/lib/auth";
import { OccasionForm } from "../occasion-form";

export const metadata = { title: "Nueva ocasión" };

export default async function NewOccasionPage() {
  await requirePairedUser();

  return (
    <AppPage>
      <FormHeader title="Nueva ocasión" backTo="/occasions" />
      <OccasionForm action={createOccasion} submitLabel="Crear ocasión" pendingLabel="Creando…" />
    </AppPage>
  );
}

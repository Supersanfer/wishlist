
import { createWish } from "@/app/actions/wishlist";
import { AppPage, FormHeader } from "@/components/page-shell";
import { requirePairedUser } from "@/lib/auth";
import { listOccasionsOf } from "@/lib/queries/occasions";
import { WishForm } from "../wish-form";

export const metadata = { title: "Nuevo deseo" };

export default async function NewWishPage() {
  const user = await requirePairedUser();
  const occasions = await listOccasionsOf(user.id);

  return (
    <AppPage>
      <FormHeader title="Nuevo deseo" backTo="/wishlist" />

      <WishForm
        action={createWish}
        occasions={occasions}
        submitLabel="Guardar deseo"
        pendingLabel="Guardando…"
      />
    </AppPage>
  );
}

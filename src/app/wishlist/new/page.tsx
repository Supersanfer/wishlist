import Link from "next/link";

import { createWish } from "@/app/actions/wishlist";
import { requirePairedUser } from "@/lib/auth";
import { listOwnOccasions } from "@/lib/queries/wishlist";
import { WishForm } from "../wish-form";

export const metadata = { title: "Nuevo deseo" };

export default async function NewWishPage() {
  const user = await requirePairedUser();
  const occasions = await listOwnOccasions(user.id);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo deseo</h1>
        <Link href="/wishlist" className="text-sm text-muted">
          Cancelar
        </Link>
      </header>

      <WishForm
        action={createWish}
        occasions={occasions}
        submitLabel="Guardar deseo"
        pendingLabel="Guardando…"
      />
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";

import { updateWish } from "@/app/actions/wishlist";
import { requirePairedUser } from "@/lib/auth";
import { listOccasionsOf } from "@/lib/queries/occasions";
import { getOwnWish } from "@/lib/queries/wishlist";
import { WishForm } from "../../wish-form";
import { DeleteWish } from "./delete-wish";

export const metadata = { title: "Editar deseo" };

export default async function EditWishPage({ params }: PageProps<"/wishlist/[id]/edit">) {
  const user = await requirePairedUser();
  const { id } = await params;

  const [wish, occasions] = await Promise.all([
    getOwnWish(user.id, id),
    listOccasionsOf(user.id),
  ]);

  // Un deseo ajeno tampoco llega hasta aqui: RLS solo deja leer los de la
  // pareja, y getOwnWish ademas filtra por owner_id.
  if (!wish) notFound();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Editar deseo</h1>
        <Link href="/wishlist" className="text-sm text-muted">
          Cancelar
        </Link>
      </header>

      <WishForm
        action={updateWish}
        occasions={occasions}
        wish={wish}
        submitLabel="Guardar cambios"
        pendingLabel="Guardando…"
      />

      <DeleteWish id={wish.id} />
    </main>
  );
}

"use client";

import { deleteWish } from "@/app/actions/wishlist";
import { DeleteItem } from "@/components/delete-item";

export function DeleteWish({ id }: { id: string }) {
  return (
    <DeleteItem
      id={id}
      action={deleteWish}
      label="Eliminar este deseo"
      question="¿Eliminar este deseo? No se puede deshacer."
      confirmLabel="Sí, eliminar"
      pendingLabel="Eliminando…"
    />
  );
}

"use client";

import { deleteSharedItem } from "@/app/actions/shared";
import { DeleteItem } from "@/components/delete-item";

export function DeleteSharedItem({ id }: { id: string }) {
  return (
    <DeleteItem
      id={id}
      action={deleteSharedItem}
      label="Eliminar de la lista"
      question="¿Eliminarlo de vuestra lista? No se puede deshacer."
      confirmLabel="Sí, eliminar"
      pendingLabel="Eliminando…"
    />
  );
}

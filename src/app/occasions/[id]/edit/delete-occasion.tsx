"use client";

import { deleteOccasion } from "@/app/actions/occasions";
import { DeleteItem } from "@/components/delete-item";

export function DeleteOccasion({ id }: { id: string }) {
  return (
    <DeleteItem
      id={id}
      action={deleteOccasion}
      label="Eliminar esta ocasión"
      question="¿Eliminar la ocasión? Los deseos asociados se conservan, solo se quedan sin ocasión."
      confirmLabel="Sí, eliminar"
      pendingLabel="Eliminando…"
    />
  );
}

"use client";

import { useActionState, useState } from "react";

import { deleteWish } from "@/app/actions/wishlist";
import { Alert, SubmitButton } from "@/components/ui";
import { initialActionState } from "@/lib/form-state";

export function DeleteWish({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState(deleteWish, initialActionState);

  if (!confirming) {
    return (
      <div className="space-y-4 border-t border-border pt-6">
        {state.error ? <Alert>{state.error}</Alert> : null}
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="w-full text-center text-sm text-danger underline underline-offset-4"
        >
          Eliminar este deseo
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3 border-t border-border pt-6">
      <input type="hidden" name="id" value={id} />
      <p className="text-center text-sm">¿Eliminar este deseo? No se puede deshacer.</p>
      {state.error ? <Alert>{state.error}</Alert> : null}
      <SubmitButton pendingLabel="Eliminando…">Sí, eliminar</SubmitButton>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="w-full text-center text-sm text-muted underline underline-offset-4"
      >
        No, volver
      </button>
    </form>
  );
}

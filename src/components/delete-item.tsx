"use client";

import { useActionState, useState } from "react";

import { Alert, SubmitButton } from "@/components/ui";
import { initialActionState, type ActionState } from "@/lib/form-state";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Borrado con confirmacion en dos pasos, en linea. Evita el `confirm()` nativo,
 * que en una PWA se ve como un dialogo del navegador.
 */
export function DeleteItem({
  id,
  action,
  label,
  question,
  confirmLabel,
  pendingLabel,
}: {
  id: string;
  action: Action;
  label: string;
  question: string;
  confirmLabel: string;
  pendingLabel: string;
}) {
  const [asking, setAsking] = useState(false);
  const [state, formAction] = useActionState(action, initialActionState);

  if (!asking) {
    return (
      <div className="space-y-4 border-t border-border pt-6">
        {state.error ? <Alert>{state.error}</Alert> : null}
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="w-full text-center text-sm text-danger underline underline-offset-4"
        >
          {label}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3 border-t border-border pt-6">
      <input type="hidden" name="id" value={id} />
      <p className="text-center text-sm">{question}</p>
      {state.error ? <Alert>{state.error}</Alert> : null}
      <SubmitButton pendingLabel={pendingLabel}>{confirmLabel}</SubmitButton>
      <button
        type="button"
        onClick={() => setAsking(false)}
        className="w-full text-center text-sm text-muted underline underline-offset-4"
      >
        No, volver
      </button>
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";

import { Alert, Button, SubmitButton, TextButton } from "@/components/ui";
import { initialActionState, type ActionState } from "@/lib/form-state";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Borrado con confirmación en dos pasos, en línea. Nada de `confirm()` nativo:
 * en una PWA delata que hay un navegador debajo.
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
      <div className="space-y-3 border-t border-border pt-5">
        {state.error ? <Alert>{state.error}</Alert> : null}
        <TextButton tone="danger" className="w-full" onClick={() => setAsking(true)}>
          {label}
        </TextButton>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3 border-t border-border pt-5">
      <input type="hidden" name="id" value={id} />
      <p className="text-center text-sm text-muted">{question}</p>
      {state.error ? <Alert>{state.error}</Alert> : null}
      <SubmitButton variant="danger" pendingLabel={pendingLabel}>
        {confirmLabel}
      </SubmitButton>
      <Button type="button" variant="ghost" onClick={() => setAsking(false)}>
        No, volver
      </Button>
    </form>
  );
}

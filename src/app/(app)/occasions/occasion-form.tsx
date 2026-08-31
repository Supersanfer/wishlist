"use client";

import { useActionState } from "react";

import { Alert, Field, SubmitButton } from "@/components/ui";
import { initialActionState, type ActionState } from "@/lib/form-state";
import type { Occasion } from "@/lib/queries/occasions";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function OccasionForm({
  action,
  occasion,
  submitLabel,
  pendingLabel,
}: {
  action: Action;
  occasion?: Occasion;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="space-y-5">
      {occasion ? <input type="hidden" name="id" value={occasion.id} /> : null}

      <Field
        label="Nombre"
        name="name"
        defaultValue={occasion?.name ?? ""}
        placeholder="Mi cumpleaños"
        maxLength={80}
        autoComplete="off"
        enterKeyHint="next"
        required
        autoFocus={!occasion}
      />

      <Field
        label="Fecha"
        name="occasion_date"
        type="date"
        defaultValue={occasion?.occasion_date ?? ""}
        hint="Se repite cada año."
        required
      />

      {state.error ? <Alert>{state.error}</Alert> : null}

      <SubmitButton size="lg" pendingLabel={pendingLabel}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}

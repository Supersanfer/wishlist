"use client";

import { useActionState } from "react";

import { initialCoupleState, joinCouple } from "@/app/actions/couple";
import { Alert, Field, SubmitButton } from "@/components/ui";

export function JoinByCodeForm() {
  const [state, formAction] = useActionState(joinCouple, initialCoupleState);

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Tengo un código de invitación"
        name="code"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="Pega aquí el código"
        required
      />
      {state.error ? <Alert>{state.error}</Alert> : null}
      <SubmitButton variant="secondary" pendingLabel="Uniéndote…">
        Unirme a mi pareja
      </SubmitButton>
    </form>
  );
}

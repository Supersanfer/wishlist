"use client";

import { useActionState } from "react";

import { joinCouple } from "@/app/actions/couple";
import { initialActionState } from "@/lib/form-state";
import { Alert, SubmitButton } from "@/components/ui";

export function AcceptInviteForm({ code }: { code: string }) {
  const [state, formAction] = useActionState(joinCouple, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="code" value={code} />
      {state.error ? <Alert>{state.error}</Alert> : null}
      <SubmitButton pendingLabel="Uniéndote…">Unirme</SubmitButton>
    </form>
  );
}

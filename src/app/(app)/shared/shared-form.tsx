"use client";

import { useActionState } from "react";

import { ItemFields } from "@/components/item-fields";
import { Alert, SubmitButton } from "@/components/ui";
import { initialActionState, type ActionState } from "@/lib/form-state";
import type { SharedItem } from "@/lib/queries/shared";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function SharedForm({
  action,
  item,
  imagePreviewUrl,
  submitLabel,
  pendingLabel,
}: {
  action: Action;
  item?: SharedItem;
  imagePreviewUrl?: string | null;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="space-y-5">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <ItemFields
        item={item}
        imagePreviewUrl={imagePreviewUrl}
        titleLabel="¿Qué queréis?"
        titlePlaceholder="Viaje a Japón"
        autoFocus={!item}
      />

      {state.error ? <Alert>{state.error}</Alert> : null}

      <SubmitButton size="lg" pendingLabel={pendingLabel}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}

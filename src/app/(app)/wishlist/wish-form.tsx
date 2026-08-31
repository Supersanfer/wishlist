"use client";

import { useActionState } from "react";

import { ItemFields } from "@/components/item-fields";
import { Alert, Select, SubmitButton } from "@/components/ui";
import { initialActionState, type ActionState } from "@/lib/form-state";
import type { Occasion } from "@/lib/queries/occasions";
import type { WishlistItem } from "@/lib/queries/wishlist";
import { PRIORITIES, PRIORITY_LABEL } from "@/lib/wish-input";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function WishForm({
  action,
  occasions,
  wish,
  submitLabel,
  pendingLabel,
}: {
  action: Action;
  occasions: Occasion[];
  wish?: WishlistItem;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="space-y-5">
      {wish ? <input type="hidden" name="id" value={wish.id} /> : null}

      <ItemFields
        item={wish}
        titleLabel="¿Qué te apetece?"
        titlePlaceholder="AirPods Pro"
        autoFocus={!wish}
      />

      <Select label="Cuánto lo quieres" name="priority" defaultValue={wish?.priority ?? "medium"}>
        {PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_LABEL[priority]}
          </option>
        ))}
      </Select>

      <Select label="Ocasión" name="occasion_id" defaultValue={wish?.occasion_id ?? ""}>
        <option value="">Sin ocasión</option>
        {occasions.map((occasion) => (
          <option key={occasion.id} value={occasion.id}>
            {occasion.name}
          </option>
        ))}
      </Select>

      {state.error ? <Alert>{state.error}</Alert> : null}

      <SubmitButton pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
    </form>
  );
}

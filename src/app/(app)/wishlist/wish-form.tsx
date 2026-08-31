"use client";

import Link from "next/link";
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
        titlePlaceholder="Cafetera italiana"
        autoFocus={!wish}
      >
        <Select label="Cuánto lo quieres" name="priority" defaultValue={wish?.priority ?? "medium"}>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABEL[priority]}
            </option>
          ))}
        </Select>

        <div>
          <Select label="Ocasión" name="occasion_id" defaultValue={wish?.occasion_id ?? ""}>
            <option value="">Sin ocasión</option>
            {occasions.map((occasion) => (
              <option key={occasion.id} value={occasion.id}>
                {occasion.name}
              </option>
            ))}
          </Select>
          {/* Sin esto, quien no tenga ocasiones creadas se queda en un callejón:
              el selector sólo ofrece "Sin ocasión" y no hay forma de crear una. */}
          {occasions.length === 0 ? (
            <p className="mt-1.5 text-sm text-muted">
              Todavía no tienes ocasiones.{" "}
              <Link href="/occasions/new" className="text-accent underline underline-offset-2">
                Crear una
              </Link>
            </p>
          ) : null}
        </div>
      </ItemFields>

      {state.error ? <Alert>{state.error}</Alert> : null}

      <SubmitButton size="lg" pendingLabel={pendingLabel}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}

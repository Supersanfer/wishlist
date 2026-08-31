"use client";

import { useActionState } from "react";

import { Alert, Field, Select, SubmitButton, Textarea } from "@/components/ui";
import { initialActionState, type ActionState } from "@/lib/form-state";
import type { Occasion } from "@/lib/queries/occasions";
import type { WishlistItem } from "@/lib/queries/wishlist";
import { CURRENCIES, PRIORITIES, PRIORITY_LABEL } from "@/lib/wish-input";

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

      <Field
        label="¿Qué te apetece?"
        name="title"
        defaultValue={wish?.title ?? ""}
        placeholder="AirPods Pro"
        maxLength={200}
        autoComplete="off"
        required
        autoFocus={!wish}
      />

      <Textarea
        label="Detalles (opcional)"
        name="description"
        defaultValue={wish?.description ?? ""}
        placeholder="Color, talla, dónde lo vi…"
        maxLength={2000}
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <Field
            label="Precio (opcional)"
            name="price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            defaultValue={wish?.price_cents != null ? (wish.price_cents / 100).toFixed(2) : ""}
            placeholder="199.00"
          />
        </div>
        <div className="w-28">
          <Select label="Moneda" name="currency" defaultValue={wish?.currency ?? "EUR"}>
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Field
        label="Enlace (opcional)"
        name="url"
        type="url"
        inputMode="url"
        defaultValue={wish?.url ?? ""}
        placeholder="https://…"
        autoComplete="off"
      />

      <Field
        label="URL de imagen (opcional)"
        name="image_url"
        type="url"
        inputMode="url"
        defaultValue={wish?.image_url ?? ""}
        placeholder="https://…"
        autoComplete="off"
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

"use client";

import { Field, Select, Textarea } from "@/components/ui";
import { CURRENCIES } from "@/lib/wish-input";

export type ItemDefaults = {
  title?: string | null;
  description?: string | null;
  url?: string | null;
  image_url?: string | null;
  price_cents?: number | null;
  currency?: string | null;
};

/** Campos que comparten el formulario de deseo personal y el de la lista conjunta. */
export function ItemFields({
  item,
  titleLabel,
  titlePlaceholder,
  autoFocus,
}: {
  item?: ItemDefaults;
  titleLabel: string;
  titlePlaceholder: string;
  autoFocus?: boolean;
}) {
  return (
    <>
      <Field
        label={titleLabel}
        name="title"
        defaultValue={item?.title ?? ""}
        placeholder={titlePlaceholder}
        maxLength={200}
        autoComplete="off"
        required
        autoFocus={autoFocus}
      />

      <Textarea
        label="Detalles (opcional)"
        name="description"
        defaultValue={item?.description ?? ""}
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
            defaultValue={item?.price_cents != null ? (item.price_cents / 100).toFixed(2) : ""}
            placeholder="199.00"
          />
        </div>
        <div className="w-28">
          <Select label="Moneda" name="currency" defaultValue={item?.currency ?? "EUR"}>
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
        defaultValue={item?.url ?? ""}
        placeholder="https://…"
        autoComplete="off"
      />

      <Field
        label="URL de imagen (opcional)"
        name="image_url"
        type="url"
        inputMode="url"
        defaultValue={item?.image_url ?? ""}
        placeholder="https://…"
        autoComplete="off"
      />
    </>
  );
}

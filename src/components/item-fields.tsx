import type { ReactNode } from "react";

import { ChevronDownIcon, LinkIcon } from "@/components/icons";
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

/** Formatea céntimos para el input, con coma decimal como se escribe aquí. */
function priceValue(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

/**
 * Campos comunes al deseo personal y a la lista conjunta.
 *
 * Sólo lo imprescindible queda a la vista: apuntar algo debe costar un nombre y
 * poco más. Descripción, imagen y moneda viven plegadas en un `<details>`
 * nativo, sin JavaScript.
 */
export function ItemFields({
  item,
  titleLabel,
  titlePlaceholder,
  autoFocus,
  children,
}: {
  item?: ItemDefaults;
  titleLabel: string;
  titlePlaceholder: string;
  autoFocus?: boolean;
  children?: ReactNode;
}) {
  const hasExtras = Boolean(item?.description || item?.image_url);

  return (
    <>
      <Field
        label={titleLabel}
        name="title"
        defaultValue={item?.title ?? ""}
        placeholder={titlePlaceholder}
        maxLength={200}
        autoComplete="off"
        enterKeyHint="next"
        required
        autoFocus={autoFocus}
      />

      <Field
        label="Precio"
        name="price"
        // `type=number` descarta silenciosamente "199,00": aquí se escribe con coma.
        type="text"
        inputMode="decimal"
        defaultValue={priceValue(item?.price_cents)}
        placeholder="199,00"
        autoComplete="off"
        enterKeyHint="next"
      />

      <Field
        label="Enlace del producto"
        name="url"
        type="url"
        inputMode="url"
        icon={<LinkIcon size={18} />}
        defaultValue={item?.url ?? ""}
        placeholder="https://…"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="next"
      />

      {children}

      <details className="group rounded-md border border-border bg-surface" open={hasExtras}>
        <summary className="flex h-12 cursor-pointer list-none items-center justify-between px-3.5 text-sm font-medium">
          Más detalles
          <ChevronDownIcon
            size={18}
            className="text-muted transition-transform duration-150 group-open:rotate-180"
          />
        </summary>

        <div className="space-y-4 border-t border-border p-3.5">
          <Textarea
            label="Descripción"
            name="description"
            defaultValue={item?.description ?? ""}
            placeholder="Color, talla, dónde lo viste…"
            maxLength={2000}
          />

          <Field
            label="Imagen (URL)"
            name="image_url"
            type="url"
            inputMode="url"
            defaultValue={item?.image_url ?? ""}
            placeholder="https://…"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />

          <Select label="Moneda" name="currency" defaultValue={item?.currency ?? "EUR"}>
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </Select>
        </div>
      </details>
    </>
  );
}

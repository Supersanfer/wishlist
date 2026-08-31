import Link from "next/link";
import type { ReactNode } from "react";
import type { Route } from "next";

import { ExternalLinkIcon, PencilIcon } from "@/components/icons";
import { safeExternalHref } from "@/lib/url";
import { formatPrice, type WishPriority } from "@/lib/wish-input";

export type WishCardData = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  price_cents: number | null;
  currency: string;
  priority?: WishPriority;
  occasionName?: string | null;
};

function Dot() {
  return (
    <span aria-hidden className="text-muted/40">
      ·
    </span>
  );
}

/**
 * Tarjeta de deseo, en clave editorial: el título manda en serif, la imagen es
 * una estampa alineada arriba (y si no hay, no deja hueco), y precio y ocasión
 * comparten una línea de firma.
 *
 * La tarjeta ya NO es un enlace entera: eso convertía cada deseo en un botón de
 * "editar" y dejaba el enlace del producto sin forma de abrirse. Ahora las
 * acciones viven en una barra propia al pie —"Ver producto" como ancla real y
 * externa, editar como icono secundario— para que ninguna se coma a la otra.
 *
 * La prioridad no se escribe: sólo la más alta se marca, con una barra a sangre.
 *
 * `highlight` tiñe la tarjeta cuando quien mira la tiene reservada. Nunca se le
 * pasa al dueño del deseo: ese dato no llega ni a su consulta.
 */
export function WishCard({
  wish,
  editHref,
  eyebrow,
  highlight = false,
  footer,
  index = 0,
  anchorId,
}: {
  wish: WishCardData;
  editHref?: Route;
  eyebrow?: string;
  highlight?: boolean;
  footer?: ReactNode;
  index?: number;
  /** Ancla para desplazarse a este deseo (p. ej. desde "Ver deseo"). */
  anchorId?: string;
}) {
  const productHref = safeExternalHref(wish.url);
  const hasActionRow = Boolean(productHref || editHref);

  return (
    <li
      id={anchorId}
      tabIndex={anchorId ? -1 : undefined}
      className="animate-rise relative scroll-mt-6 overflow-hidden rounded-md border border-border bg-surface outline-none"
      style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
    >
      {highlight ? <span aria-hidden className="absolute inset-0 bg-accent-soft/60" /> : null}

      {/* Prioridad alta: una barra a sangre, legible sin leyenda. */}
      {wish.priority === "high" ? (
        <span aria-hidden className="absolute inset-y-0 left-0 z-10 w-0.5 bg-accent" />
      ) : null}

      <div className="relative">
        <div className="flex gap-3.5 px-4 pt-3.5 pb-3">
          <div className="min-w-0 flex-1">
            {eyebrow ? (
              <p className="eyebrow mb-1.5 text-accent">{eyebrow}</p>
            ) : null}

            <h3 className="font-display text-[1.0625rem] leading-6 break-words">{wish.title}</h3>

            {wish.description ? (
              <p className="mt-1 line-clamp-2 text-sm break-words text-muted">{wish.description}</p>
            ) : null}

            {wish.price_cents != null || wish.occasionName ? (
              <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 text-sm text-muted">
                {wish.price_cents != null ? (
                  <span className="tabular font-semibold text-foreground">
                    {formatPrice(wish.price_cents, wish.currency)}
                  </span>
                ) : null}

                {wish.price_cents != null && wish.occasionName ? <Dot /> : null}
                {wish.occasionName ? <span>{wish.occasionName}</span> : null}
              </p>
            ) : null}
          </div>

          {wish.image_url ? (
            // <img> a propósito: usar next/image obligaría a declarar remotePatterns
            // abiertos, que convierte el optimizador en un proxy de imágenes ajeno.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={wish.image_url}
              alt=""
              loading="lazy"
              className="size-14 shrink-0 self-start rounded-sm border border-border object-cover"
            />
          ) : null}
        </div>

        {hasActionRow ? (
          <div className="flex items-center gap-2 border-t border-border pr-2 pl-4">
            {productHref ? (
              // Ancla real y externa: abre la tienda en el navegador, sin pasar
              // por el router de Next. `noopener` corta el acceso al opener.
              <a
                href={productHref}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-inset -mx-1 flex min-h-11 flex-1 items-center gap-1.5 px-1 text-sm font-semibold text-accent transition active:opacity-70 hover:underline underline-offset-2"
              >
                Ver producto
                <ExternalLinkIcon size={15} />
              </a>
            ) : (
              <span className="flex-1" />
            )}

            {editHref ? (
              <Link
                href={editHref}
                aria-label="Editar"
                className="focus-inset flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition active:scale-95 active:bg-surface-sunken"
              >
                <PencilIcon size={17} />
              </Link>
            ) : null}
          </div>
        ) : null}

        {footer ? (
          <div className={`px-4 pb-3 ${hasActionRow ? "pt-0.5" : "border-t border-border pt-3"}`}>
            {footer}
          </div>
        ) : null}
      </div>
    </li>
  );
}

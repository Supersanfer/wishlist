import Link from "next/link";
import type { ReactNode } from "react";
import type { Route } from "next";

import { ExternalLinkIcon, PencilIcon } from "@/components/icons";
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

/** El dominio dice más que la URL entera y no rompe el ancho de la línea. */
function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function Dot() {
  return (
    <span aria-hidden className="text-muted/50">
      ·
    </span>
  );
}

/**
 * Tarjeta de deseo, en clave editorial: el título manda en serif, la imagen es
 * una estampa alineada arriba (y si no hay, no deja hueco), y precio, ocasión y
 * enlace comparten una única línea de firma.
 *
 * La prioridad no se escribe: sólo la más alta se marca, con una barra a sangre.
 * Ponerle además una etiqueta de texto era decir dos veces lo mismo.
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
}: {
  wish: WishCardData;
  editHref?: Route;
  eyebrow?: string;
  highlight?: boolean;
  footer?: ReactNode;
  index?: number;
}) {
  const host = wish.url ? hostOf(wish.url) : null;

  const body = (
    <div className="flex gap-3.5 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        {eyebrow ? <p className="eyebrow mb-1.5 text-accent">{eyebrow}</p> : null}

        <h3 className="font-display text-[1.0625rem] leading-6 break-words">{wish.title}</h3>

        {wish.description ? (
          <p className="mt-1 line-clamp-2 text-sm break-words text-muted">{wish.description}</p>
        ) : null}

        {wish.price_cents != null || wish.occasionName || host ? (
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 text-sm text-muted">
            {wish.price_cents != null ? (
              <span className="tabular font-semibold text-foreground">
                {formatPrice(wish.price_cents, wish.currency)}
              </span>
            ) : null}

            {wish.price_cents != null && wish.occasionName ? <Dot /> : null}
            {wish.occasionName ? <span>{wish.occasionName}</span> : null}

            {(wish.price_cents != null || wish.occasionName) && host ? <Dot /> : null}
            {host ? (
              // Dentro de una tarjeta que ya es enlace no puede anidarse otro
              // ancla: allí el dominio queda como texto y se abre desde la
              // ficha. Donde la tarjeta no enlaza, sí es pulsable.
              editHref ? (
                <span>{host}</span>
              ) : (
                <a
                  href={wish.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 py-1 text-accent underline underline-offset-2"
                >
                  {host}
                  <ExternalLinkIcon size={13} />
                </a>
              )
            ) : null}
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

      {editHref ? (
        <PencilIcon size={16} className="mt-0.5 shrink-0 self-start text-muted/60" />
      ) : null}
    </div>
  );

  return (
    <li
      className="animate-rise relative overflow-hidden rounded-md border border-border bg-surface"
      style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
    >
      {/* Prioridad alta: una barra a sangre, legible sin leyenda. */}
      {wish.priority === "high" ? (
        <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-accent" />
      ) : null}

      {highlight ? <span aria-hidden className="absolute inset-0 bg-accent-soft/60" /> : null}

      <div className="relative">
        {editHref ? (
          <Link href={editHref} className="block transition active:bg-surface-sunken">
            {body}
          </Link>
        ) : (
          body
        )}

        {footer ? <div className="border-t border-border px-3 py-2.5">{footer}</div> : null}
      </div>
    </li>
  );
}

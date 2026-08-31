import Link from "next/link";
import type { ReactNode } from "react";

import { PRIORITY_LABEL, formatPrice, type WishPriority } from "@/lib/wish-input";

const PRIORITY_DOT: Record<WishPriority, string> = {
  low: "bg-muted",
  medium: "bg-accent/50",
  high: "bg-accent",
};

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

/**
 * Tarjeta de deseo. La usan la lista propia, la de la pareja y la conjunta.
 *
 * `editHref` convierte el cuerpo en un enlace de edicion; `footer` cuelga
 * controles debajo (reservar, editar...). Sin ninguno de los dos es solo lectura.
 */
export function WishCard({
  wish,
  editHref,
  footer,
}: {
  wish: WishCardData;
  editHref?: string;
  footer?: ReactNode;
}) {
  const meta = [
    wish.price_cents != null ? formatPrice(wish.price_cents, wish.currency) : null,
    wish.priority ? PRIORITY_LABEL[wish.priority] : null,
    wish.occasionName ?? null,
  ].filter((value): value is string => Boolean(value));

  const body = (
    <div className="flex items-start gap-3 p-4">
      {wish.priority ? (
        <span
          aria-hidden
          className={`mt-2 size-2 shrink-0 rounded-full ${PRIORITY_DOT[wish.priority]}`}
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <h3 className="font-medium break-words">{wish.title}</h3>

        {wish.description ? (
          <p className="mt-1 line-clamp-2 text-sm break-words text-muted">{wish.description}</p>
        ) : null}

        {meta.length > 0 ? (
          <p className="mt-1.5 text-sm text-muted">
            <span className="text-foreground">{meta[0]}</span>
            {meta.length > 1 ? ` · ${meta.slice(1).join(" · ")}` : null}
          </p>
        ) : null}
      </div>

      {wish.image_url ? (
        // <img> a proposito: usar next/image obligaria a declarar remotePatterns
        // abiertos, que convierte el optimizador en un proxy de imagenes ajeno.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={wish.image_url}
          alt=""
          loading="lazy"
          className="size-16 shrink-0 rounded-xl border border-border object-cover"
        />
      ) : null}

      {editHref ? (
        <span aria-hidden className="self-center text-sm text-muted">
          Editar
        </span>
      ) : null}
    </div>
  );

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-card">
      {editHref ? (
        <Link href={editHref} className="block transition active:opacity-70">
          {body}
        </Link>
      ) : (
        body
      )}

      {wish.url ? (
        <a
          href={wish.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block border-t border-border px-4 py-3 text-sm text-accent"
        >
          Ver enlace ↗
        </a>
      ) : null}

      {footer ? <div className="border-t border-border p-3">{footer}</div> : null}
    </li>
  );
}

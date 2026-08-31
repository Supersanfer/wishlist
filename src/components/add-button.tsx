import Link from "next/link";
import type { Route } from "next";

import { PlusIcon } from "@/components/icons";

/**
 * Acción de crear, fija justo encima de la barra y siempre en el mismo sitio.
 * Antes era `sticky`, que nunca llegaba a asentarse y cambiaba de sitio según
 * la longitud de la lista.
 */
export function AddButton({ href, label }: { href: Route; label: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom))] z-10">
      <div className="px-gutter mx-auto max-w-[26rem] pb-3">
        <Link
          href={href}
          className="pointer-events-auto flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-5 font-medium text-accent-foreground shadow-float transition active:scale-[0.985] active:brightness-95"
        >
          <PlusIcon size={18} />
          {label}
        </Link>
      </div>
    </div>
  );
}

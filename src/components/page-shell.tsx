import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLeftIcon } from "@/components/icons";
import type { Route } from "next";

/** Contenedor común de las pantallas: ancho de lectura y márgenes con notch. */
export function AppPage({ children }: { children: ReactNode }) {
  return (
    <main className="px-gutter mx-auto flex w-full max-w-[26rem] flex-1 flex-col gap-6 pt-7 pb-8">
      {children}
    </main>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-[1.6875rem] leading-8 break-words">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
    </header>
  );
}

/**
 * Cabecera de las pantallas de formulario. El "atrás" va arriba a la izquierda
 * con 44px reales de área táctil, en lugar del "Cancelar" de 14px que había
 * en la esquina peor alcanzable con el pulgar.
 */
export function FormHeader({ title, backTo }: { title: string; backTo: Route }) {
  return (
    <header className="flex items-center gap-1">
      <Link
        href={backTo}
        aria-label="Volver"
        className="-ml-2.5 flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition active:scale-95"
      >
        <ArrowLeftIcon size={20} />
      </Link>
      <h1 className="font-display min-w-0 truncate text-xl leading-7">{title}</h1>
    </header>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
      <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-surface-sunken text-muted">
        {icon}
      </span>
      <h2 className="font-display text-lg">{title}</h2>
      <p className="max-w-[26ch] text-sm text-muted">{message}</p>
      {action ? <div className="mt-2 w-full max-w-56">{action}</div> : null}
    </div>
  );
}

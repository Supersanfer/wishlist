import { AppPage } from "@/components/page-shell";

/** Esqueleto neutro: cajas de altura de fila, que valen para listas y para fichas. */
export default function AppLoading() {
  return (
    <AppPage>
      <div className="space-y-2">
        <div className="h-8 w-44 animate-pulse rounded-md bg-surface-sunken" />
        <div className="h-4 w-56 animate-pulse rounded-sm bg-surface-sunken" />
      </div>
      <ul className="space-y-2.5" aria-hidden>
        {[0, 1, 2].map((index) => (
          <li
            key={index}
            className="h-[4.5rem] animate-pulse rounded-md border border-border bg-surface-sunken/60"
          />
        ))}
      </ul>
      <span className="sr-only" role="status">
        Cargando
      </span>
    </AppPage>
  );
}

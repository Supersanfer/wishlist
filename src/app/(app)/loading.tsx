import { AppPage } from "@/components/page-shell";

/** Esqueleto mientras el servidor resuelve la pantalla. */
export default function AppLoading() {
  return (
    <AppPage>
      <div className="h-8 w-40 animate-pulse rounded-lg bg-card" />
      <div className="h-4 w-56 animate-pulse rounded bg-card" />
      <ul className="space-y-3" aria-hidden>
        {[0, 1, 2].map((index) => (
          <li key={index} className="h-24 animate-pulse rounded-2xl border border-border bg-card" />
        ))}
      </ul>
      <span className="sr-only" role="status">
        Cargando…
      </span>
    </AppPage>
  );
}

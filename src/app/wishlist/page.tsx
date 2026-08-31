import Link from "next/link";

import { Alert } from "@/components/ui";
import { requirePairedUser } from "@/lib/auth";
import { listOwnWishes, type WishWithOccasion } from "@/lib/queries/wishlist";
import { PRIORITY_LABEL, formatPrice } from "@/lib/wish-input";

export const metadata = { title: "Mi wishlist" };

const PRIORITY_DOT: Record<string, string> = {
  low: "bg-muted",
  medium: "bg-accent/50",
  high: "bg-accent",
};

const FLASH: Record<string, string> = {
  creado: "Deseo añadido ✨",
  guardado: "Cambios guardados ✓",
  eliminado: "Deseo eliminado",
};

function WishCard({ wish }: { wish: WishWithOccasion }) {
  return (
    <li className="rounded-2xl border border-border bg-card">
      <Link href={`/wishlist/${wish.id}/edit`} className="block p-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={`mt-2 size-2 shrink-0 rounded-full ${PRIORITY_DOT[wish.priority]}`}
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-medium break-words">{wish.title}</h2>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              {wish.price_cents != null ? (
                <span className="text-foreground">
                  {formatPrice(wish.price_cents, wish.currency)}
                </span>
              ) : null}
              <span>{PRIORITY_LABEL[wish.priority]}</span>
              {wish.occasionName ? <span>· {wish.occasionName}</span> : null}
            </div>
          </div>

          <span aria-hidden className="text-sm text-muted">
            Editar
          </span>
        </div>
      </Link>

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
    </li>
  );
}

export default async function WishlistPage({ searchParams }: PageProps<"/wishlist">) {
  const user = await requirePairedUser();
  const [wishes, params] = await Promise.all([listOwnWishes(user.id), searchParams]);

  const flashKey = Object.keys(FLASH).find((key) => params[key] === "1");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Mi wishlist</h1>
        <Link href="/dashboard" className="text-sm text-muted">
          Inicio
        </Link>
      </header>

      {flashKey ? <Alert tone="info">{FLASH[flashKey]}</Alert> : null}

      {wishes.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-4xl">🎁</p>
          <p className="text-muted">Todavía no tienes deseos 🎁</p>
          <Link
            href="/wishlist/new"
            className="flex h-12 items-center justify-center rounded-2xl bg-accent px-6 font-medium text-accent-foreground"
          >
            Añadir el primero
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {wishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} />
            ))}
          </ul>
          <Link
            href="/wishlist/new"
            className="sticky bottom-6 flex h-12 items-center justify-center rounded-2xl bg-accent px-6 font-medium text-accent-foreground shadow-lg"
          >
            + Añadir deseo
          </Link>
        </>
      )}
    </main>
  );
}

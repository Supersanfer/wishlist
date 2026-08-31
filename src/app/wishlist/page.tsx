import Link from "next/link";

import { AppPage, EmptyState, PageHeader } from "@/components/page-shell";
import { Alert } from "@/components/ui";
import { WishCard } from "@/components/wish-card";
import { requirePairedUser } from "@/lib/auth";
import { flashMessage } from "@/lib/flash";
import { listWishesOf } from "@/lib/queries/wishlist";

export const metadata = { title: "Mi wishlist" };

const FLASH = {
  creado: "Deseo añadido ✨",
  guardado: "Cambios guardados",
  eliminado: "Deseo eliminado",
};

export default async function WishlistPage({ searchParams }: PageProps<"/wishlist">) {
  const user = await requirePairedUser();
  const [wishes, params] = await Promise.all([listWishesOf(user.id), searchParams]);
  const flash = flashMessage(params, FLASH);

  return (
    <AppPage>
      <PageHeader title="Mi wishlist" subtitle="Lo que te haría ilusión recibir." />

      {flash ? <Alert tone="info">{flash}</Alert> : null}

      {wishes.length === 0 ? (
        <EmptyState
          icon="🎁"
          message="Todavía no tienes deseos 🎁"
          action={
            <Link
              href="/wishlist/new"
              className="flex h-12 items-center justify-center rounded-2xl bg-accent px-6 font-medium text-accent-foreground"
            >
              Añadir el primero
            </Link>
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {wishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} editHref={`/wishlist/${wish.id}/edit`} />
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
    </AppPage>
  );
}

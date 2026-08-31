import Link from "next/link";

import { AppPage, EmptyState, PageHeader } from "@/components/page-shell";
import { Alert } from "@/components/ui";
import { WishCard } from "@/components/wish-card";
import { requirePairedUser } from "@/lib/auth";
import { flashMessage } from "@/lib/flash";
import { listSharedItems } from "@/lib/queries/shared";

export const metadata = { title: "Wishlist conjunta" };

const FLASH = {
  creado: "Añadido a vuestra lista ✨",
  guardado: "Cambios guardados",
  eliminado: "Elemento eliminado",
};

export default async function SharedPage({ searchParams }: PageProps<"/shared">) {
  await requirePairedUser();
  const [items, params] = await Promise.all([listSharedItems(), searchParams]);
  const flash = flashMessage(params, FLASH);

  return (
    <AppPage>
      <PageHeader title="Wishlist conjunta" subtitle="Lo que queréis hacer o tener los dos." />

      {flash ? <Alert tone="info">{flash}</Alert> : null}

      {items.length === 0 ? (
        <EmptyState
          icon="✨"
          message="Aún no tenéis nada en vuestra lista conjunta ✨"
          action={
            <Link
              href="/shared/new"
              className="flex h-12 items-center justify-center rounded-2xl bg-accent px-6 font-medium text-accent-foreground"
            >
              Añadir el primero
            </Link>
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((item) => (
              <WishCard key={item.id} wish={item} editHref={`/shared/${item.id}/edit`} />
            ))}
          </ul>
          <Link
            href="/shared/new"
            className="sticky bottom-6 flex h-12 items-center justify-center rounded-2xl bg-accent px-6 font-medium text-accent-foreground shadow-lg"
          >
            + Añadir algo juntos
          </Link>
        </>
      )}
    </AppPage>
  );
}

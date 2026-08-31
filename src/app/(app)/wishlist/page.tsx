import { AddButton } from "@/components/add-button";
import { Flash } from "@/components/flash";
import { GiftIcon } from "@/components/icons";
import { AppPage, EmptyState, PageHeader } from "@/components/page-shell";
import { buttonClass } from "@/components/ui";
import { WishCard } from "@/components/wish-card";
import { requirePairedUser } from "@/lib/auth";
import { flashMessage } from "@/lib/flash";
import { listWishesOf } from "@/lib/queries/wishlist";
import Link from "next/link";

export const metadata = { title: "Mi lista" };

const FLASH = {
  creado: "Añadido a tu lista",
  guardado: "Guardado",
  eliminado: "Deseo eliminado",
};

export default async function WishlistPage({ searchParams }: PageProps<"/wishlist">) {
  const user = await requirePairedUser();
  const [wishes, params] = await Promise.all([listWishesOf(user.id), searchParams]);
  const flash = flashMessage(params, FLASH);

  return (
    <AppPage>
      <PageHeader
        title="Tu lista"
        subtitle={
          wishes.length === 0
            ? undefined
            : `${wishes.length} ${wishes.length === 1 ? "cosa que quieres" : "cosas que quieres"} · las ve tu pareja`
        }
      />

      {flash ? <Flash message={flash} /> : null}

      {wishes.length === 0 ? (
        <EmptyState
          icon={<GiftIcon size={24} />}
          title="Aquí todavía no hay nada"
          message="Apunta algo que te apetezca. Tu pareja lo verá y podrá regalártelo sin spoilers."
          action={
            <Link href="/wishlist/new" className={buttonClass()}>
              Añadir lo primero
            </Link>
          }
        />
      ) : (
        <>
          <ul className="space-y-2.5 pb-nav">
            {wishes.map((wish, index) => (
              <WishCard
                key={wish.id}
                wish={wish}
                index={index}
                editHref={`/wishlist/${wish.id}/edit`}
              />
            ))}
          </ul>
          <AddButton href="/wishlist/new" label="Añadir deseo" />
        </>
      )}
    </AppPage>
  );
}

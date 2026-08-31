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
  creado: "Deseo añadido a tu lista",
  guardado: "Cambios guardados",
  eliminado: "Deseo eliminado",
};

export default async function WishlistPage({ searchParams }: PageProps<"/wishlist">) {
  const user = await requirePairedUser();
  const [wishes, params] = await Promise.all([listWishesOf(user.id), searchParams]);
  const flash = flashMessage(params, FLASH);

  return (
    <AppPage>
      <PageHeader
        title="Mi lista"
        subtitle={
          wishes.length === 0
            ? undefined
            : `${wishes.length} ${wishes.length === 1 ? "deseo" : "deseos"} · tu pareja los ve`
        }
      />

      {flash ? <Flash message={flash} /> : null}

      {wishes.length === 0 ? (
        <EmptyState
          icon={<GiftIcon size={22} />}
          title="Tu lista está en blanco"
          message="Apunta algo que te haga ilusión. Tu pareja lo verá y podrá regalártelo."
          action={
            <Link href="/wishlist/new" className={buttonClass()}>
              Añadir el primero
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

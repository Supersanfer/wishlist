import Link from "next/link";

import { AddButton } from "@/components/add-button";
import { Flash } from "@/components/flash";
import { TogetherIcon } from "@/components/icons";
import { AppPage, EmptyState, PageHeader } from "@/components/page-shell";
import { buttonClass } from "@/components/ui";
import { WishCard } from "@/components/wish-card";
import { requirePairedUser } from "@/lib/auth";
import { flashMessage } from "@/lib/flash";
import { listSharedItemsWithImages } from "@/lib/queries/shared";

export const metadata = { title: "Juntos" };

const FLASH = {
  creado: "Añadido a vuestra lista",
  guardado: "Guardado",
  eliminado: "Eliminado de vuestra lista",
};

export default async function SharedPage({ searchParams }: PageProps<"/shared">) {
  await requirePairedUser();
  const [items, params] = await Promise.all([listSharedItemsWithImages(), searchParams]);
  const flash = flashMessage(params, FLASH);

  return (
    <AppPage>
      <PageHeader title="Los dos" subtitle="Lo que queréis hacer o tener juntos." />

      {flash ? <Flash message={flash} /> : null}

      {items.length === 0 ? (
        <EmptyState
          icon={<TogetherIcon size={24} />}
          title="Vuestra lista en común"
          message="Un viaje, una cena, algo para casa. Aquí los dos añadís y editáis."
          action={
            <Link href="/shared/new" className={buttonClass()}>
              Añadir el primero
            </Link>
          }
        />
      ) : (
        <>
          <ul className="space-y-2.5 pb-nav">
            {items.map((item, index) => (
              <WishCard
                key={item.id}
                wish={item}
                index={index}
                editHref={`/shared/${item.id}/edit`}
              />
            ))}
          </ul>
          <AddButton href="/shared/new" label="Añadir algo" />
        </>
      )}
    </AppPage>
  );
}

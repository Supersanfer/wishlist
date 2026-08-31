import Link from "next/link";
import { notFound } from "next/navigation";

import { AppPage, EmptyState, PageHeader } from "@/components/page-shell";
import { WishCard } from "@/components/wish-card";
import { getCoupleState, requirePairedUser } from "@/lib/auth";
import { displayNameOf, getProfile } from "@/lib/queries/profiles";
import { myActiveReservationsByWish } from "@/lib/queries/reservations";
import { listWishesOf } from "@/lib/queries/wishlist";
import { ReserveControls } from "./reserve-controls";

export const metadata = { title: "Su wishlist" };

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "mios", label: "Reservados por mí" },
] as const;

export default async function PartnerPage({ searchParams }: PageProps<"/partner">) {
  const user = await requirePairedUser();
  const state = await getCoupleState(user.id);
  if (!state.partnerId) notFound();

  const [partner, wishes, reservations, params] = await Promise.all([
    getProfile(state.partnerId),
    listWishesOf(state.partnerId),
    myActiveReservationsByWish(),
    searchParams,
  ]);

  const onlyMine = params.filtro === "mios";
  const visible = onlyMine ? wishes.filter((wish) => reservations.has(wish.id)) : wishes;
  const name = displayNameOf(partner);

  return (
    <AppPage>
      <PageHeader
        title={`Wishlist de ${name}`}
        subtitle="Reserva un regalo y no se enterará."
      />

      {wishes.length === 0 ? (
        <EmptyState icon="💝" message="Tu pareja todavía no ha añadido ningún deseo 💝" />
      ) : (
        <>
          <nav aria-label="Filtro" className="flex gap-2">
            {FILTERS.map((filter) => {
              const active = (filter.key === "mios") === onlyMine;
              return (
                <Link
                  key={filter.key}
                  href={filter.key === "mios" ? "/partner?filtro=mios" : "/partner"}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-11 items-center rounded-xl px-4 text-sm font-medium transition ${
                    active
                      ? "bg-accent text-accent-foreground"
                      : "border border-border text-muted"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </nav>

          {visible.length === 0 ? (
            <EmptyState icon="🔖" message="Todavía no has reservado ningún regalo." />
          ) : (
            <ul className="space-y-3">
              {visible.map((wish) => (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  footer={
                    <ReserveControls wishId={wish.id} reservation={reservations.get(wish.id)} />
                  }
                />
              ))}
            </ul>
          )}
        </>
      )}
    </AppPage>
  );
}

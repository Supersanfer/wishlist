import Link from "next/link";
import { notFound } from "next/navigation";

import { TagHeartIcon } from "@/components/icons";
import { AppPage, EmptyState, PageHeader } from "@/components/page-shell";
import { WishCard } from "@/components/wish-card";
import { getCoupleState, requirePairedUser } from "@/lib/auth";
import { displayNameOf, getProfile } from "@/lib/queries/profiles";
import { myActiveReservationsByWish } from "@/lib/queries/reservations";
import { listWishesOf } from "@/lib/queries/wishlist";
import { ReserveControls } from "./reserve-controls";

export const metadata = { title: "Su lista" };

const chip = "flex h-11 items-center gap-1.5 rounded-md px-4 text-sm font-medium transition";

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
  const reservedCount = wishes.filter((wish) => reservations.has(wish.id)).length;
  const visible = onlyMine ? wishes.filter((wish) => reservations.has(wish.id)) : wishes;
  const name = displayNameOf(partner);

  return (
    <AppPage>
      <PageHeader title={`Lista de ${name}`} subtitle="Reserva un regalo. No verá nada." />

      {wishes.length === 0 ? (
        <EmptyState
          icon={<TagHeartIcon size={22} />}
          title={`${name} aún no ha pedido nada`}
          message="Cuando añada su primer deseo aparecerá aquí y podrás reservarlo."
        />
      ) : (
        <>
          {reservedCount > 0 ? (
            <nav aria-label="Filtro" className="flex gap-2">
              <Link
                href="/partner"
                aria-current={onlyMine ? undefined : "page"}
                className={`${chip} ${
                  onlyMine ? "border border-border text-muted" : "bg-accent-soft text-accent"
                }`}
              >
                Todos
              </Link>
              <Link
                href="/partner?filtro=mios"
                aria-current={onlyMine ? "page" : undefined}
                className={`${chip} ${
                  onlyMine ? "bg-accent-soft text-accent" : "border border-border text-muted"
                }`}
              >
                Reservados por ti
                <span className="tabular text-xs opacity-70">{reservedCount}</span>
              </Link>
            </nav>
          ) : null}

          <ul className="space-y-2.5">
            {visible.map((wish, index) => {
              const reservation = reservations.get(wish.id);
              const eyebrow = reservation
                ? reservation.status === "purchased"
                  ? "Comprado por ti"
                  : "Reservado por ti"
                : undefined;

              return (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  index={index}
                  highlight={Boolean(reservation)}
                  eyebrow={eyebrow}
                  footer={<ReserveControls wishId={wish.id} reservation={reservation} />}
                />
              );
            })}
          </ul>
        </>
      )}
    </AppPage>
  );
}

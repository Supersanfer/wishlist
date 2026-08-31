import { notFound } from "next/navigation";

import { AppPage, EmptyState, PageHeader } from "@/components/page-shell";
import { WishCard } from "@/components/wish-card";
import { getCoupleState, requirePairedUser } from "@/lib/auth";
import { displayNameOf, getProfile } from "@/lib/queries/profiles";
import { listWishesOf } from "@/lib/queries/wishlist";

export const metadata = { title: "Su wishlist" };

export default async function PartnerPage() {
  const user = await requirePairedUser();
  const state = await getCoupleState(user.id);

  // requirePairedUser ya garantiza pareja completa; esto es por exhaustividad.
  if (!state.partnerId) notFound();

  const [partner, wishes] = await Promise.all([
    getProfile(state.partnerId),
    listWishesOf(state.partnerId),
  ]);
  const name = displayNameOf(partner);

  return (
    <AppPage>
      <PageHeader
        title={`Wishlist de ${name}`}
        subtitle="Solo lectura. Aquí eliges qué regalarle."
      />

      {wishes.length === 0 ? (
        <EmptyState icon="💝" message="Tu pareja todavía no ha añadido ningún deseo 💝" />
      ) : (
        <ul className="space-y-3">
          {wishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} />
          ))}
        </ul>
      )}
    </AppPage>
  );
}

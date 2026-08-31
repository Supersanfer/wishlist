import Link from "next/link";

import { AddButton } from "@/components/add-button";
import { Flash } from "@/components/flash";
import { CalendarIcon, ChevronRightIcon } from "@/components/icons";
import { AppPage, EmptyState, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui";
import { getCoupleState, requirePairedUser } from "@/lib/auth";
import { flashMessage } from "@/lib/flash";
import { countdownLabel, daysUntil, formatOccasionDate } from "@/lib/occasion-input";
import { listOccasionsOf, type Occasion } from "@/lib/queries/occasions";
import { displayNameOf, getProfile } from "@/lib/queries/profiles";

export const metadata = { title: "Ocasiones" };

const FLASH = {
  creado: "Ocasión creada",
  guardado: "Cambios guardados",
  eliminado: "Ocasión eliminada",
};

/** Lo inminente primero: una ocasión sólo importa por lo cerca que está. */
function byProximity(a: Occasion, b: Occasion): number {
  return daysUntil(a.occasion_date) - daysUntil(b.occasion_date);
}

function OccasionRow({ occasion, href }: { occasion: Occasion; href?: string }) {
  const days = daysUntil(occasion.occasion_date);

  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[1.0625rem] leading-6 break-words">{occasion.name}</p>
        <p className="mt-0.5 text-sm text-muted">
          {formatOccasionDate(occasion.occasion_date)}
          <span className={days <= 30 ? "text-accent" : undefined}>
            {" · "}
            {countdownLabel(days)}
          </span>
        </p>
      </div>
      {href ? <ChevronRightIcon size={18} className="shrink-0 text-muted/70" /> : null}
    </>
  );

  return (
    <li className="border-b border-border last:border-b-0">
      {href ? (
        <Link
          href={href}
          className="flex min-h-16 items-center gap-3 px-4 py-3 transition active:bg-surface-sunken"
        >
          {content}
        </Link>
      ) : (
        <div className="flex min-h-16 items-center gap-3 px-4 py-3">{content}</div>
      )}
    </li>
  );
}

export default async function OccasionsPage({ searchParams }: PageProps<"/occasions">) {
  const user = await requirePairedUser();
  const state = await getCoupleState(user.id);

  const [mine, theirs, partner, params] = await Promise.all([
    listOccasionsOf(user.id),
    state.partnerId ? listOccasionsOf(state.partnerId) : Promise.resolve([]),
    state.partnerId ? getProfile(state.partnerId) : Promise.resolve(null),
    searchParams,
  ]);
  const flash = flashMessage(params, FLASH);

  const sortedMine = [...mine].sort(byProximity);
  const sortedTheirs = [...theirs].sort(byProximity);

  return (
    <AppPage>
      <PageHeader title="Ocasiones" subtitle="Las fechas que dan pie a un regalo." />

      {flash ? <Flash message={flash} /> : null}

      {mine.length === 0 && theirs.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={22} />}
          title="Sin fechas marcadas"
          message="Tu cumpleaños, vuestro aniversario, Navidad. Luego podrás asociarles deseos."
          action={
            <Link href="/occasions/new">
              <Button>Crear la primera</Button>
            </Link>
          }
        />
      ) : (
        <div className="pb-nav space-y-6">
          {sortedMine.length > 0 ? (
            <section className="space-y-2">
              <h2 className="eyebrow text-muted">Tuyas</h2>
              <ul className="overflow-hidden rounded-md border border-border bg-surface">
                {sortedMine.map((occasion) => (
                  <OccasionRow
                    key={occasion.id}
                    occasion={occasion}
                    href={`/occasions/${occasion.id}/edit`}
                  />
                ))}
              </ul>
            </section>
          ) : null}

          {sortedTheirs.length > 0 ? (
            <section className="space-y-2">
              <h2 className="eyebrow text-muted">De {displayNameOf(partner)}</h2>
              <ul className="overflow-hidden rounded-md border border-border bg-surface">
                {sortedTheirs.map((occasion) => (
                  <OccasionRow key={occasion.id} occasion={occasion} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}

      {mine.length > 0 || theirs.length > 0 ? (
        <AddButton href="/occasions/new" label="Nueva ocasión" />
      ) : null}
    </AppPage>
  );
}

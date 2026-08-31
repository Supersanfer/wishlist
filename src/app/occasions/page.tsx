import Link from "next/link";

import { AppPage, EmptyState, PageHeader } from "@/components/page-shell";
import { Alert } from "@/components/ui";
import { getCoupleState, requirePairedUser } from "@/lib/auth";
import { flashMessage } from "@/lib/flash";
import { formatOccasionDate } from "@/lib/occasion-input";
import { listOccasionsOf, type Occasion } from "@/lib/queries/occasions";
import { displayNameOf, getProfile } from "@/lib/queries/profiles";

export const metadata = { title: "Ocasiones" };

const FLASH = {
  creado: "Ocasión creada",
  guardado: "Cambios guardados",
  eliminado: "Ocasión eliminada",
};

function OccasionList({ occasions, editable }: { occasions: Occasion[]; editable: boolean }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {occasions.map((occasion) => {
        const row = (
          <>
            <span className="min-w-0 flex-1 font-medium break-words">{occasion.name}</span>
            <span className="shrink-0 text-sm text-muted">
              {formatOccasionDate(occasion.occasion_date)}
            </span>
          </>
        );

        return (
          <li key={occasion.id}>
            {editable ? (
              <Link
                href={`/occasions/${occasion.id}/edit`}
                className="flex items-center gap-3 px-4 py-4 transition active:opacity-70"
              >
                {row}
              </Link>
            ) : (
              <div className="flex items-center gap-3 px-4 py-4">{row}</div>
            )}
          </li>
        );
      })}
    </ul>
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

  return (
    <AppPage>
      <PageHeader
        title="Ocasiones"
        subtitle="Las fechas que dan contexto a los regalos."
        action={
          <Link href="/occasions/new" className="pt-1 text-sm font-medium text-accent">
            + Nueva
          </Link>
        }
      />

      {flash ? <Alert tone="info">{flash}</Alert> : null}

      {mine.length === 0 ? (
        <EmptyState
          icon="🎂"
          message="Todavía no has creado ninguna ocasión."
          action={
            <Link
              href="/occasions/new"
              className="flex h-12 items-center justify-center rounded-2xl bg-accent px-6 font-medium text-accent-foreground"
            >
              Crear la primera
            </Link>
          }
        />
      ) : (
        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-wide text-muted uppercase">Las tuyas</h2>
          <OccasionList occasions={mine} editable />
        </section>
      )}

      {theirs.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-wide text-muted uppercase">
            De {displayNameOf(partner)}
          </h2>
          <OccasionList occasions={theirs} editable={false} />
        </section>
      ) : null}
    </AppPage>
  );
}

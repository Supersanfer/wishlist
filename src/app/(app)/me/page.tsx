import Link from "next/link";

import { AppPage, PageHeader } from "@/components/page-shell";
import { SignOutButton } from "@/components/sign-out-button";
import { getCoupleState, requirePairedUser } from "@/lib/auth";
import { displayNameOf, getProfile } from "@/lib/queries/profiles";

export const metadata = { title: "Yo" };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-4">
      <span className="shrink-0 text-sm text-muted">{label}</span>
      <span className="min-w-0 text-right break-words">{value}</span>
    </div>
  );
}

export default async function MePage() {
  const user = await requirePairedUser();
  const state = await getCoupleState(user.id);

  const [me, partner] = await Promise.all([
    getProfile(user.id),
    state.partnerId ? getProfile(state.partnerId) : Promise.resolve(null),
  ]);

  return (
    <AppPage>
      <PageHeader title={`Hola, ${displayNameOf(me, "hola")}`} />

      <section className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        <Row label="Nombre" value={displayNameOf(me, "—")} />
        <Row label="Email" value={user.email ?? "—"} />
        <Row label="Pareja" value={displayNameOf(partner, "—")} />
        <Row label="Estado" value={state.isComplete ? "Emparejados" : "Sin emparejar"} />
      </section>

      <Link
        href="/occasions"
        className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 transition active:opacity-70"
      >
        <span aria-hidden className="text-lg">
          🎂
        </span>
        <span className="flex-1">Ocasiones</span>
        <span aria-hidden className="text-sm text-muted">
          →
        </span>
      </Link>

      <div className="pt-2">
        <SignOutButton />
      </div>
    </AppPage>
  );
}

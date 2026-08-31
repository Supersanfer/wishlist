import Link from "next/link";

import { CalendarIcon, ChevronRightIcon } from "@/components/icons";
import { AppPage } from "@/components/page-shell";
import { SignOutButton } from "@/components/sign-out-button";
import { getCoupleState, requirePairedUser } from "@/lib/auth";
import { displayNameOf, getProfile } from "@/lib/queries/profiles";
import { ProfileName } from "./profile-name";

export const metadata = { title: "Yo" };

export default async function MePage() {
  const user = await requirePairedUser();
  const state = await getCoupleState(user.id);

  const [me, partner] = await Promise.all([
    getProfile(user.id),
    state.partnerId ? getProfile(state.partnerId) : Promise.resolve(null),
  ]);

  return (
    <AppPage>
      <header className="pt-2">
        <h1 className="font-display text-[1.6875rem] leading-8">
          Tú y {displayNameOf(partner, "tu pareja")}
        </h1>
        <p className="mt-1 text-sm text-muted">Vuestra wishlist es sólo vuestra.</p>
      </header>

      <section className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
        <ProfileName name={displayNameOf(me, "")} />

        <div className="px-4 py-3.5">
          <p className="eyebrow text-muted">Email</p>
          <p className="mt-0.5 break-words">{user.email ?? "—"}</p>
        </div>
      </section>

      <Link
        href="/occasions"
        className="flex min-h-14 items-center gap-3 rounded-md border border-border bg-surface px-4 transition active:bg-surface-sunken"
      >
        <CalendarIcon size={20} className="shrink-0 text-muted" />
        <span className="flex-1">Ocasiones</span>
        <ChevronRightIcon size={18} className="shrink-0 text-muted/70" />
      </Link>

      <div className="pb-nav mt-auto pt-4">
        <SignOutButton />
      </div>
    </AppPage>
  );
}

import { redirect } from "next/navigation";

import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { getCoupleState, requireUser } from "@/lib/auth";
import { siteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { CreateCoupleCard } from "./create-couple-card";
import { InviteCard } from "./invite-card";
import { JoinByCodeForm } from "./join-by-code-form";

export const metadata = { title: "Empareja · Wishlist" };

export default async function SetupPage() {
  const user = await requireUser();
  const state = await getCoupleState(user.id);

  if (state.isComplete) redirect("/dashboard");

  // Ya tiene pareja creada pero sigue solo: toca invitar.
  if (state.coupleId) {
    const supabase = await createClient();
    const { data: invitation } = await supabase
      .from("couple_invitations")
      .select("code")
      .is("redeemed_at", null)
      .is("revoked_at", null)
      .maybeSingle();

    const code = invitation?.code ?? null;

    return (
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-12">
        <Brand subtitle="Ya casi. Solo falta que se una tu pareja." />
        <InviteCard code={code} link={code ? `${await siteOrigin()}/join/${code}` : null} />
        <SignOutButton />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-12">
      <Brand subtitle="Para empezar, crea vuestra pareja o únete con una invitación." />
      <CreateCoupleCard />
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
      </div>
      <JoinByCodeForm />
      <SignOutButton />
    </main>
  );
}

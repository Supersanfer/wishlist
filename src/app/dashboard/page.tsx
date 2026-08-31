import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/sign-out-button";
import { getCoupleState, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Wishlist" };

const SECTIONS = [
  { icon: "🎁", label: "Tu wishlist", href: "/wishlist" as const },
  { icon: "💞", label: "La wishlist de tu pareja", href: null },
  { icon: "✈️", label: "Vuestra lista conjunta", href: null },
  { icon: "🎂", label: "Ocasiones", href: null },
];

export default async function DashboardPage() {
  const user = await requireUser();
  const state = await getCoupleState(user.id);

  // El acceso al dashboard exige pareja completa, comprobado contra la base de datos.
  if (!state.isComplete) redirect("/setup");

  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("id, display_name");

  const me = profiles?.find((profile) => profile.id === user.id);
  const partner = profiles?.find((profile) => profile.id === state.partnerId);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {me?.display_name ?? "hola"} 👋
        </h1>
        <p className="text-sm text-muted">
          {partner?.display_name
            ? `${partner.display_name} está conectada ❤️`
            : "Tu pareja está conectada ❤️"}
        </p>
      </header>

      <section className="space-y-3">
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {SECTIONS.map((item) => {
            const row = (
              <>
                <span aria-hidden className="text-lg">
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
                <span className="ml-auto text-xs text-muted">
                  {item.href ? "→" : "Próximamente"}
                </span>
              </>
            );

            return (
              <li key={item.label}>
                {item.href ? (
                  <Link href={item.href} className="flex items-center gap-3 px-4 py-4">
                    {row}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-4 opacity-60">{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-auto pt-4">
        <SignOutButton />
      </div>
    </main>
  );
}

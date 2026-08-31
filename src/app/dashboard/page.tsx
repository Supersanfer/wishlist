import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/sign-out-button";
import { getCoupleState, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Wishlist" };

const NEXT_UP = [
  { icon: "🎁", label: "Tu wishlist" },
  { icon: "💞", label: "La wishlist de tu pareja" },
  { icon: "✈️", label: "Vuestra lista conjunta" },
  { icon: "🎂", label: "Ocasiones" },
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
        <h2 className="text-xs font-medium tracking-wide text-muted uppercase">Muy pronto</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {NEXT_UP.map((item) => (
            <li key={item.label} className="flex items-center gap-3 px-4 py-4">
              <span aria-hidden className="text-lg">
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
              <span className="ml-auto text-xs text-muted">Próximamente</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          Ya estáis emparejados. La wishlist llega en la siguiente fase.
        </p>
      </section>

      <div className="mt-auto pt-4">
        <SignOutButton />
      </div>
    </main>
  );
}

import Link from "next/link";

import { Brand } from "@/components/brand";
import { Alert, Button } from "@/components/ui";
import { getCoupleState, getUser } from "@/lib/auth";
import { INVITE_CODE_PATTERN } from "@/lib/invite-cookie";
import { createClient } from "@/lib/supabase/server";
import { AcceptInviteForm } from "./accept-invite-form";

export const metadata = { title: "Invitación · Wishlist" };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-12">
      {children}
    </main>
  );
}

export default async function JoinPage({ params }: PageProps<"/join/[code]">) {
  const { code } = await params;

  if (!INVITE_CODE_PATTERN.test(code)) {
    return (
      <Shell>
        <Brand subtitle="Invitación" />
        <Alert>Este enlace de invitación no es válido. Pide a tu pareja que te envíe uno nuevo.</Alert>
        <Link href="/" className="text-center text-sm text-accent">
          Ir al inicio
        </Link>
      </Shell>
    );
  }

  const user = await getUser();

  // Sin sesion: el proxy ya ha guardado el codigo en una cookie, asi que tras
  // registrarse o entrar volvera aqui sin tener que copiarlo otra vez.
  if (!user) {
    return (
      <Shell>
        <Brand subtitle="Te han invitado a una wishlist de pareja ❤️" />
        <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted">
          Crea tu cuenta o inicia sesión y te traemos de vuelta aquí para aceptar la invitación.
        </div>
        <div className="space-y-3">
          <Link href="/register" className="block">
            <Button>Crear cuenta</Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="secondary">Ya tengo cuenta</Button>
          </Link>
        </div>
      </Shell>
    );
  }

  const state = await getCoupleState(user.id);

  if (state.coupleId) {
    // RLS solo devuelve la invitacion si pertenece a mi propia pareja.
    const supabase = await createClient();
    const { data: own } = await supabase
      .from("couple_invitations")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    return (
      <Shell>
        <Brand subtitle="Invitación" />
        <Alert tone="info">
          {own
            ? "Esta es tu propia invitación. Compártela con tu pareja para que la abra desde su móvil."
            : "Ya formas parte de una pareja, así que no puedes aceptar esta invitación."}
        </Alert>
        <Link href={state.isComplete ? "/dashboard" : "/setup"} className="block">
          <Button variant="secondary">{state.isComplete ? "Ir al inicio" : "Volver"}</Button>
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <Brand subtitle="Te han invitado a una wishlist de pareja ❤️" />
      <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted">
        Al aceptar, tú y quien te ha invitado compartiréis vuestras listas de deseos.
      </div>
      <AcceptInviteForm code={code} />
    </Shell>
  );
}

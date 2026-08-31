import Link from "next/link";

import { Brand } from "@/components/brand";
import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <>
      <Brand subtitle="Vuestra lista de deseos, solo para vosotros dos." />
      <LoginForm />
      <p className="text-center text-sm text-muted">
        ¿Todavía no tienes cuenta?{" "}
        <Link
          href="/register"
          className="inline-flex h-11 items-center px-1 font-medium text-accent underline underline-offset-4"
        >
          Crear cuenta
        </Link>
      </p>
    </>
  );
}

import Link from "next/link";

import { Brand } from "@/components/brand";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <>
      <Brand subtitle="Crea tu cuenta y empareja con quien tú ya sabes." />
      <RegisterForm />
      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="inline-flex h-11 items-center px-1 font-medium text-accent underline underline-offset-4"
        >
          Entrar
        </Link>
      </p>
    </>
  );
}

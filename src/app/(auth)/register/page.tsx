import Link from "next/link";

import { Brand } from "@/components/brand";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Crear cuenta · Wishlist" };

export default function RegisterPage() {
  return (
    <>
      <Brand subtitle="Crea tu cuenta y empareja con quien tú ya sabes." />
      <RegisterForm />
      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-accent">
          Entrar
        </Link>
      </p>
    </>
  );
}

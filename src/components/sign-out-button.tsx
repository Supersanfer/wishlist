import { signOut } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut} className="text-center">
      <button type="submit" className="text-sm text-muted underline underline-offset-4">
        Cerrar sesión
      </button>
    </form>
  );
}

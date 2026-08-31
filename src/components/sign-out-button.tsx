import { signOut } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <SubmitButton variant="ghost" pendingLabel="Saliendo…">
        Cerrar sesión
      </SubmitButton>
    </form>
  );
}

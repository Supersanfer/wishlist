"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

import { buttonClass, type ButtonSize, type ButtonVariant } from "@/components/ui";

/** Botón de envío que se desactiva solo mientras corre la Server Action. */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
}: {
  children: ReactNode;
  pendingLabel: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={buttonClass(variant, size)}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps, ReactNode } from "react";

const baseButton =
  "flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-base " +
  "font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" }) {
  const look =
    variant === "primary"
      ? "bg-accent text-accent-foreground"
      : "border border-border bg-card text-foreground";
  return <button className={`${baseButton} ${look} ${className}`} {...props} />;
}

/** Botón de envío que se deshabilita solo mientras corre la Server Action. */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
}: {
  children: ReactNode;
  pendingLabel: string;
  variant?: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function Field({
  label,
  hint,
  ...props
}: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-base
                   outline-none placeholder:text-muted focus:border-accent"
        {...props}
      />
      {hint ? <span className="mt-1.5 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Alert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "info" }) {
  const look =
    tone === "error"
      ? "border-danger/30 bg-danger/10 text-danger"
      : "border-border bg-card text-muted";
  return (
    <p role="status" className={`rounded-2xl border px-4 py-3 text-sm ${look}`}>
      {children}
    </p>
  );
}

"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps, ReactNode } from "react";

import { ChevronDownIcon } from "@/components/icons";

const SIZES = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5",
  lg: "h-13 px-6",
} as const;

const VARIANTS = {
  primary: "bg-accent text-accent-foreground",
  secondary: "border border-border-strong bg-surface text-foreground",
  ghost: "text-muted hover:bg-surface-sunken",
  danger: "border border-danger/35 bg-surface text-danger",
} as const;

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex w-full items-center justify-center gap-2 rounded-md
        font-medium transition duration-150 select-none
        active:scale-[0.985] active:brightness-95
        disabled:pointer-events-none disabled:opacity-45
        ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

/** Botón de envío que se desactiva solo mientras corre la Server Action. */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
}: {
  children: ReactNode;
  pendingLabel: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

/**
 * Acción secundaria en texto. Lleva su propia altura de 44px: el patrón de
 * "enlace subrayado de 14px" dejaba objetivos táctiles de 20px.
 */
export function TextButton({
  className = "",
  tone = "muted",
  ...props
}: ComponentProps<"button"> & { tone?: "muted" | "danger" | "accent" }) {
  const color =
    tone === "danger" ? "text-danger" : tone === "accent" ? "text-accent" : "text-muted";
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-md px-3
        text-sm font-medium transition active:scale-[0.985] ${color} ${className}`}
      {...props}
    />
  );
}

const fieldLook =
  "w-full rounded-md border border-border bg-surface px-3.5 text-base text-foreground " +
  "outline-none transition-colors placeholder:text-muted/70 focus:border-accent";

function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-sm font-medium">{children}</span>;
}

export function Field({
  label,
  hint,
  className = "",
  ...props
}: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input className={`h-12 ${fieldLook} ${className}`} {...props} />
      {hint ? <span className="mt-1.5 block text-sm text-muted">{hint}</span> : null}
    </label>
  );
}

export function Textarea({
  label,
  ...props
}: ComponentProps<"textarea"> & { label: string }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea className={`min-h-20 py-3 leading-relaxed ${fieldLook}`} {...props} />
    </label>
  );
}

export function Select({
  label,
  children,
  ...props
}: ComponentProps<"select"> & { label: string }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <div className="relative">
        <select className={`h-12 appearance-none pr-11 ${fieldLook}`} {...props}>
          {children}
        </select>
        {/* Sin esto, un select con appearance-none es indistinguible de un input. */}
        <ChevronDownIcon
          size={18}
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted"
        />
      </div>
    </label>
  );
}

/**
 * Los errores usan `role="alert"` para que un lector de pantalla los anuncie;
 * los avisos neutros usan `role="status"`, que no interrumpe.
 */
export function Alert({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "info" | "success";
}) {
  const look = {
    error: "border-danger/30 bg-danger/8 text-danger",
    info: "border-border bg-surface text-muted",
    success: "border-success/30 bg-success/8 text-success",
  }[tone];

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-md border px-3.5 py-2.5 text-sm ${look}`}
    >
      {children}
    </p>
  );
}

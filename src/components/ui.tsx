import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import { ChevronDownIcon } from "@/components/icons";

// Sin "use client": nada de aquí usa hooks de cliente, así que estos componentes
// funcionan también dentro de Server Components y no engordan el bundle.
// El único que necesita el cliente vive aparte y se reexporta al final.

const SIZES = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5",
  lg: "h-12 px-6",
} as const;

const VARIANTS = {
  primary: "bg-accent text-accent-foreground focus-on-accent",
  secondary: "border border-border-strong bg-surface text-foreground",
  ghost: "text-muted",
  danger: "border border-danger/35 bg-surface text-danger",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

const BASE =
  "inline-flex w-full items-center justify-center gap-2 rounded-md font-medium " +
  "transition duration-150 select-none active:scale-[0.985] active:brightness-95 " +
  "disabled:pointer-events-none disabled:opacity-45";

/**
 * Estilo de botón para elementos que no son `<button>`.
 * Envolver un `<Button>` en un `<Link>` produce `<a><button>`, que es
 * anidamiento interactivo inválido y una parada de tabulador de más.
 */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={`${buttonClass(variant, size)} ${className}`} {...props} />;
}

/**
 * Acción secundaria en texto, con 44px reales de alto: el patrón de "enlace
 * subrayado de 14px" dejaba objetivos táctiles de 20px.
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
  "outline-none transition-colors placeholder:text-muted focus:border-accent";

function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-sm font-medium">{children}</span>;
}

export function Field({
  label,
  hint,
  icon,
  className = "",
  ...props
}: ComponentProps<"input"> & { label: string; hint?: string; icon?: ReactNode }) {
  const hintId = useId();

  return (
    <label className="block">
      <Label>{label}</Label>
      {/* El hint va por aria-describedby: dentro del label se pegaría al nombre
          accesible del campo ("Contraseña Al menos 8 caracteres"). */}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">
            {icon}
          </span>
        ) : null}
        <input
          className={`h-12 ${fieldLook} ${icon ? "pl-10" : ""} ${className}`}
          aria-describedby={hint ? hintId : undefined}
          {...props}
        />
      </div>
      {hint ? (
        <span id={hintId} className="mt-1.5 block text-sm text-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function Textarea({ label, ...props }: ComponentProps<"textarea"> & { label: string }) {
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

export { SubmitButton } from "./submit-button";

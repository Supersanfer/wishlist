"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { DiceIcon, GiftIcon, XIcon } from "@/components/icons";
import { Button, buttonClass } from "@/components/ui";
import {
  BUDGETS,
  selectGift,
  type Budget,
  type GiftCandidate,
} from "@/lib/gift-picker";
import { formatPrice, type WishPriority } from "@/lib/wish-input";

/** Deseo con lo justo para sortearlo y pintarlo en el resultado. */
export type PickableWish = GiftCandidate & {
  title: string;
  currency: string;
  url: string | null;
  occasionName?: string | null;
};

/** Cómo de fuerte lo quiere la pareja. En tercera persona y sin género. */
const PICK_PRIORITY_LABEL: Record<WishPriority, string> = {
  high: "Le encanta",
  medium: "Le gusta",
  low: "Le vendría bien",
};

type Phase = "choose" | "rolling" | "result" | "empty" | "no-match";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/**
 * "Elige por mí": tarjeta-CTA en /partner y una hoja modal que sortea uno de los
 * deseos disponibles de la pareja.
 *
 * Todo ocurre en memoria: `wishes` son los deseos que el usuario YA ve en
 * /partner menos los que él mismo ha reservado. No se consulta nada aquí y, en
 * particular, no se tocan las reservas de nadie: la privacidad la mantiene la
 * página al no pasar más que lo que RLS ya deja ver.
 */
export function GiftPicker({ wishes }: { wishes: PickableWish[] }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const rollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const [phase, setPhase] = useState<Phase>("choose");
  const [budget, setBudget] = useState<Budget>("any");
  const [result, setResult] = useState<PickableWish | null>(null);
  const [spinTitle, setSpinTitle] = useState<string>("");

  const stopRolling = () => {
    if (rollTimer.current) {
      clearInterval(rollTimer.current);
      rollTimer.current = null;
    }
  };

  // Si el componente se desmonta a media animación (p. ej. al navegar), limpia
  // el temporizador y devuelve el scroll del fondo.
  useEffect(() => {
    return () => {
      stopRolling();
      document.body.style.overflow = "";
    };
  }, []);

  // Al revelar el ganador, el foco va a la acción principal.
  useEffect(() => {
    if (phase === "result") viewButtonRef.current?.focus();
  }, [phase, result]);

  function reveal(item: PickableWish) {
    stopRolling();
    setResult(item);
    setPhase("result");
  }

  function run(withBudget: Budget, excludeId: string | null) {
    const pick = selectGift(wishes, { budget: withBudget, excludeId }, Math.random);

    if (pick.status === "empty") return setPhase("empty");
    if (pick.status === "no-match") return setPhase("no-match");

    // Sin animación ni con un único candidato: no hay "sorteo" que enseñar.
    if (prefersReducedMotion() || wishes.length === 1) return reveal(pick.item);

    setPhase("rolling");
    stopRolling();
    let ticks = 0;
    rollTimer.current = setInterval(() => {
      ticks += 1;
      setSpinTitle(wishes[Math.floor(Math.random() * wishes.length)]!.title);
      if (ticks >= 7) reveal(pick.item);
    }, 70);
  }

  function open() {
    setBudget("any");
    setResult(null);
    setPhase("choose");
    dialogRef.current?.showModal();
    document.body.style.overflow = "hidden";
  }

  function close() {
    dialogRef.current?.close();
  }

  /** Lleva a la tarjeta del deseo en su sitio actual de la lista. */
  function viewWish(id: string) {
    const anchor = `wish-${id}`;
    close();
    const el = document.getElementById(anchor);
    if (!el) {
      // Vista filtrada: la tarjeta no está montada. Ir a la lista completa,
      // donde Next desplaza al ancla del hash.
      router.push(`/partner#${anchor}`);
      return;
    }
    requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "center",
      });
      el.classList.add("pick-flash");
      el.addEventListener("animationend", () => el.classList.remove("pick-flash"), {
        once: true,
      });
      (el as HTMLElement).focus({ preventScroll: true });
    });
  }

  const heading = {
    choose: "¿Te ayudo a elegir?",
    rolling: "Eligiendo…",
    result: "Tenemos ganador",
    empty: "Nada que elegir todavía",
    "no-match": "Sin resultados en ese rango",
  }[phase];

  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent"
        >
          <DiceIcon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[1.0625rem] leading-6">¿No sabes qué regalar?</p>
          <p className="mt-0.5 text-sm text-muted">Deja que la app elija por ti.</p>
        </div>
      </div>

      <Button type="button" onClick={open} className="mt-3.5">
        <DiceIcon size={18} />
        Elige por mí
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="picker-sheet"
        onClose={() => {
          stopRolling();
          document.body.style.overflow = "";
        }}
        // Cerrar al tocar fuera del panel (el backdrop apunta al propio dialog).
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <div className="flex max-h-[88vh] flex-col overflow-y-auto p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id={titleId} className="font-display display-sm">
              {heading}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="-mr-1.5 flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition active:scale-95 active:bg-surface-sunken"
            >
              <XIcon size={20} />
            </button>
          </div>

          {phase === "choose" ? (
            <div className="space-y-5">
              <div>
                <p className="mb-2.5 text-sm text-muted">¿Cuánto quieres gastar?</p>
                <div role="group" aria-label="Presupuesto" className="grid grid-cols-2 gap-2">
                  {BUDGETS.map(({ value, label }) => {
                    const active = budget === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setBudget(value)}
                        className={`focus-inset flex h-12 items-center justify-center rounded-md px-3 text-sm font-medium transition active:scale-[0.985] ${
                          active
                            ? "border border-accent bg-accent-soft text-accent"
                            : "border border-border bg-surface text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button type="button" size="lg" onClick={() => run(budget, null)}>
                <DiceIcon size={18} />
                Elige por mí
              </Button>
            </div>
          ) : null}

          {phase === "rolling" ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span
                aria-hidden
                className="flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent"
              >
                <GiftIcon size={30} />
              </span>
              <p
                key={spinTitle}
                aria-hidden
                className="animate-rise font-display display-sm min-h-7 text-muted"
              >
                {spinTitle}
              </p>
              <p role="status" className="sr-only">
                Eligiendo un regalo
              </p>
            </div>
          ) : null}

          {phase === "result" && result ? (
            <div>
              <div className="flex flex-col items-center gap-2 py-2 text-center">
                <span
                  aria-hidden
                  className="mb-1 flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent"
                >
                  <GiftIcon size={30} />
                </span>
                <h3 className="font-display display-md break-words">{result.title}</h3>
                {result.price_cents != null ? (
                  <p className="tabular text-lg font-semibold">
                    {formatPrice(result.price_cents, result.currency)}
                  </p>
                ) : null}
                <p className="text-sm text-muted">
                  {PICK_PRIORITY_LABEL[result.priority]}
                  {result.occasionName ? ` · ${result.occasionName}` : ""}
                </p>
              </div>

              <div className="mt-6 grid gap-2">
                <button
                  ref={viewButtonRef}
                  type="button"
                  onClick={() => viewWish(result.id)}
                  className={buttonClass("primary", "md")}
                >
                  Ver deseo
                </button>
                <button
                  type="button"
                  onClick={() => run(budget, result.id)}
                  className={buttonClass("secondary", "md")}
                >
                  <DiceIcon size={17} />
                  Elegir otro
                </button>
              </div>
            </div>
          ) : null}

          {phase === "empty" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span
                aria-hidden
                className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent"
              >
                <GiftIcon size={26} />
              </span>
              <p className="max-w-[28ch] text-sm text-muted">
                Tu pareja aún no ha añadido deseos que puedas regalar.
              </p>
              <Button type="button" variant="secondary" onClick={close} className="mt-1">
                Entendido
              </Button>
            </div>
          ) : null}

          {phase === "no-match" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="max-w-[30ch] text-sm text-muted">
                No hay deseos en ese rango de precio. ¿Miramos entre todos?
              </p>
              <div className="mt-1 grid w-full gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setBudget("any");
                    run("any", null);
                  }}
                >
                  Buscar entre todos
                </Button>
                <Button type="button" variant="secondary" onClick={() => setPhase("choose")}>
                  Cambiar presupuesto
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </dialog>
    </section>
  );
}

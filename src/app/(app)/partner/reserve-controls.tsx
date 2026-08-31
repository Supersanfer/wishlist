"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

import {
  cancelReservation,
  markReservationPurchased,
  reserveWish,
} from "@/app/actions/reservations";
import { BookmarkIcon, CheckIcon } from "@/components/icons";
import { Alert } from "@/components/ui";
import { initialActionState } from "@/lib/form-state";
import type { Reservation } from "@/lib/queries/reservations";

const control =
  "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md px-3 " +
  "text-sm font-medium transition active:scale-[0.985] disabled:opacity-45";

function Pending({
  children,
  pendingLabel,
  className,
  icon,
}: {
  children: string;
  pendingLabel: string;
  className: string;
  icon?: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={className}>
      {pending ? null : icon}
      {pending ? pendingLabel : children}
    </button>
  );
}

function ReserveButton({ wishId }: { wishId: string }) {
  const [state, formAction] = useActionState(reserveWish, initialActionState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="wish_id" value={wishId} />
      {state.error ? <Alert>{state.error}</Alert> : null}
      <Pending
        pendingLabel="Reservando…"
        icon={<BookmarkIcon size={16} />}
        className={`${control} w-full border border-border-strong bg-surface text-accent`}
      >
        Reservar
      </Pending>
    </form>
  );
}

/** Cancelar y marcar comprado piden confirmación: los dos cuestan de deshacer. */
function ConfirmAction({
  action,
  reservationId,
  label,
  question,
  pendingLabel,
  icon,
  emphasis,
}: {
  action: typeof cancelReservation;
  reservationId: string;
  label: string;
  question: string;
  pendingLabel: string;
  icon?: ReactNode;
  emphasis: "primary" | "quiet";
}) {
  const [asking, setAsking] = useState(false);
  const [state, formAction] = useActionState(action, initialActionState);

  const look =
    emphasis === "primary"
      ? "border border-border-strong bg-surface text-foreground"
      : "text-muted";

  if (!asking) {
    return (
      <div className="flex-1 space-y-2">
        {state.error ? <Alert>{state.error}</Alert> : null}
        <button type="button" onClick={() => setAsking(true)} className={`${control} ${look}`}>
          {icon}
          {label}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex-1 space-y-2">
      <input type="hidden" name="reservation_id" value={reservationId} />
      <p className="text-center text-sm text-muted">{question}</p>
      {state.error ? <Alert>{state.error}</Alert> : null}
      <div className="flex gap-2">
        <Pending
          pendingLabel={pendingLabel}
          className={`${control} border border-border-strong bg-surface text-accent`}
        >
          Sí
        </Pending>
        <button type="button" onClick={() => setAsking(false)} className={`${control} text-muted`}>
          No
        </button>
      </div>
    </form>
  );
}

export function ReserveControls({
  wishId,
  reservation,
}: {
  wishId: string;
  reservation: Reservation | undefined;
}) {
  if (!reservation) return <ReserveButton wishId={wishId} />;

  return (
    <div className="flex gap-2">
      {reservation.status === "purchased" ? null : (
        <ConfirmAction
          action={markReservationPurchased}
          reservationId={reservation.id}
          label="Comprado"
          question="¿Marcarlo como comprado?"
          pendingLabel="Guardando…"
          icon={<CheckIcon size={16} />}
          emphasis="primary"
        />
      )}
      <ConfirmAction
        action={cancelReservation}
        reservationId={reservation.id}
        label="Cancelar"
        question="¿Cancelar la reserva?"
        pendingLabel="Cancelando…"
        emphasis="quiet"
      />
    </div>
  );
}

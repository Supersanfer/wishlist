"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  cancelReservation,
  markReservationPurchased,
  reserveWish,
} from "@/app/actions/reservations";
import { Alert } from "@/components/ui";
import { initialActionState } from "@/lib/form-state";
import type { Reservation } from "@/lib/queries/reservations";

const secondary =
  "flex h-11 flex-1 items-center justify-center rounded-xl border border-border " +
  "px-3 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50";

function PendingButton({
  children,
  pendingLabel,
  className,
}: {
  children: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
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
      <PendingButton
        pendingLabel="Reservando…"
        className="flex h-11 w-full items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-accent-foreground transition active:scale-[0.98] disabled:opacity-50"
      >
        Reservar
      </PendingButton>
    </form>
  );
}

/** Cancelar y marcar comprado piden confirmacion: los dos son dificiles de deshacer. */
function ConfirmForm({
  action,
  label,
  question,
  confirmLabel,
  pendingLabel,
  reservationId,
}: {
  action: typeof cancelReservation;
  label: string;
  question: string;
  confirmLabel: string;
  pendingLabel: string;
  reservationId: string;
}) {
  const [asking, setAsking] = useState(false);
  const [state, formAction] = useActionState(action, initialActionState);

  if (!asking) {
    return (
      <div className="flex-1 space-y-2">
        {state.error ? <Alert>{state.error}</Alert> : null}
        <button type="button" onClick={() => setAsking(true)} className={secondary}>
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
        <PendingButton pendingLabel={pendingLabel} className={secondary}>
          {confirmLabel}
        </PendingButton>
        <button type="button" onClick={() => setAsking(false)} className={secondary}>
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

  const purchased = reservation.status === "purchased";

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-medium">
        {purchased ? "Comprado por ti" : "Reservado por ti"}
      </p>

      <div className="flex gap-2">
        {purchased ? null : (
          <ConfirmForm
            action={markReservationPurchased}
            reservationId={reservation.id}
            label="Marcar comprado"
            question="¿Ya lo has comprado?"
            confirmLabel="Sí, comprado"
            pendingLabel="Guardando…"
          />
        )}
        <ConfirmForm
          action={cancelReservation}
          reservationId={reservation.id}
          label="Cancelar"
          question="¿Cancelar la reserva?"
          confirmLabel="Sí, cancelar"
          pendingLabel="Cancelando…"
        />
      </div>
    </div>
  );
}

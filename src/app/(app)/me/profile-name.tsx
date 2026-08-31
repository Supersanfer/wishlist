"use client";

import { useState, useTransition } from "react";

import { updateProfile } from "@/app/actions/profile";
import { CheckIcon, PencilIcon } from "@/components/icons";
import { Alert, Button, Field } from "@/components/ui";
import { initialActionState } from "@/lib/form-state";

/**
 * El nombre se edita en el sitio: es el único dato editable del perfil y no
 * justifica una pantalla propia.
 */
export function ProfileName({ name }: { name: string }) {
  const [editing, setEditing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateProfile(initialActionState, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
      setJustSaved(true);
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <p className="eyebrow text-muted">Nombre</p>
          <p className="font-display mt-0.5 flex items-center gap-1.5 text-lg break-words">
            {name}
            {justSaved ? (
              <span className="text-success" role="status" aria-label="Guardado">
                <CheckIcon size={16} />
              </span>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setJustSaved(false);
            setEditing(true);
          }}
          aria-label="Editar nombre"
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition active:scale-95"
        >
          <PencilIcon size={18} />
        </button>
      </div>
    );
  }

  return (
    <form action={save} className="space-y-3 p-4">
      <Field
        label="Nombre"
        name="display_name"
        defaultValue={name}
        maxLength={80}
        autoComplete="name"
        enterKeyHint="done"
        required
        autoFocus
      />
      {error ? <Alert>{error}</Alert> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

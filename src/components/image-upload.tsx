"use client";

import { useEffect, useId, useState } from "react";

import { CameraIcon, XIcon } from "@/components/icons";
import {
  ALLOWED_IMAGE_TYPES,
  friendlyImageValidationError,
  MAX_IMAGE_SIZE_BYTES,
  validateImageFile,
} from "@/lib/image-validation";

export function ImageUpload({
  name = "image",
  previewUrl,
  removeName = "remove_image",
}: {
  name?: string;
  previewUrl?: string | null;
  removeName?: string;
}) {
  const id = useId();
  const [selected, setSelected] = useState<File | null>(null);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const currentPreview = removed ? null : objectUrl ?? previewUrl ?? null;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = event.target.files?.[0];
    const result = validateImageFile(file);

    if (!result.ok) {
      setSelected(null);
      setError(friendlyImageValidationError(result.error));
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setSelected(result.file);
    setObjectUrl(URL.createObjectURL(result.file));
    setRemoved(false);
  }

  function handleRemove() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setSelected(null);
    setObjectUrl(null);
    setRemoved(true);
    setError(null);
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={removeName} value={removed ? "1" : ""} />

      {currentPreview ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPreview}
            alt="Vista previa de la imagen"
            className="h-32 w-auto rounded-md border border-border object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Quitar imagen"
            className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm transition active:scale-95"
          >
            <XIcon size={14} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex h-24 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-surface text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
        >
          <CameraIcon size={20} />
          Anadir foto
          <input
            id={id}
            name={name}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            onChange={handleChange}
            className="sr-only"
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        </label>
      )}

      {selected ? (
        <p className="text-xs text-muted">
          {selected.name} · {formatBytes(selected.size)}
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <p className="text-xs text-muted">JPG, PNG o WebP. Maximo {formatBytes(MAX_IMAGE_SIZE_BYTES)}.</p>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

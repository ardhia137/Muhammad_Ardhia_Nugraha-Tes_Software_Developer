import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiRequestError } from "../api";
import { STATUS_LABELS, TYPE_LABELS } from "../status";
import { ENTITY_STATUSES, ENTITY_TYPES } from "../types";
import type { Entity, EntityInput, EntityStatus, EntityType } from "../types";
import {
  emptyFormValues,
  entityFormSchema,
  entityToFormValues,
  toEntityInput,
} from "../validation";
import type { EntityFormValues } from "../validation";

interface EntityFormPanelProps {
  mode: "create" | "edit";
  entity: Entity | null;
  coords: { latitude: number; longitude: number } | null;
  submitting: boolean;
  onSubmit: (input: EntityInput) => Promise<void>;
  onClose: () => void;
}

export default function EntityFormPanel({
  mode,
  entity,
  coords,
  submitting,
  onSubmit,
  onClose,
}: EntityFormPanelProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<EntityFormValues>({
    resolver: zodResolver(entityFormSchema),
    defaultValues: emptyFormValues,
  });

  useEffect(() => {
    if (mode === "edit" && entity) {
      reset(entityToFormValues(entity));
    } else if (mode === "create") {
      reset(emptyFormValues);
    }
    setServerError(null);
  }, [mode, entity, reset]);

  useEffect(() => {
    if (!coords) return;
    setValue("latitude", String(coords.latitude));
    setValue("longitude", String(coords.longitude));
  }, [coords, setValue]);

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSubmit(toEntityInput(values));
    } catch (error) {
      if (error instanceof ApiRequestError) {
        let hasFieldError = false;
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof EntityFormValues, { message });
          hasFieldError = true;
        }
        if (!hasFieldError) setServerError(error.message);
      } else {
        setServerError("Terjadi kesalahan yang tidak terduga.");
      }
    }
  });

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{mode === "create" ? "Tambah Entity" : "Ubah Entity"}</h2>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Tutup">
          ×
        </button>
      </header>

      <form className="panel-body" onSubmit={submit} noValidate>
        {serverError && <div className="banner">{serverError}</div>}
        {mode === "create" && (
          <p className="hint">Klik titik di peta untuk mengisi latitude dan longitude.</p>
        )}

        <div className="form-field">
          <label htmlFor="name">Nama</label>
          <input id="name" type="text" {...register("name")} />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="type">Type</label>
            <select id="type" {...register("type")}>
              <option value="">Pilih type</option>
              {ENTITY_TYPES.map((type: EntityType) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            {errors.type && <p className="field-error">{errors.type.message}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="status">Status</label>
            <select id="status" {...register("status")}>
              <option value="">Pilih status</option>
              {ENTITY_STATUSES.map((status: EntityStatus) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            {errors.status && <p className="field-error">{errors.status.message}</p>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="latitude">Latitude</label>
            <input id="latitude" type="text" inputMode="decimal" {...register("latitude")} />
            {errors.latitude && <p className="field-error">{errors.latitude.message}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="longitude">Longitude</label>
            <input id="longitude" type="text" inputMode="decimal" {...register("longitude")} />
            {errors.longitude && <p className="field-error">{errors.longitude.message}</p>}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="description">Deskripsi</label>
          <textarea id="description" rows={4} {...register("description")} />
          {errors.description && <p className="field-error">{errors.description.message}</p>}
        </div>
      </form>

      <footer className="panel-footer">
        <button type="button" className="button" onClick={onClose} disabled={submitting}>
          Batal
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? "Menyimpan..." : "Simpan"}
        </button>
      </footer>
    </section>
  );
}

import { z } from "zod";
import { ENTITY_STATUSES, ENTITY_TYPES } from "./types";
import type { Entity, EntityInput, EntityStatus, EntityType } from "./types";

function coordinate(min: number, max: number, rangeMessage: string) {
  return z
    .string()
    .min(1, { error: "wajib diisi" })
    .refine((value) => value.trim() !== "" && !Number.isNaN(Number(value)), {
      error: "harus berupa angka",
    })
    .refine((value) => Number(value) >= min && Number(value) <= max, {
      error: rangeMessage,
    });
}

export const entityFormSchema = z.object({
  name: z.string().min(1, { error: "wajib diisi" }).max(100, { error: "maksimal 100 karakter" }),
  type: z
    .string()
    .min(1, { error: "wajib diisi" })
    .refine((value) => ENTITY_TYPES.includes(value as EntityType), {
      error: "harus salah satu dari vehicle, iot, facility",
    }),
  status: z
    .string()
    .min(1, { error: "wajib diisi" })
    .refine((value) => ENTITY_STATUSES.includes(value as EntityStatus), {
      error: "harus salah satu dari active, inactive, maintenance",
    }),
  latitude: coordinate(-90, 90, "harus antara -90 dan 90"),
  longitude: coordinate(-180, 180, "harus antara -180 dan 180"),
  description: z.string().max(500, { error: "maksimal 500 karakter" }),
});

export type EntityFormValues = z.infer<typeof entityFormSchema>;

export function entityToFormValues(entity: Entity): EntityFormValues {
  return {
    name: entity.name,
    type: entity.type,
    status: entity.status,
    latitude: String(entity.latitude),
    longitude: String(entity.longitude),
    description: entity.description,
  };
}

export const emptyFormValues: EntityFormValues = {
  name: "",
  type: "",
  status: "",
  latitude: "",
  longitude: "",
  description: "",
};

export function toEntityInput(values: EntityFormValues): EntityInput {
  return {
    name: values.name,
    type: values.type as EntityType,
    status: values.status as EntityStatus,
    latitude: Number(values.latitude),
    longitude: Number(values.longitude),
    description: values.description,
  };
}

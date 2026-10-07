export type EntityType = "vehicle" | "iot" | "facility";
export type EntityStatus = "active" | "inactive" | "maintenance";

export interface Entity {
  id: number;
  name: string;
  type: EntityType;
  status: EntityStatus;
  latitude: number;
  longitude: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface EntityInput {
  name: string;
  type: EntityType;
  status: EntityStatus;
  latitude: number;
  longitude: number;
  description: string;
}

export interface ListParams {
  q?: string;
  status?: string;
  type?: string;
}

export const ENTITY_TYPES: EntityType[] = ["vehicle", "iot", "facility"];
export const ENTITY_STATUSES: EntityStatus[] = ["active", "inactive", "maintenance"];

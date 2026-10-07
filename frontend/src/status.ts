import type { EntityStatus, EntityType } from "./types";

export const STATUS_COLORS: Record<EntityStatus, string> = {
  active: "#16a34a",
  inactive: "#9ca3af",
  maintenance: "#f59e0b",
};

export const STATUS_LABELS: Record<EntityStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  maintenance: "Maintenance",
};

export const TYPE_LABELS: Record<EntityType, string> = {
  vehicle: "Vehicle",
  iot: "IoT",
  facility: "Facility",
};

import type { Entity, EntityInput, ListParams } from "./types";

export class ApiRequestError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiRequestError(0, "server tidak dapat dihubungi");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const payload = body as { errors?: Record<string, string>; error?: string } | null;
    const fieldErrors = payload?.errors ?? {};
    const message = payload?.error ?? `kesalahan HTTP ${response.status}`;
    throw new ApiRequestError(response.status, message, fieldErrors);
  }

  return body as T;
}

function queryParam(params: ListParams): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.type) search.set("type", params.type);
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function listEntities(params: ListParams): Promise<Entity[]> {
  return request<Entity[]>(`/api/v1/entities${queryParam(params)}`);
}

export function createEntity(input: EntityInput): Promise<Entity> {
  return request<Entity>("/api/v1/entities", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateEntity(id: number, input: EntityInput): Promise<Entity> {
  return request<Entity>(`/api/v1/entities/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteEntity(id: number): Promise<void> {
  return request<void>(`/api/v1/entities/${id}`, { method: "DELETE" });
}

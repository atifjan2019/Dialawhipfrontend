"use client";

import type { ApiError } from "./types";

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public body: ApiError,
  ) {
    super(body.message || `Request failed (${status})`);
  }
}

export interface FetchOpts extends RequestInit {
  query?: Record<string, string | number | boolean | undefined | null>;
  json?: unknown;
  idempotencyKey?: string;
}

function buildUrl(path: string, query?: FetchOpts["query"]): string {
  const url = new URL(path.startsWith("http") ? path : `${window.location.origin}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiClient<T = unknown>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { query, json, idempotencyKey, headers, body, ...rest } = opts;

  const h = new Headers(headers);
  h.set("Accept", "application/json");
  if (json !== undefined) h.set("Content-Type", "application/json");
  if (idempotencyKey) h.set("Idempotency-Key", idempotencyKey);

  const targetPath = path.startsWith("/api/") && !path.startsWith("/api/proxy/")
    ? `/api/proxy${path.replace(/^\/api/, "")}`
    : path;

  const res = await fetch(buildUrl(targetPath, query), {
    ...rest,
    headers: h,
    body: json !== undefined ? JSON.stringify(json) : body,
    credentials: "same-origin",
  });

  if (!res.ok) {
    let payload: ApiError;
    try {
      payload = (await res.json()) as ApiError;
    } catch {
      payload = { message: `Request failed (${res.status})` };
    }
    throw new ApiRequestError(res.status, payload);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function randomIdempotencyKey(): string {
  return crypto.randomUUID();
}

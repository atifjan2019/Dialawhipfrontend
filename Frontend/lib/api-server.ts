import { cookies } from "next/headers";
import type { ApiError } from "./types";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "catering_session";

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
  auth?: boolean;
}

async function getToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export function buildUrl(path: string, query?: FetchOpts["query"]): string {
  const url = new URL(path.startsWith("http") ? path : `${API_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiServer<T = unknown>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { query, json, idempotencyKey, auth = true, headers, body, ...rest } = opts;

  const h = new Headers(headers);
  h.set("Accept", "application/json");
  if (json !== undefined) h.set("Content-Type", "application/json");
  if (idempotencyKey) h.set("Idempotency-Key", idempotencyKey);
  if (auth) {
    const token = await getToken();
    if (token) h.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: h,
    body: json !== undefined ? JSON.stringify(json) : body,
    cache: rest.cache ?? "no-store",
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

export async function getCurrentUser() {
  try {
    return await apiServer<{ data: import("./types").User }>("/api/v1/auth/me").then((r) => r.data);
  } catch (e) {
    if (e instanceof ApiRequestError && (e.status === 401 || e.status === 419)) return null;
    throw e;
  }
}

import { headers } from "next/headers";
import type { ApiError, User } from "./types";

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
  /** Legacy flag — auth is now driven by Supabase cookies; option is accepted but ignored. */
  auth?: boolean;
}

async function selfOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function buildUrl(path: string, query?: FetchOpts["query"]): Promise<string> {
  const base = path.startsWith("http") ? path : `${await selfOrigin()}${path}`;
  const url = new URL(base);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiServer<T = unknown>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { query, json, idempotencyKey, headers: extraHeaders, body, auth: _auth, ...rest } = opts;
  void _auth;

  const h = new Headers(extraHeaders);
  h.set("Accept", "application/json");
  if (json !== undefined) h.set("Content-Type", "application/json");
  if (idempotencyKey) h.set("Idempotency-Key", idempotencyKey);

  const reqHeaders = await headers();
  const cookie = reqHeaders.get("cookie");
  if (cookie) h.set("cookie", cookie);

  const url = await buildUrl(path, query);
  const res = await fetch(url, {
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

export async function getCurrentUser(): Promise<User | null> {
  // Read directly from Supabase rather than round-tripping through HTTP.
  const { currentProfile } = await import("./api/auth");
  const profile = await currentProfile();
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    verification_status: profile.verification_status,
    verified_at: profile.verified_at,
  };
}

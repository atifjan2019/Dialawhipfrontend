import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { supabaseAdmin } from "../supabase/admin";

// If the request carries Idempotency-Key, replay any cached response and skip
// re-execution. Otherwise run `exec` and cache the (status, body) pair.
export async function withIdempotency(
  req: NextRequest,
  userId: string | null,
  exec: () => Promise<Response>,
): Promise<Response> {
  if (!["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) return exec();
  const key = req.headers.get("idempotency-key");
  if (!key) return exec();

  const admin = supabaseAdmin();
  const { data: existing } = await admin
    .from("idempotency_keys")
    .select("response_status,response_body")
    .eq("key", key)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(existing.response_body ?? {}, {
      status: existing.response_status,
      headers: { "Idempotent-Replay": "true" },
    });
  }

  const res = await exec();
  if (res.status >= 200 && res.status < 300) {
    const cloned = res.clone();
    const text = await cloned.text();
    let parsed: unknown = null;
    try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
    const hash = createHash("sha256").update(text).digest("hex");
    await admin.from("idempotency_keys").insert({
      key, user_id: userId, response_hash: hash,
      response_status: res.status, response_body: parsed,
    });
  }
  return res;
}

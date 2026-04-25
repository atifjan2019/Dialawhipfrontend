import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, notFound } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeIdVerification } from "@/lib/api/resources";

const Body = z.object({ expires_at: z.string().date().optional().nullable() });
type Ctx = { params: Promise<{ verification: string }> };

export const POST = handle(async (req: NextRequest, { params }: Ctx) => {
  const reviewer = await requireRole("admin", "staff");
  const { verification: id } = await params;
  const body = await parseJson(req, Body);
  const admin = supabaseAdmin();
  const { data: row } = await admin.from("id_verifications").select("user_id").eq("id", id).single();
  if (!row) return notFound();

  const expiresAt = body.expires_at ?? new Date(Date.now() + 2 * 365 * 86400000).toISOString().slice(0, 10);
  await admin.from("id_verifications").update({
    status: "approved",
    reviewed_by: reviewer.id,
    reviewed_at: new Date().toISOString(),
    expires_at: expiresAt,
    rejection_reason: null,
  }).eq("id", id);
  await admin.from("profiles").update({
    verification_status: "verified",
    verified_at: new Date().toISOString(),
  }).eq("id", row.user_id);

  const { data: full } = await admin
    .from("id_verifications")
    .select("*, user:profiles!id_verifications_user_id_fkey(*), reviewer:profiles!id_verifications_reviewed_by_fkey(*)")
    .eq("id", id)
    .single();
  return ok(serializeIdVerification(full!));
});

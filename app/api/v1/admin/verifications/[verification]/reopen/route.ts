import type { NextRequest } from "next/server";
import { handle, ok, notFound } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeIdVerification } from "@/lib/api/resources";

type Ctx = { params: Promise<{ verification: string }> };

/**
 * Move an already-decided verification back to "pending" so it can be
 * re-reviewed. Clears reviewer, reviewed_at, expires_at, rejection_reason.
 */
export const POST = handle(async (_req: NextRequest, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { verification: id } = await params;
  const admin = supabaseAdmin();

  const { data: row } = await admin.from("id_verifications").select("user_id").eq("id", id).single();
  if (!row) return notFound();

  await admin.from("id_verifications").update({
    status: "pending",
    reviewed_by: null,
    reviewed_at: null,
    expires_at: null,
    rejection_reason: null,
  }).eq("id", id);

  // Reflect on the user profile too — they'll see the "Under review" copy
  // again on /account/verification.
  await admin.from("profiles").update({
    verification_status: "pending",
    verified_at: null,
  }).eq("id", row.user_id);

  const { data: full } = await admin
    .from("id_verifications")
    .select("*, user:profiles!id_verifications_user_id_fkey(*), reviewer:profiles!id_verifications_reviewed_by_fkey(*)")
    .eq("id", id)
    .single();
  return ok(serializeIdVerification(full!));
});

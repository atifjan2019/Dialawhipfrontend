import { handle, ok, notFound } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeIdVerification } from "@/lib/api/resources";

type Ctx = { params: Promise<{ verification: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { verification: id } = await params;
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("id_verifications")
    .select("*, user:profiles!id_verifications_user_id_fkey(*), reviewer:profiles!id_verifications_reviewed_by_fkey(*)")
    .eq("id", id)
    .single();
  if (!data) return notFound();
  return ok(serializeIdVerification(data));
});

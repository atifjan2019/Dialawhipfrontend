import type { NextRequest } from "next/server";
import { handle, okList } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeIdVerification } from "@/lib/api/resources";

export const GET = handle(async (req: NextRequest) => {
  await requireRole("admin", "staff");
  const sp = req.nextUrl.searchParams;
  const status = sp.get("filter[status]") || sp.get("status") || "pending";
  const search = sp.get("filter[search]") || sp.get("search");
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 25) || 25));
  const admin = supabaseAdmin();
  let q = admin
    .from("id_verifications")
    .select("*, user:profiles!id_verifications_user_id_fkey(*), reviewer:profiles!id_verifications_reviewed_by_fkey(*)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (status && status !== "all") q = q.eq("status", status);
  const { data } = await q;
  let rows = data ?? [];
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter((v) => {
      const u = Array.isArray(v.user) ? v.user[0] : (v.user as { name?: string; email?: string } | null);
      return u && ((u.name?.toLowerCase().includes(s)) || (u.email?.toLowerCase().includes(s)));
    });
  }
  return okList(rows.map(serializeIdVerification));
});

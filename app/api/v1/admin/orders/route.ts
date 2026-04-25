import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeOrder } from "@/lib/api/resources";

const SORT_FIELDS = new Set(["created_at", "total_pence", "status", "reference"]);

export const GET = handle(async (req: NextRequest) => {
  await requireRole("admin", "staff");
  const sp = req.nextUrl.searchParams;
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 25) || 25));
  const status = sp.get("filter[status]") || sp.get("status");
  const search = sp.get("filter[search]") || sp.get("search");
  const sortRaw = sp.get("sort") ?? "-created_at";
  const ascending = !sortRaw.startsWith("-");
  const sortField = sortRaw.replace(/^[-+]/, "");
  const sortColumn = SORT_FIELDS.has(sortField) ? sortField : "created_at";

  const admin = supabaseAdmin();
  let q = admin
    .from("orders")
    .select(`*,
      customer:profiles!orders_customer_id_fkey(*),
      driver:profiles!orders_assigned_driver_id_fkey(*),
      address:addresses(*)`)
    .order(sortColumn, { ascending })
    .limit(limit);
  if (status) q = q.eq("status", status);
  if (search) q = q.or(`reference.ilike.%${search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return ok((data ?? []).map(serializeOrder));
});

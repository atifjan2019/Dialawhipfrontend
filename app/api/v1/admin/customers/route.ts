import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeUser } from "@/lib/api/resources";

export const GET = handle(async (req: NextRequest) => {
  await requireRole("admin", "staff");
  const sp = req.nextUrl.searchParams;
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 25) || 25));
  const search = sp.get("filter[search]") || sp.get("search");
  const admin = supabaseAdmin();
  let q = admin.from("profiles").select("*").eq("role", "customer").order("created_at", { ascending: false }).limit(limit);
  if (search) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  const { data: customers } = await q;
  if (!customers) return ok([]);

  const ids = customers.map((c) => c.id);
  const { data: agg } = await admin.from("orders").select("customer_id,total_pence").in("customer_id", ids);
  const counts = new Map<string, { count: number; total: number }>();
  for (const row of agg ?? []) {
    const cur = counts.get(row.customer_id) ?? { count: 0, total: 0 };
    cur.count += 1;
    cur.total += row.total_pence ?? 0;
    counts.set(row.customer_id, cur);
  }
  const out = customers.map((c) => ({
    ...serializeUser(c),
    orders_count: counts.get(c.id)?.count ?? 0,
    lifetime_pence: counts.get(c.id)?.total ?? 0,
  }));
  return ok(out);
});

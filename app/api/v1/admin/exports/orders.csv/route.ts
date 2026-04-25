import { handle } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const GET = handle(async () => {
  await requireRole("admin", "staff");
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("orders")
    .select("reference,created_at,status,total_pence,customer:profiles!orders_customer_id_fkey(email)")
    .order("created_at", { ascending: false })
    .limit(10000);

  const rows = ["reference,created_at,status,customer_email,total_pence"];
  for (const o of data ?? []) {
    const email = Array.isArray(o.customer) ? o.customer[0]?.email : (o.customer as { email?: string } | null)?.email ?? "";
    rows.push([o.reference, o.created_at, o.status, email, o.total_pence].map(csvCell).join(","));
  }
  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});

import { handle, ok, notFound } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeUser, serializeAddress, serializeOrder } from "@/lib/api/resources";

type Ctx = { params: Promise<{ customer: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { customer: id } = await params;
  const admin = supabaseAdmin();
  const { data: customer } = await admin.from("profiles").select("*").eq("id", id).single();
  if (!customer || customer.role !== "customer") return notFound();
  const [{ data: orders }, { data: addresses }] = await Promise.all([
    admin.from("orders").select("*, items:order_items(*)").eq("customer_id", id).order("created_at", { ascending: false }).limit(50),
    admin.from("addresses").select("*").eq("user_id", id).order("is_default", { ascending: false }),
  ]);
  return ok({
    ...serializeUser(customer),
    orders: (orders ?? []).map(serializeOrder),
    addresses: (addresses ?? []).map(serializeAddress),
  });
});

import { handle, ok, notFound, forbidden } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeOrder } from "@/lib/api/resources";

type Ctx = { params: Promise<{ order: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const driver = await requireRole("driver", "admin");
  const { order: id } = await params;
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("orders")
    .select(`*, items:order_items(*), address:addresses(*),
      customer:profiles!orders_customer_id_fkey(*),
      events:order_events(*, actor:profiles!order_events_actor_user_id_fkey(*))`)
    .eq("id", id)
    .single();
  if (!data) return notFound();
  if (data.assigned_driver_id !== driver.id && driver.role !== "admin") return forbidden();

  // For age-restricted orders, also include a short-lived signed URL to the
  // customer's most-recent approved ID document so the driver can confirm
  // the person at the door matches the photo on file. URL expires in 30 min.
  let customer_id_card: { url: string; doc_type: string } | null = null;
  const hasAgeRestricted = (data.items ?? []).some((i: { product_snapshot_json?: { is_age_restricted?: boolean } }) =>
    i.product_snapshot_json?.is_age_restricted === true,
  );
  if (hasAgeRestricted && data.customer_id) {
    const { data: idv } = await admin
      .from("id_verifications")
      .select("file_path,doc_type")
      .eq("user_id", data.customer_id)
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (idv?.file_path) {
      const { data: signed } = await admin.storage
        .from("id-verifications")
        .createSignedUrl(idv.file_path, 60 * 30);
      if (signed?.signedUrl) {
        customer_id_card = { url: signed.signedUrl, doc_type: idv.doc_type };
      }
    }
  }

  const serialized = serializeOrder(data);
  return ok({ ...serialized, customer_id_card });
});

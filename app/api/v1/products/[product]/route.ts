import { handle, ok, notFound } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeProduct } from "@/lib/api/resources";

type Ctx = { params: Promise<{ product: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const { product: slug } = await params;
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("products")
    .select("*, category:categories!products_category_id_fkey(*), variants:product_variants(*)")
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();
  if (error || !data || !data.is_active) return notFound("Product not found");
  const activeVariants = (data.variants ?? []).filter((v: { is_active: boolean }) => v.is_active);
  return ok(serializeProduct({ ...data, variants: activeVariants }));
});

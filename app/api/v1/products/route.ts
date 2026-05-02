import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeProduct } from "@/lib/api/resources";

export const GET = handle(async (req: NextRequest) => {
  const admin = supabaseAdmin();
  const params = req.nextUrl.searchParams;
  const limit = Math.min(100, Math.max(1, Number(params.get("limit") ?? 25) || 25));
  const categorySlug = params.get("filter[category]") || params.get("category");
  const search = params.get("filter[search]") || params.get("search");
  const featured = params.get("filter[featured]") || params.get("featured");

  let query = admin
    .from("products")
    .select("*, category:categories!products_category_id_fkey(*), variants:product_variants(*)")
    .eq("is_active", true)
    .is("deleted_at", null)
    .limit(limit);

  if (featured === "true" || featured === "1") {
    query = query.eq("is_featured", true).order("updated_at", { ascending: false });
  } else {
    query = query.order("name", { ascending: true });
  }

  if (categorySlug) {
    const { data: cat } = await admin.from("categories").select("id").eq("slug", categorySlug).single();
    if (cat) query = query.eq("category_id", cat.id);
    else return ok([]);
  }
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  const products = (data ?? []).map((p) => {
    const activeVariants = (p.variants ?? []).filter((v: { is_active: boolean }) => v.is_active);
    return serializeProduct({ ...p, variants: activeVariants });
  });
  return ok(products);
});

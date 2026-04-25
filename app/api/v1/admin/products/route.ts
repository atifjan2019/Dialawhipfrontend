import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, okList, created, validationError } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeProduct } from "@/lib/api/resources";

const VariantSchema = z.object({
  id: z.string().optional().nullable(),
  label: z.string().min(1).max(120),
  price_pence: z.number().int().min(0).max(10_000_000),
  qty_multiplier: z.number().int().min(1).max(1000).optional().nullable(),
  stock_count: z.number().int().min(0).optional().nullable(),
  sku: z.string().max(80).optional().nullable(),
  sort_order: z.number().int().optional().nullable(),
  is_active: z.boolean().optional().nullable(),
});

const ProductBody = z.object({
  category_id: z.string(),
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(160),
  brand: z.string().max(80).optional().nullable(),
  description: z.string().optional().nullable(),
  price_pence: z.number().int().min(0).max(1_000_000),
  image_url: z.string().url().optional().nullable(),
  gallery_urls: z.array(z.string().max(1024)).max(20).optional().nullable(),
  options: z.unknown().optional().nullable(),
  short_spec: z.unknown().optional().nullable(),
  is_active: z.boolean().optional(),
  is_age_restricted: z.boolean().optional(),
  available_from: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  available_until: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  stock_count: z.number().int().min(0).optional().nullable(),
  variants: z.array(VariantSchema).max(50).optional().nullable(),
});

export const GET = handle(async (req: NextRequest) => {
  await requireRole("admin", "staff");
  const sp = req.nextUrl.searchParams;
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 25) || 25));
  const categorySlug = sp.get("filter[category]") || sp.get("category");
  const admin = supabaseAdmin();
  let q = admin
    .from("products")
    .select("*, category:categories!products_category_id_fkey(*), variants:product_variants(*)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (categorySlug) {
    const { data: cat } = await admin.from("categories").select("id").eq("slug", categorySlug).single();
    if (cat) q = q.eq("category_id", cat.id);
    else return okList([]);
  }
  const { data, error } = await q;
  if (error) throw error;
  return okList((data ?? []).map((p) => serializeProduct(p)));
});

export const POST = handle(async (req: NextRequest) => {
  await requireRole("admin", "staff");
  const body = await parseJson(req, ProductBody);
  const admin = supabaseAdmin();
  const { count } = await admin.from("products").select("id", { count: "exact", head: true }).eq("slug", body.slug);
  if ((count ?? 0) > 0) return validationError({ slug: ["The slug has already been taken."] });

  const { data: product, error } = await admin
    .from("products")
    .insert({
      category_id: body.category_id,
      name: body.name,
      slug: body.slug,
      brand: body.brand ?? null,
      description: body.description ?? null,
      price_pence: body.price_pence,
      image_url: body.image_url ?? null,
      gallery_urls: body.gallery_urls ?? null,
      options_json: body.options ?? null,
      short_spec: body.short_spec ?? null,
      is_active: body.is_active ?? true,
      is_age_restricted: body.is_age_restricted ?? false,
      available_from: body.available_from ?? null,
      available_until: body.available_until ?? null,
      stock_count: body.stock_count ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;

  if (body.variants?.length) {
    const rows = body.variants.map((v) => ({
      product_id: product.id,
      label: v.label,
      price_pence: v.price_pence,
      qty_multiplier: v.qty_multiplier ?? 1,
      stock_count: v.stock_count ?? null,
      sku: v.sku ?? null,
      sort_order: v.sort_order ?? 0,
      is_active: v.is_active ?? true,
    }));
    await admin.from("product_variants").insert(rows);
  }

  const { data: full } = await admin
    .from("products")
    .select("*, category:categories!products_category_id_fkey(*), variants:product_variants(*)")
    .eq("id", product.id)
    .single();
  return created(serializeProduct(full!));
});

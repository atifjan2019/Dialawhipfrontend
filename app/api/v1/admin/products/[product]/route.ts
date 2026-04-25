import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, notFound } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeProduct } from "@/lib/api/resources";

const VariantSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  label: z.string().min(1).max(120),
  price_pence: z.number().int().min(0).max(10_000_000),
  qty_multiplier: z.number().int().min(1).max(1000).optional().nullable(),
  stock_count: z.number().int().min(0).optional().nullable(),
  sku: z.string().max(80).optional().nullable(),
  sort_order: z.number().int().optional().nullable(),
  is_active: z.boolean().optional().nullable(),
});

const ProductBody = z.object({
  category_id: z.string().uuid({ message: "Pick a category" }),
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

type Ctx = { params: Promise<{ product: string }> };

export const GET = handle(async (_req: NextRequest, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { product: id } = await params;
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("products")
    .select("*, category:categories!products_category_id_fkey(*), variants:product_variants(*)")
    .eq("id", id)
    .single();
  if (!data) return notFound();
  return ok(serializeProduct(data));
});

export const PATCH = handle(async (req: NextRequest, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { product: id } = await params;
  const body = await parseJson(req, ProductBody);
  const admin = supabaseAdmin();
  const { error } = await admin.from("products").update({
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
  }).eq("id", id);
  if (error) throw error;

  if (body.variants !== undefined) {
    const incoming = body.variants ?? [];
    const incomingIds = new Set(incoming.filter((v) => v.id).map((v) => v.id as string));
    const { data: existing } = await admin.from("product_variants").select("id").eq("product_id", id);
    const toDelete = (existing ?? []).filter((v) => !incomingIds.has(v.id)).map((v) => v.id);
    if (toDelete.length) await admin.from("product_variants").delete().in("id", toDelete);
    for (const v of incoming) {
      const row = {
        product_id: id,
        label: v.label,
        price_pence: v.price_pence,
        qty_multiplier: v.qty_multiplier ?? 1,
        stock_count: v.stock_count ?? null,
        sku: v.sku ?? null,
        sort_order: v.sort_order ?? 0,
        is_active: v.is_active ?? true,
      };
      if (v.id) await admin.from("product_variants").update(row).eq("id", v.id);
      else await admin.from("product_variants").insert(row);
    }
  }

  const { data: full } = await admin
    .from("products")
    .select("*, category:categories!products_category_id_fkey(*), variants:product_variants(*)")
    .eq("id", id)
    .single();
  return ok(serializeProduct(full!));
});

export const DELETE = handle(async (_req: NextRequest, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { product: id } = await params;
  const admin = supabaseAdmin();
  await admin.from("products").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  return ok({ deleted: true });
});

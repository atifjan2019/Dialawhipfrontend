import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeProduct } from "@/lib/api/resources";

const FeaturedBody = z.object({
  is_featured: z.boolean(),
});

type Row = Record<string, unknown>;
type Ctx = { params: Promise<{ product: string }> };

function isMissingFeaturedColumn(error: { message?: string; code?: string } | null) {
  return error?.code === "PGRST204" && /is_featured/i.test(error.message ?? "");
}

function optionsWithFeatured(options: unknown, isFeatured: boolean) {
  return {
    ...(options && typeof options === "object" && !Array.isArray(options) ? options : {}),
    is_featured: isFeatured,
  };
}

async function updateJsonFeatured(admin: ReturnType<typeof supabaseAdmin>, id: string, isFeatured: boolean) {
  const { data, error } = await admin.from("products").select("options_json").eq("id", id).single();
  if (error) throw error;
  return admin
    .from("products")
    .update({ options_json: optionsWithFeatured((data as Row).options_json, isFeatured) })
    .eq("id", id);
}

async function clearOtherJsonFeatured(admin: ReturnType<typeof supabaseAdmin>, currentProductId: string) {
  const { data, error } = await admin
    .from("products")
    .select("id, options_json")
    .neq("id", currentProductId)
    .is("deleted_at", null);
  if (error) throw error;

  const updates = await Promise.all((data ?? []).map((p) => admin
    .from("products")
    .update({ options_json: optionsWithFeatured(p.options_json, false) })
    .eq("id", p.id)));

  const failed = updates.find((result) => result.error);
  if (failed?.error) throw failed.error;
}

export const PATCH = handle(async (req: NextRequest, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { product: id } = await params;
  const body = await parseJson(req, FeaturedBody);
  const admin = supabaseAdmin();

  if (body.is_featured) {
    const clear = await admin
      .from("products")
      .update({ is_featured: false })
      .neq("id", id)
      .is("deleted_at", null);

    if (isMissingFeaturedColumn(clear.error)) await clearOtherJsonFeatured(admin, id);
    else if (clear.error) throw clear.error;
  }

  const update = await admin
    .from("products")
    .update({ is_featured: body.is_featured })
    .eq("id", id);

  if (isMissingFeaturedColumn(update.error)) {
    const fallback = await updateJsonFeatured(admin, id, body.is_featured);
    if (fallback.error) throw fallback.error;
  } else if (update.error) {
    throw update.error;
  }

  const { data, error } = await admin
    .from("products")
    .select("*, category:categories!products_category_id_fkey(*), variants:product_variants(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return ok(serializeProduct(data));
});

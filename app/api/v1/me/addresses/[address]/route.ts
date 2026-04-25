import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, notFound, forbidden } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeAddress } from "@/lib/api/resources";

const AddressBody = z.object({
  line1: z.string().min(1).max(160),
  line2: z.string().max(160).optional().nullable(),
  city: z.string().min(1).max(80),
  postcode: z.string().regex(/^[A-Z0-9\s]{5,10}$/i),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  is_default: z.boolean().optional(),
});

type Ctx = { params: Promise<{ address: string }> };

async function authorize(addressId: string, userId: string) {
  const admin = supabaseAdmin();
  const { data } = await admin.from("addresses").select("user_id").eq("id", addressId).single();
  if (!data) return "not_found" as const;
  if (data.user_id !== userId) return "forbidden" as const;
  return "ok" as const;
}

export const PATCH = handle(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireRole("customer", "staff", "admin");
  const { address: id } = await params;
  const auth = await authorize(id, user.id);
  if (auth === "not_found") return notFound();
  if (auth === "forbidden") return forbidden();

  const body = await parseJson(req, AddressBody);
  const admin = supabaseAdmin();
  if (body.is_default) {
    await admin.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }
  const { data, error } = await admin
    .from("addresses")
    .update({
      line1: body.line1,
      line2: body.line2 ?? null,
      city: body.city,
      postcode: body.postcode.toUpperCase().replace(/\s+/g, ""),
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      is_default: !!body.is_default,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return ok(serializeAddress(data));
});

export const DELETE = handle(async (_req: NextRequest, { params }: Ctx) => {
  const user = await requireRole("customer", "staff", "admin");
  const { address: id } = await params;
  const auth = await authorize(id, user.id);
  if (auth === "not_found") return notFound();
  if (auth === "forbidden") return forbidden();
  const admin = supabaseAdmin();
  await admin.from("addresses").delete().eq("id", id);
  return ok({ deleted: true });
});

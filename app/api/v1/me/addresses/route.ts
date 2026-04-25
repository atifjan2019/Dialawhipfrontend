import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, okList, created } from "@/lib/api/responses";
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

function normalisePostcode(s: string) { return s.toUpperCase().replace(/\s+/g, ""); }

export const GET = handle(async () => {
  const user = await requireRole("customer", "staff", "admin", "driver");
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  return okList((data ?? []).map(serializeAddress));
});

export const POST = handle(async (req: NextRequest) => {
  const user = await requireRole("customer", "staff", "admin");
  const body = await parseJson(req, AddressBody);
  const admin = supabaseAdmin();
  if (body.is_default) {
    await admin.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }
  const { data, error } = await admin
    .from("addresses")
    .insert({
      user_id: user.id,
      line1: body.line1,
      line2: body.line2 ?? null,
      city: body.city,
      postcode: normalisePostcode(body.postcode),
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      is_default: !!body.is_default,
    })
    .select("*")
    .single();
  if (error) throw error;
  return created(serializeAddress(data));
});

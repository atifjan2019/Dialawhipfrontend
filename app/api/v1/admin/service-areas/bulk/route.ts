import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeServiceArea } from "@/lib/api/resources";

const Body = z.object({
  areas: z.array(z.object({
    postcode_prefix: z.string().min(1).max(8),
    delivery_fee_pence: z.number().int().min(0).max(100_000),
    priority_fee_pence: z.number().int().min(0).max(100_000).optional().nullable(),
    super_fee_pence: z.number().int().min(0).max(100_000).optional().nullable(),
    eta_standard_minutes: z.number().int().min(0).max(10_000).optional().nullable(),
    eta_priority_minutes: z.number().int().min(0).max(10_000).optional().nullable(),
    is_active: z.boolean().optional().nullable(),
  })).max(300),
});

export const POST = handle(async (req: NextRequest) => {
  await requireRole("admin", "staff");
  const body = await parseJson(req, Body);
  const rows = body.areas.map((a) => ({
    postcode_prefix: a.postcode_prefix.toUpperCase().replace(/\s+/g, ""),
    delivery_fee_pence: a.delivery_fee_pence,
    priority_fee_pence: a.priority_fee_pence ?? 500,
    super_fee_pence: a.super_fee_pence ?? 1500,
    eta_standard_minutes: a.eta_standard_minutes ?? 25,
    eta_priority_minutes: a.eta_priority_minutes ?? 12,
    is_active: a.is_active ?? true,
  }));
  const admin = supabaseAdmin();
  const { data, error } = await admin.from("service_areas").upsert(rows, { onConflict: "postcode_prefix" }).select("*");
  if (error) throw error;
  return ok((data ?? []).map(serializeServiceArea));
});

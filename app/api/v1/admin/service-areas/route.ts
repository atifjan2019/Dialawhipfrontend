import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, created } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeServiceArea } from "@/lib/api/resources";

const Body = z.object({
  postcode_prefix: z.string().min(1).max(8),
  delivery_fee_pence: z.number().int().min(0).max(100_000),
  priority_fee_pence: z.number().int().min(0).max(100_000).optional().nullable(),
  super_fee_pence: z.number().int().min(0).max(100_000).optional().nullable(),
  eta_standard_minutes: z.number().int().min(0).max(10_000).optional().nullable(),
  eta_priority_minutes: z.number().int().min(0).max(10_000).optional().nullable(),
  is_active: z.boolean().optional().nullable(),
});

export const GET = handle(async (req: NextRequest) => {
  await requireRole("admin", "staff");
  const sp = req.nextUrl.searchParams;
  const active = sp.get("filter[active]") || sp.get("active");
  const search = sp.get("filter[search]") || sp.get("search");
  const admin = supabaseAdmin();
  let q = admin.from("service_areas").select("*").order("postcode_prefix");
  if (active === "true" || active === "false") q = q.eq("is_active", active === "true");
  if (search) q = q.ilike("postcode_prefix", `%${search.toUpperCase().replace(/\s+/g, "")}%`);
  const { data } = await q;
  return ok((data ?? []).map(serializeServiceArea));
});

export const POST = handle(async (req: NextRequest) => {
  await requireRole("admin", "staff");
  const body = await parseJson(req, Body);
  const admin = supabaseAdmin();
  const { data, error } = await admin.from("service_areas").insert({
    postcode_prefix: body.postcode_prefix.toUpperCase().replace(/\s+/g, ""),
    delivery_fee_pence: body.delivery_fee_pence,
    priority_fee_pence: body.priority_fee_pence ?? 500,
    super_fee_pence: body.super_fee_pence ?? 1500,
    eta_standard_minutes: body.eta_standard_minutes ?? 25,
    eta_priority_minutes: body.eta_priority_minutes ?? 12,
    is_active: body.is_active ?? true,
  }).select("*").single();
  if (error) throw error;
  return created(serializeServiceArea(data));
});

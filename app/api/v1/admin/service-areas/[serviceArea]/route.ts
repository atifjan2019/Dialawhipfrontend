import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, notFound } from "@/lib/api/responses";
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

type Ctx = { params: Promise<{ serviceArea: string }> };

export const GET = handle(async (_req: NextRequest, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { serviceArea: id } = await params;
  const admin = supabaseAdmin();
  const { data } = await admin.from("service_areas").select("*").eq("id", id).single();
  if (!data) return notFound();
  return ok(serializeServiceArea(data));
});

export const PATCH = handle(async (req: NextRequest, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { serviceArea: id } = await params;
  const body = await parseJson(req, Body);
  const admin = supabaseAdmin();
  const { data, error } = await admin.from("service_areas").update({
    postcode_prefix: body.postcode_prefix.toUpperCase().replace(/\s+/g, ""),
    delivery_fee_pence: body.delivery_fee_pence,
    priority_fee_pence: body.priority_fee_pence ?? 500,
    super_fee_pence: body.super_fee_pence ?? 1500,
    eta_standard_minutes: body.eta_standard_minutes ?? 25,
    eta_priority_minutes: body.eta_priority_minutes ?? 12,
    is_active: body.is_active ?? true,
  }).eq("id", id).select("*").single();
  if (error) throw error;
  return ok(serializeServiceArea(data));
});

export const DELETE = handle(async (_req: NextRequest, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { serviceArea: id } = await params;
  const admin = supabaseAdmin();
  await admin.from("service_areas").delete().eq("id", id);
  return ok({ deleted: true });
});

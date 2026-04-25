import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, created } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeUser } from "@/lib/api/resources";

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(32).optional().nullable(),
});

export const GET = handle(async () => {
  await requireRole("admin", "staff");
  const admin = supabaseAdmin();
  const { data } = await admin.from("profiles").select("*").eq("role", "driver").order("name");
  return ok((data ?? []).map(serializeUser));
});

export const POST = handle(async (req: NextRequest) => {
  await requireRole("admin");
  const body = await parseJson(req, Body);
  const admin = supabaseAdmin();
  const tempPassword = Array.from(crypto.getRandomValues(new Uint8Array(9)))
    .map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"[b % 56])
    .join("");
  const { data, error } = await admin.auth.admin.createUser({
    email: body.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name: body.name, phone: body.phone ?? null, role: "driver" },
  });
  if (error || !data.user) {
    return created({ error: error?.message ?? "Failed to create driver" });
  }
  await admin.from("profiles").upsert({
    id: data.user.id,
    email: body.email,
    name: body.name,
    phone: body.phone ?? null,
    role: "driver",
  }, { onConflict: "id" });
  const { data: profile } = await admin.from("profiles").select("*").eq("id", data.user.id).single();
  return created({ driver: serializeUser(profile!), temp_password: tempPassword });
});

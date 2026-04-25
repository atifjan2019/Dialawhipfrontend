import type { NextRequest } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { handle, fail, created } from "@/lib/api/responses";
import { parseJson } from "@/lib/api/validation";
import { serializeUser } from "@/lib/api/resources";

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(32).optional().nullable(),
  password: z.string().min(8)
    .refine((v) => /[A-Za-z]/.test(v), "Password must contain a letter")
    .refine((v) => /[0-9]/.test(v), "Password must contain a number"),
  password_confirmation: z.string().optional(),
});

export const POST = handle(async (req: NextRequest) => {
  const body = await parseJson(req, Body);
  if (body.password_confirmation !== undefined && body.password_confirmation !== body.password) {
    return fail("Passwords do not match", 422);
  }

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signUp({
    email: body.email,
    password: body.password,
    options: { data: { name: body.name, phone: body.phone ?? null, role: "customer" } },
  });
  if (error || !data.user) return fail(error?.message ?? "Registration failed", 422);

  const admin = supabaseAdmin();
  const { data: profile } = await admin.from("profiles").select("*").eq("id", data.user.id).single();
  return created({ user: serializeUser(profile ?? undefined) });
});

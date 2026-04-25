import type { NextRequest } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { handle, fail, ok } from "@/lib/api/responses";
import { parseJson } from "@/lib/api/validation";
import { serializeUser } from "@/lib/api/resources";

const Body = z.object({ email: z.string().email(), password: z.string().min(1) });

export const POST = handle(async (req: NextRequest) => {
  const body = await parseJson(req, Body);
  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signInWithPassword({ email: body.email, password: body.password });
  if (error || !data.user) return fail("Invalid credentials", 422);
  const admin = supabaseAdmin();
  const { data: profile } = await admin.from("profiles").select("*").eq("id", data.user.id).single();
  return ok({ user: serializeUser(profile ?? undefined) });
});

import type { Role } from "../types";
import { supabaseServer } from "../supabase/server";
import { supabaseAdmin } from "../supabase/admin";
import { HttpError } from "./responses";

export interface AuthedProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  verified_at: string | null;
  created_at: string;
}

export async function currentProfile(): Promise<AuthedProfile | null> {
  const sb = await supabaseServer();
  const { data: userData } = await sb.auth.getUser();
  if (!userData?.user) return null;
  const admin = supabaseAdmin();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id,email,name,phone,role,verification_status,verified_at,created_at")
    .eq("id", userData.user.id)
    .single();
  if (error || !profile) return null;
  return profile as AuthedProfile;
}

export async function requireUser(): Promise<AuthedProfile> {
  const profile = await currentProfile();
  if (!profile) throw new HttpError(401, "Unauthenticated");
  return profile;
}

export async function requireRole(...roles: Role[]): Promise<AuthedProfile> {
  const profile = await requireUser();
  if (!roles.includes(profile.role)) throw new HttpError(403, "Forbidden");
  return profile;
}

import { supabaseAdmin } from "../supabase/admin";

export function normalisePostcode(raw: string): string {
  return (raw ?? "").toUpperCase().replace(/\s+/g, "");
}

// Find a service area whose postcode_prefix is a leading substring of `postcode`.
export async function findServiceAreaForPostcode(postcode: string) {
  const norm = normalisePostcode(postcode);
  if (!norm) return null;
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("service_areas")
    .select("*")
    .eq("is_active", true)
    .order("postcode_prefix", { ascending: false }); // longest prefix first
  if (!data) return null;
  for (const area of data) {
    if (norm.startsWith(area.postcode_prefix)) return area;
  }
  return null;
}

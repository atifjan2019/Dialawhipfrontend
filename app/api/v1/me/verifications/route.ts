import type { NextRequest } from "next/server";
import { handle, ok, created, fail, validationError } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeIdVerification } from "@/lib/api/resources";

const DOC_TYPES = ["passport", "driving_licence", "residency_card", "citizen_card", "military_id"];
const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 8 * 1024 * 1024;

// Disable Next.js fetch caching for this user-specific route — verification
// status changes the moment an admin approves/rejects, and a cached
// response would show stale "not yet verified" copy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = handle(async () => {
  const user = await requireRole("customer", "staff", "admin");
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("id_verifications")
    .select("*, reviewer:profiles!id_verifications_reviewed_by_fkey(id,name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return new Response(
    JSON.stringify({
      data: (data ?? []).map(serializeIdVerification),
      user_status: user.verification_status,
      verified_at: user.verified_at,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Tell every cache between server and browser this is per-user
        // and must never be stored.
        "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    },
  );
});

export const POST = handle(async (req: NextRequest) => {
  const user = await requireRole("customer", "staff", "admin");
  if (user.verification_status === "pending") {
    return fail("An ID upload is already pending review", 409);
  }
  const form = await req.formData();
  const docType = String(form.get("doc_type") ?? "");
  const file = form.get("file");
  if (!DOC_TYPES.includes(docType)) return validationError({ doc_type: ["Invalid document type"] });
  if (!(file instanceof File)) return validationError({ file: ["File is required"] });
  if (!ALLOWED_MIME.includes(file.type)) return validationError({ file: ["Unsupported file type"] });
  if (file.size > MAX_BYTES) return validationError({ file: ["File exceeds 8MB"] });

  const admin = supabaseAdmin();
  const ext = file.name.split(".").pop() || "bin";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const upload = await admin.storage.from("id-verifications").upload(path, buf, { contentType: file.type, upsert: false });
  if (upload.error) throw upload.error;

  const { data: verification, error } = await admin
    .from("id_verifications")
    .insert({
      user_id: user.id,
      doc_type: docType,
      file_path: upload.data.path,
      mime_type: file.type,
      size_bytes: file.size,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw error;

  await admin.from("profiles").update({ verification_status: "pending" }).eq("id", user.id);
  return created(serializeIdVerification(verification));
});

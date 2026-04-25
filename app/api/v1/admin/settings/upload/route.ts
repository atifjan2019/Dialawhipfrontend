import type { NextRequest } from "next/server";
import { handle, created, validationError } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isImageType } from "@/lib/domain/settings-registry";
import { updateOne } from "@/lib/domain/settings";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon", "image/gif"];
const MAX = 4 * 1024 * 1024;

export const POST = handle(async (req: NextRequest) => {
  await requireRole("admin", "staff");
  const form = await req.formData();
  const file = form.get("file");
  const key = form.get("key");
  if (!(file instanceof File)) return validationError({ file: ["File required"] });
  if (!ALLOWED.includes(file.type)) return validationError({ file: ["Unsupported type"] });
  if (file.size > MAX) return validationError({ file: ["File exceeds 4MB"] });
  if (typeof key === "string" && key && !isImageType(key)) {
    return validationError({ key: ["Setting is not an image type"] });
  }
  const admin = supabaseAdmin();
  const ext = file.name.split(".").pop() || "bin";
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const upload = await admin.storage.from("settings-assets").upload(path, buf, { contentType: file.type, upsert: false });
  if (upload.error) throw upload.error;
  const { data: pub } = admin.storage.from("settings-assets").getPublicUrl(upload.data.path);
  if (typeof key === "string" && key) await updateOne(key, pub.publicUrl);
  return created({ url: pub.publicUrl, path: upload.data.path, disk: "settings-assets", key: typeof key === "string" ? key : undefined });
});

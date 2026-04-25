import { handle, notFound } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ verification: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { verification: id } = await params;
  const admin = supabaseAdmin();
  const { data: row } = await admin.from("id_verifications").select("file_path,mime_type").eq("id", id).single();
  if (!row) return notFound();
  const { data, error } = await admin.storage.from("id-verifications").download(row.file_path);
  if (error || !data) return notFound("File not found");
  const buf = Buffer.from(await data.arrayBuffer());
  return new Response(buf, {
    headers: {
      "Content-Type": row.mime_type || "application/octet-stream",
      "Content-Disposition": `inline; filename="verification-${id}"`,
    },
  });
});

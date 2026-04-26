import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { handle, ok } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { allGrouped, updateMany } from "@/lib/domain/settings";

export const GET = handle(async () => {
  await requireRole("admin", "staff");
  const grouped = await allGrouped();
  return ok(grouped);
});

export const PUT = handle(async (req: NextRequest) => {
  await requireRole("admin", "staff");
  const body = await req.json().catch(() => ({}));
  const pairs = (body?.settings && typeof body.settings === "object") ? body.settings : body;
  const updated = await updateMany(pairs);
  if (updated.length > 0) revalidateTag("public-settings");
  const grouped = await allGrouped();
  return ok({ updated, ...grouped });
});

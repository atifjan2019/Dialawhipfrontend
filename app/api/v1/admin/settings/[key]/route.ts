import type { NextRequest } from "next/server";
import { handle, ok, validationError } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { updateOne } from "@/lib/domain/settings";
import { getMeta } from "@/lib/domain/settings-registry";

type Ctx = { params: Promise<{ key: string }> };

export const PATCH = handle(async (req: NextRequest, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { key } = await params;
  if (!getMeta(key)) return validationError({ key: ["Unknown setting key"] });
  const body = await req.json().catch(() => ({}));
  const value = "value" in body ? body.value : body;
  const v = await updateOne(key, value);
  return ok({ key, value: v });
});

import { handle, ok } from "@/lib/api/responses";
import { requireUser } from "@/lib/api/auth";
import { serializeUser } from "@/lib/api/resources";

export const GET = handle(async () => {
  const user = await requireUser();
  return ok(serializeUser(user as unknown as Record<string, unknown>));
});

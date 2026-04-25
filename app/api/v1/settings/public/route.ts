import { handle, ok } from "@/lib/api/responses";
import { publicSettings } from "@/lib/domain/settings";

export const GET = handle(async () => ok(await publicSettings()));

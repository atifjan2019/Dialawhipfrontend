import type { NextRequest } from "next/server";
import { handle, ok, validationError } from "@/lib/api/responses";
import { findServiceAreaForPostcode, normalisePostcode } from "@/lib/domain/service-area";

export const GET = handle(async (req: NextRequest) => {
  const postcode = req.nextUrl.searchParams.get("postcode");
  if (!postcode) return validationError({ postcode: ["The postcode field is required."] });
  const area = await findServiceAreaForPostcode(postcode);
  return ok({
    postcode: normalisePostcode(postcode),
    available: !!area,
    postcode_prefix: area?.postcode_prefix ?? null,
    delivery_fee_pence: area?.delivery_fee_pence ?? null,
    eta_standard_minutes: area?.eta_standard_minutes ?? null,
    eta_priority_minutes: area?.eta_priority_minutes ?? null,
    priority_fee_pence: area?.priority_fee_pence ?? null,
    super_fee_pence: area?.super_fee_pence ?? null,
  });
});

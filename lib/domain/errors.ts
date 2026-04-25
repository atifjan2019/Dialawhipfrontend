import { HttpError } from "../api/responses";

export class ShopClosedError extends HttpError {
  constructor(maintenanceMessage?: string) {
    super(422, "Shop is currently closed", { code: "shop_closed", maintenance_message: maintenanceMessage ?? null });
  }
}

export class BelowMinimumOrderError extends HttpError {
  constructor(public minimumPence: number) {
    super(422, "Order is below the minimum", { code: "below_minimum", minimum_pence: minimumPence });
  }
}

export class PostcodeOutOfAreaError extends HttpError {
  constructor() {
    super(422, "We do not currently deliver to that postcode", { code: "out_of_area" });
  }
}

export class InvalidStateTransitionError extends HttpError {
  constructor(from: string, to: string) {
    super(422, `Cannot transition order from ${from} to ${to}`, { code: "invalid_transition" });
  }
}

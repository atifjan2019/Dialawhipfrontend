import type { OrderStatus } from "../types";

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_prep", "cancelled"],
  in_prep: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "failed"],
  failed: ["out_for_delivery", "cancelled"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function allowed(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function allowedFrom(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from] ?? [];
}

export function isTerminal(status: OrderStatus): boolean {
  return TRANSITIONS[status]?.length === 0;
}

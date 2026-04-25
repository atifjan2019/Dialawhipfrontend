"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiRequestError, randomIdempotencyKey } from "@/lib/api-client";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const FROM_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_prep", "cancelled"],
  in_prep: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "failed"],
  failed: ["out_for_delivery", "cancelled"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

// Labels are context-aware: from `pending`, "Confirm" reads as
// "Accept order" — that's what the admin actually wants to express.
const LABELS: Record<OrderStatus, Record<string, string>> = {
  pending: {},
  confirmed: { pending: "Accept order ✓" },
  in_prep: { confirmed: "Mark in prep" },
  out_for_delivery: { in_prep: "Send out for delivery" },
  delivered: { out_for_delivery: "Mark delivered" },
  failed: { out_for_delivery: "Mark failed" },
  cancelled: { pending: "Reject order", confirmed: "Cancel", in_prep: "Cancel", failed: "Cancel" },
  refunded: { delivered: "Refund" },
};

const DEFAULT_LABEL: Record<OrderStatus, string> = {
  pending: "Mark pending",
  confirmed: "Confirm",
  in_prep: "Mark in prep",
  out_for_delivery: "Send out for delivery",
  delivered: "Mark delivered",
  failed: "Mark failed",
  cancelled: "Cancel",
  refunded: "Refund",
};

export function OrderActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const next = FROM_STATUS[status];

  async function transition(to: OrderStatus) {
    setPending(to);
    setError(null);
    try {
      await apiClient(`/api/v1/admin/orders/${orderId}/status`, {
        method: "PATCH",
        json: { to_status: to },
        idempotencyKey: randomIdempotencyKey(),
      });
      router.refresh();
    } catch (e: unknown) {
      if (e instanceof ApiRequestError) setError(e.body.message);
      else setError("Failed to transition.");
    } finally {
      setPending(null);
    }
  }

  if (next.length === 0) {
    return <p className="text-[13px] font-medium italic text-ink-muted">No further actions.</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        {next.map((to) => {
          const danger = to === "cancelled" || to === "failed";
          const subtle = to === "refunded";
          const primary = !danger && !subtle;
          const label = LABELS[to][status] ?? DEFAULT_LABEL[to];
          return (
            <button
              key={to}
              disabled={!!pending}
              onClick={() => transition(to)}
              className={cn(
                "inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-[13px] font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0",
                danger && "bg-danger text-paper",
                subtle && "border-2 border-ink bg-paper text-ink hover:bg-yellow",
                primary && "bg-ink text-yellow",
              )}
            >
              {pending === to ? "…" : label}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-3 text-[12px] font-medium text-danger">{error}</p> : null}
    </div>
  );
}

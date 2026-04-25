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

const LABELS: Record<OrderStatus, string> = {
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
    return <p className="text-[13px] italic text-ink-muted">No further actions.</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        {next.map((to) => {
          const danger = to === "cancelled" || to === "failed";
          const subtle = to === "refunded";
          return (
            <button
              key={to}
              disabled={!!pending}
              onClick={() => transition(to)}
              className={cn(
                "inline-flex h-10 w-full items-center justify-center rounded-full px-4 text-[13px] font-medium transition-colors disabled:opacity-50",
                danger
                  ? "bg-[#8B2A1D] text-cream hover:bg-[#731F13]"
                  : subtle
                  ? "border hairline bg-paper text-ink hover:border-ink/30"
                  : "bg-forest text-cream hover:bg-forest-deep",
              )}
            >
              {pending === to ? "…" : LABELS[to]}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-3 text-[12px] text-[#8B2A1D]">{error}</p> : null}
    </div>
  );
}

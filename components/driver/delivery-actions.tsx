"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiRequestError, randomIdempotencyKey } from "@/lib/api-client";
import { Textarea } from "@/components/ui/input";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const NEXT: Partial<Record<OrderStatus, OrderStatus[]>> = {
  in_prep: ["out_for_delivery"],
  out_for_delivery: ["delivered", "failed"],
  failed: ["out_for_delivery"],
};

const LABELS: Partial<Record<OrderStatus, string>> = {
  out_for_delivery: "Start run",
  delivered: "Mark delivered",
  failed: "Delivery failed",
};

export function DeliveryActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const next = NEXT[status] ?? [];

  async function transition(to: OrderStatus) {
    setPending(to);
    setError(null);
    try {
      if (note.trim()) {
        await apiClient(`/api/v1/driver/deliveries/${orderId}/note`, {
          method: "POST",
          json: { note },
          idempotencyKey: randomIdempotencyKey(),
        });
      }
      await apiClient(`/api/v1/driver/deliveries/${orderId}/status`, {
        method: "PATCH",
        json: { status: to },
        idempotencyKey: randomIdempotencyKey(),
      });
      router.refresh();
    } catch (e: unknown) {
      if (e instanceof ApiRequestError) setError(e.body.message);
      else setError("Failed.");
    } finally {
      setPending(null);
    }
  }

  if (next.length === 0) {
    return <p className="text-[13px] italic text-ink-muted">No further actions.</p>;
  }

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Optional note (e.g. 'Left with neighbour at 12b')"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {next.map((to) => {
        const danger = to === "failed";
        return (
          <button
            key={to}
            disabled={!!pending}
            onClick={() => transition(to)}
            className={cn(
              "inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-[14px] font-medium transition-colors disabled:opacity-50",
              danger
                ? "bg-[#8B2A1D] text-cream hover:bg-[#731F13]"
                : "bg-forest text-cream hover:bg-forest-deep",
            )}
          >
            {pending === to ? "…" : (LABELS[to] ?? to)}
          </button>
        );
      })}
      {error ? <p className="text-[12px] text-[#8B2A1D]">{error}</p> : null}
    </div>
  );
}

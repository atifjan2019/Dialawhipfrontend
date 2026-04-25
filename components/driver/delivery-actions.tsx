"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiRequestError, randomIdempotencyKey } from "@/lib/api-client";
import { Textarea } from "@/components/ui/input";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Order status transitions a driver is allowed to make once the order is
 * assigned to them. Mirrors DeliveryController::DRIVER_ALLOWED_STATUSES on
 * the backend.
 */
const NEXT: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ["cancelled"],
  confirmed: ["in_prep", "cancelled"],
  in_prep: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "failed"],
  failed: ["out_for_delivery", "cancelled"],
};

const LABELS: Partial<Record<OrderStatus, string>> = {
  in_prep: "Start prep",
  out_for_delivery: "Start run",
  delivered: "Mark delivered",
  failed: "Delivery failed",
  cancelled: "Cancel order",
};

const HINTS: Partial<Record<OrderStatus, string>> = {
  in_prep: "Picking & packing the order",
  out_for_delivery: "Heading to customer",
  delivered: "Customer has received it",
  failed: "Customer not home / unable to deliver",
  cancelled: "Will not be delivered",
};

const PRIMARY_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "cancelled",
  confirmed: "in_prep",
  in_prep: "out_for_delivery",
  out_for_delivery: "delivered",
  failed: "out_for_delivery",
};

// Status changes that require the rider to record a reason before submitting.
const REQUIRES_REASON: OrderStatus[] = ["cancelled", "failed"];

const REASON_PROMPTS: Partial<Record<OrderStatus, string>> = {
  cancelled: "Why is this delivery being cancelled?",
  failed: "What went wrong with the delivery?",
};

/** Common reasons a rider might pick from quickly, per status. */
const QUICK_REASONS: Partial<Record<OrderStatus, string[]>> = {
  cancelled: [
    "Customer requested cancellation",
    "Address unreachable",
    "Customer not 18+ / no ID",
    "Stock issue at depot",
    "Driver unavailable",
  ],
  failed: [
    "Customer not home",
    "No answer at address",
    "Wrong address given",
    "Customer refused delivery",
    "Damaged on arrival",
  ],
};

export function DeliveryActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  // When set, the rider has clicked a status that requires a reason —
  // we show a focused reason panel instead of submitting straight away.
  const [reasonFor, setReasonFor] = useState<OrderStatus | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  const next = NEXT[status] ?? [];

  async function submit(to: OrderStatus, noteValue: string) {
    setPending(to);
    setError(null);
    try {
      await apiClient(`/api/v1/driver/deliveries/${orderId}/status`, {
        method: "PATCH",
        json: { to_status: to, note: noteValue.trim() || null },
        idempotencyKey: randomIdempotencyKey(),
      });
      setNote("");
      setReason("");
      setReasonFor(null);
      router.refresh();
    } catch (e: unknown) {
      if (e instanceof ApiRequestError) {
        const msg = e.body.errors?.note?.[0] ?? e.body.message;
        if (reasonFor) setReasonError(msg);
        else setError(msg);
      } else {
        if (reasonFor) setReasonError("Failed.");
        else setError("Failed.");
      }
    } finally {
      setPending(null);
    }
  }

  function handleClick(to: OrderStatus) {
    if (REQUIRES_REASON.includes(to)) {
      // Open the reason panel; pre-fill with whatever's already in the note box.
      setReasonFor(to);
      setReason(note);
      setReasonError(null);
      return;
    }
    submit(to, note);
  }

  function submitReason(e: React.FormEvent) {
    e.preventDefault();
    if (!reasonFor) return;
    if (reason.trim() === "") {
      setReasonError("Please provide a reason.");
      return;
    }
    submit(reasonFor, reason);
  }

  if (next.length === 0) {
    return (
      <p className="rounded-lg border hairline bg-paper px-4 py-3 text-[13px] italic text-ink-muted">
        This delivery is finished — no further actions.
      </p>
    );
  }

  // ─── Reason capture mode ───
  if (reasonFor) {
    const danger = reasonFor === "cancelled" || reasonFor === "failed";
    const quick = QUICK_REASONS[reasonFor] ?? [];
    return (
      <form onSubmit={submitReason} className="space-y-3">
        <div className="rounded-lg border border-clay/40 bg-cream-deep/60 p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-clay">
            {reasonFor === "cancelled" ? "Cancellation reason" : "Failed-delivery reason"}
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            {REASON_PROMPTS[reasonFor]}
          </p>
        </div>

        {quick.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {quick.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setReason(q)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                  reason === q
                    ? "border-forest bg-forest text-cream"
                    : "hairline bg-paper text-ink-soft hover:border-ink/30 hover:text-ink",
                )}
              >
                {q}
              </button>
            ))}
          </div>
        ) : null}

        <Textarea
          autoFocus
          required
          minLength={3}
          placeholder="Add details — what happened, any context for the kitchen?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
        />

        {reasonError ? (
          <p className="rounded-md bg-[#F3D4CC] px-3 py-2 text-[12px] font-medium text-[#8B2A1D]">
            {reasonError}
          </p>
        ) : null}

        <div className="space-y-2">
          <button
            type="submit"
            disabled={pending === reasonFor || reason.trim() === ""}
            className={cn(
              "inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-[14px] font-medium text-cream transition-colors disabled:opacity-50",
              danger ? "bg-[#8B2A1D] hover:bg-[#731F13]" : "bg-forest hover:bg-forest-deep",
            )}
          >
            {pending === reasonFor ? "Saving…" : `Confirm ${LABELS[reasonFor]?.toLowerCase() ?? reasonFor}`}
          </button>
          <button
            type="button"
            onClick={() => { setReasonFor(null); setReasonError(null); }}
            className="inline-flex h-10 w-full items-center justify-center rounded-full border hairline bg-paper px-6 text-[12px] font-medium text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
          >
            Go back
          </button>
        </div>
      </form>
    );
  }

  // ─── Default action grid ───
  const primary = PRIMARY_NEXT[status];

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Optional note (e.g. 'Left with neighbour at 12b'). Cancellations require a reason on the next step."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {next.map((to) => {
        const isPrimary = to === primary;
        const isDanger = to === "failed" || to === "cancelled";
        return (
          <div key={to} className="space-y-1">
            <button
              disabled={!!pending}
              onClick={() => handleClick(to)}
              className={cn(
                "inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-[14px] font-medium transition-colors disabled:opacity-50",
                isDanger
                  ? "bg-[#8B2A1D] text-cream hover:bg-[#731F13]"
                  : isPrimary
                  ? "bg-forest text-cream hover:bg-forest-deep"
                  : "border hairline bg-paper text-ink-soft hover:border-ink/30 hover:text-ink",
              )}
            >
              {pending === to ? "Saving…" : LABELS[to] ?? to}
            </button>
            {HINTS[to] ? (
              <p className="px-1 text-center text-[11px] text-ink-muted">{HINTS[to]}</p>
            ) : null}
          </div>
        );
      })}

      {error ? (
        <p className="rounded-md bg-[#F3D4CC] px-3 py-2 text-[12px] font-medium text-[#8B2A1D]">{error}</p>
      ) : null}
    </div>
  );
}

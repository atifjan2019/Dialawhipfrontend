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
      <div className="rounded-2xl bg-yellow p-5 text-center ring-2 ring-ink">
        <p className="font-display text-[16px] font-bold text-ink">Run finished.</p>
        <p className="mt-1 text-[12px] font-medium text-ink/75">No further actions on this delivery.</p>
      </div>
    );
  }

  // ─── Reason capture mode ───
  if (reasonFor) {
    const danger = reasonFor === "cancelled" || reasonFor === "failed";
    const quick = QUICK_REASONS[reasonFor] ?? [];
    return (
      <form onSubmit={submitReason} className="space-y-4">
        <div className="rounded-2xl bg-yellow p-5 ring-2 ring-ink">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
            {reasonFor === "cancelled" ? "Cancellation reason" : "Failed-delivery reason"}
          </div>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-ink/85">
            {REASON_PROMPTS[reasonFor]}
          </p>
        </div>

        {quick.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {quick.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setReason(q)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all",
                  reason === q
                    ? "bg-ink text-yellow"
                    : "border-2 border-ink/15 bg-paper text-ink hover:border-ink hover:bg-yellow",
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
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-[12px] font-bold text-danger ring-1 ring-danger/30">
            {reasonError}
          </p>
        ) : null}

        <div className="space-y-2">
          <button
            type="submit"
            disabled={pending === reasonFor || reason.trim() === ""}
            className={cn(
              "inline-flex h-13 w-full items-center justify-center rounded-full px-6 text-[14px] font-bold transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50",
              danger ? "bg-danger text-paper" : "bg-ink text-yellow",
            )}
          >
            {pending === reasonFor ? "Saving…" : `Confirm ${LABELS[reasonFor]?.toLowerCase() ?? reasonFor}`}
          </button>
          <button
            type="button"
            onClick={() => { setReasonFor(null); setReasonError(null); }}
            className="inline-flex h-11 w-full items-center justify-center rounded-full border-2 border-ink bg-paper px-6 text-[12px] font-bold text-ink transition-colors hover:bg-yellow"
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
          <div key={to} className="space-y-1.5">
            <button
              disabled={!!pending}
              onClick={() => handleClick(to)}
              className={cn(
                "inline-flex h-13 w-full items-center justify-center rounded-full px-6 text-[14px] font-bold transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50",
                isDanger
                  ? "bg-danger text-paper"
                  : isPrimary
                  ? "bg-ink text-yellow"
                  : "border-2 border-ink bg-paper text-ink hover:bg-yellow",
              )}
            >
              {pending === to ? "Saving…" : LABELS[to] ?? to}
            </button>
            {HINTS[to] ? (
              <p className="px-1 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                {HINTS[to]}
              </p>
            ) : null}
          </div>
        );
      })}

      {error ? (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-[12px] font-bold text-danger ring-1 ring-danger/30">
          {error}
        </p>
      ) : null}
    </div>
  );
}

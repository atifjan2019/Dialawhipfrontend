"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "pending" | "approved" | "rejected";

/** Default expiry: today + 2 years (as YYYY-MM-DD). */
function defaultExpiry(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 2);
  return d.toISOString().slice(0, 10);
}

export function VerificationDecision({
  id,
  status,
  currentExpiry,
}: {
  id: string;
  status: Status;
  currentExpiry?: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "approving" | "rejecting">("idle");
  const [expiry, setExpiry] = useState<string>(currentExpiry ?? defaultExpiry());
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(path: string, body: Record<string, unknown>, redirectAfter = true) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/verifications/${id}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(b.message || `Request failed (${res.status})`);
        return;
      }
      if (redirectAfter) router.push("/admin/verifications");
      router.refresh();
      setMode("idle");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl bg-paper p-6 ring-2 ring-ink">
      <h3 className="font-display text-[20px] font-bold text-ink">Decision</h3>
      <p className="mt-1 text-[12px] font-medium text-ink-muted">
        {status === "pending"
          ? "Review the document and approve or reject."
          : status === "approved"
          ? "Already approved. You can update the expiry or revoke."
          : "Already rejected. You can override and approve."}
      </p>

      {/* APPROVE flow with expiry date picker */}
      {mode === "approving" ? (
        <div className="mt-5 space-y-3">
          <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
            Document expiry
          </label>
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="h-12 w-full rounded-lg border-2 border-ink bg-paper px-4 text-[14px] font-bold text-ink focus:outline-none focus:bg-yellow"
          />
          <p className="text-[11px] font-medium text-ink-muted">
            The verified ID stays valid until this date. Default: 2 years from today.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => call("approve", { expires_at: expiry }, status === "pending")}
              disabled={pending || !expiry}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-ink px-5 text-[13px] font-bold text-yellow transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
            >
              {pending ? "Approving…" : `Approve until ${new Date(expiry).toLocaleDateString("en-GB")}`}
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="inline-flex h-12 items-center rounded-full border-2 border-ink bg-paper px-5 text-[12px] font-bold text-ink hover:bg-yellow"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* REJECT / REVOKE flow */}
      {mode === "rejecting" ? (
        <div className="mt-5 space-y-3">
          <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
            {status === "approved" ? "Revocation reason (customer sees this)" : "Reason (customer sees this)"}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder={
              status === "approved"
                ? "e.g. Document reported lost / no longer valid."
                : "e.g. Photo too blurry — corners not visible."
            }
            className="w-full rounded-lg border-2 border-ink/15 bg-paper px-4 py-3 text-[13px] font-medium text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => call("reject", { reason }, status === "pending")}
              disabled={pending || reason.trim().length < 4}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-danger px-5 text-[13px] font-bold text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
            >
              {pending
                ? "Saving…"
                : status === "approved"
                ? "Revoke approval"
                : "Confirm rejection"}
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="inline-flex h-12 items-center rounded-full border-2 border-ink bg-paper px-5 text-[12px] font-bold text-ink hover:bg-yellow"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* IDLE: show buttons appropriate for current status */}
      {mode === "idle" ? (
        <div className="mt-5 flex flex-col gap-2">
          {status !== "approved" ? (
            <button
              type="button"
              onClick={() => setMode("approving")}
              disabled={pending}
              className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-5 text-[13px] font-bold text-yellow transition-transform hover:-translate-y-0.5"
            >
              {status === "rejected" ? "Override & approve ✓" : "Approve ✓"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMode("approving")}
                className="inline-flex h-12 items-center justify-center rounded-full border-2 border-ink bg-paper px-5 text-[13px] font-bold text-ink transition-colors hover:bg-yellow"
              >
                Update expiry
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Move this verification back to pending review? The customer will need to be re-approved.")) {
                    call("reopen", {}, false);
                  }
                }}
                disabled={pending}
                className="inline-flex h-12 items-center justify-center rounded-full bg-yellow px-5 text-[13px] font-bold text-ink ring-2 ring-ink transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
              >
                Change status to pending
              </button>
              <button
                type="button"
                onClick={() => setMode("rejecting")}
                className="inline-flex h-12 items-center justify-center rounded-full bg-danger px-5 text-[13px] font-bold text-paper transition-transform hover:-translate-y-0.5"
              >
                Revoke approval
              </button>
            </>
          )}
          {status === "pending" ? (
            <button
              type="button"
              onClick={() => setMode("rejecting")}
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-danger bg-paper px-5 text-[13px] font-bold text-danger transition-colors hover:bg-danger hover:text-paper"
            >
              Reject
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-lg bg-danger-soft p-3 text-[12px] font-bold text-danger ring-1 ring-danger/30">
          {error}
        </div>
      ) : null}
    </div>
  );
}

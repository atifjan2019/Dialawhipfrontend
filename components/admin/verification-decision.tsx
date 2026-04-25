"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerificationDecision({ id }: { id: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "rejecting">("idle");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(path: string, body: Record<string, unknown>) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/v1/admin/verifications/${id}/${path}`, {
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
      router.push("/admin/verifications");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border hairline bg-paper p-6">
      <h3 className="font-display text-[18px] text-ink">Decision</h3>

      {mode === "idle" ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => call("approve", {})}
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-full bg-forest px-5 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
          >
            {pending ? "Approving…" : "Approve (valid 2 years) ✓"}
          </button>
          <button
            type="button"
            onClick={() => setMode("rejecting")}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#8B2A1D]/40 bg-paper px-5 text-[13px] font-medium text-[#8B2A1D] transition-colors hover:bg-[#F3D4CC]/40"
          >
            Reject
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-[12px] font-medium text-ink">Reason (customer sees this)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="e.g. Photo too blurry — corners not visible."
            className="w-full rounded-lg border hairline bg-cream-deep/40 px-4 py-3 text-[13px] text-ink placeholder:text-ink-muted/60 focus:border-forest focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => call("reject", { reason })}
              disabled={pending || reason.trim().length < 4}
              className="inline-flex h-10 items-center rounded-full bg-[#8B2A1D] px-4 text-[12px] font-medium text-cream transition-colors hover:bg-[#6B1F15] disabled:opacity-50"
            >
              {pending ? "Rejecting…" : "Confirm rejection"}
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="inline-flex h-10 items-center rounded-full border hairline bg-paper px-4 text-[12px] font-medium text-ink-soft hover:border-ink/25"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-[#C87863]/40 bg-[#F3D4CC]/60 p-3 text-[12px] text-[#8B2A1D]">
          {error}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiRequestError, randomIdempotencyKey } from "@/lib/api-client";
import type { User } from "@/lib/types";
import { Truck } from "lucide-react";

export function AssignDriver({
  orderId,
  drivers,
  current,
}: {
  orderId: string;
  drivers: User[];
  current: User | null | undefined;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>(current?.id ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function assign() {
    if (!selectedId) return;
    setPending(true);
    setError(null);
    setOk(false);
    try {
      await apiClient(`/api/v1/admin/orders/${orderId}/assign`, {
        method: "PATCH",
        json: { driver_id: selectedId },
        idempotencyKey: randomIdempotencyKey(),
      });
      setOk(true);
      router.refresh();
    } catch (e: unknown) {
      if (e instanceof ApiRequestError) setError(e.body.message);
      else setError("Failed to assign.");
    } finally {
      setPending(false);
    }
  }

  const dirty = selectedId !== (current?.id ?? "");

  return (
    <div>
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
        <Truck className="h-3.5 w-3.5" /> Assigned driver
      </div>
      {current ? (
        <div className="mt-2 rounded-md border hairline bg-cream-deep/40 px-3 py-2 text-[13px]">
          <div className="font-display text-[15px] text-ink">{current.name}</div>
          {current.phone ? <div className="text-[12px] text-ink-muted">{current.phone}</div> : null}
        </div>
      ) : (
        <p className="mt-2 text-[12px] italic text-ink-muted">No driver assigned yet.</p>
      )}
      <div className="mt-3 flex gap-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="h-10 flex-1 rounded-md border border-ink/15 bg-paper px-3 text-[13px] text-ink focus:border-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20"
        >
          <option value="">— Pick a driver —</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}{d.phone ? ` · ${d.phone}` : ""}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!dirty || !selectedId || pending}
          onClick={assign}
          className="inline-flex h-10 items-center rounded-full bg-forest px-4 text-[12px] font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
        >
          {pending ? "…" : current ? "Reassign" : "Assign"}
        </button>
      </div>
      {error ? <p className="mt-2 text-[12px] text-[#8B2A1D]">{error}</p> : null}
      {ok ? <p className="mt-2 text-[12px] text-forest">Assigned.</p> : null}
    </div>
  );
}

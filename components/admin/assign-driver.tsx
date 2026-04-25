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
  highlight = false,
}: {
  orderId: string;
  drivers: User[];
  current: User | null | undefined;
  /** When true, draws extra attention — used after the order is confirmed
   *  but no driver is assigned yet. */
  highlight?: boolean;
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
  const noDrivers = drivers.length === 0;

  return (
    <div>
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
        <Truck className="h-3.5 w-3.5" /> Assigned driver
      </div>
      {highlight && !current ? (
        <div className="mt-3 rounded-xl bg-yellow px-3.5 py-2.5 text-[12px] font-bold text-ink ring-2 ring-ink">
          Next step: pick a driver to dispatch this order.
        </div>
      ) : null}
      {current ? (
        <div className="mt-3 rounded-xl bg-yellow px-4 py-3 ring-2 ring-ink">
          <div className="font-display text-[16px] font-bold text-ink">{current.name}</div>
          {current.phone ? <div className="mt-0.5 text-[12px] font-medium text-ink/70">{current.phone}</div> : null}
        </div>
      ) : (
        <p className="mt-3 text-[12px] font-medium italic text-ink-muted">No driver assigned yet.</p>
      )}
      <div className="mt-4 flex gap-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={noDrivers}
          className="h-11 flex-1 rounded-lg border-2 border-ink/15 bg-paper px-3 text-[13px] font-medium text-ink focus:border-ink focus-visible:outline-none disabled:opacity-50"
        >
          <option value="">{noDrivers ? "No drivers — add one in /admin/drivers" : "— Pick a driver —"}</option>
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
          className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-[12px] font-bold text-yellow transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
        >
          {pending ? "…" : current ? "Reassign" : "Assign"}
        </button>
      </div>
      {error ? <p className="mt-2 text-[12px] font-medium text-danger">{error}</p> : null}
      {ok ? <p className="mt-2 text-[12px] font-bold text-success">Assigned ✓</p> : null}
    </div>
  );
}

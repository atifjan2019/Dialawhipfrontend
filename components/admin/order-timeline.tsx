import type { OrderEvent } from "@/lib/types";
import { DateTime } from "@/components/ui/datetime";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_prep: "In prep",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function OrderTimeline({ events }: { events: OrderEvent[] }) {
  if (!events || events.length === 0) {
    return <p className="text-[13px] italic text-ink-muted">No activity yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {events.map((e) => (
        <li key={e.id} className="relative pl-6">
          <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-forest" />
          <span className="absolute left-[4.5px] top-5 bottom-[-16px] w-px bg-line last:hidden" />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="font-display text-[14px] text-ink">
              {e.from_status ? (
                <>
                  {STATUS_LABEL[e.from_status] ?? e.from_status}
                  <span className="mx-1.5 text-ink-muted">→</span>
                </>
              ) : null}
              {STATUS_LABEL[e.to_status] ?? e.to_status}
            </div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              <DateTime iso={e.created_at} />
            </div>
          </div>
          <div className="mt-1 text-[12px] text-ink-muted">
            {e.actor ? <>by <span className="text-ink">{e.actor.name}</span></> : <>system</>}
            {e.note ? <> · <span className="italic">{e.note}</span></> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

import { cn } from "@/lib/cn";
import { statusLabel } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-butter/40 text-[#6B4A0E] ring-butter/60",
  confirmed: "bg-[#DCE6DB] text-forest-deep ring-moss/40",
  in_prep: "bg-[#E6DCC6] text-ink-soft ring-stone/70",
  out_for_delivery: "bg-clay/20 text-[#8B3A22] ring-clay/40",
  delivered: "bg-forest/90 text-cream ring-forest",
  failed: "bg-[#F3D4CC] text-[#8B2A1D] ring-[#C87863]/50",
  cancelled: "bg-stone-soft text-ink-muted ring-stone",
  refunded: "bg-cream-deep text-ink-soft ring-line",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em] ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {statusLabel(status)}
    </span>
  );
}

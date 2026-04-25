import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Money({ pence, className }: { pence: number; className?: string }) {
  return <span className={cn("number", className)}>{formatMoney(pence)}</span>;
}

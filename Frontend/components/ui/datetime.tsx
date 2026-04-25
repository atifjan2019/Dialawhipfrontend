import { formatDate, formatDateOnly, formatTime } from "@/lib/format";

export function DateTime({ iso, mode = "full", className }: { iso: string; mode?: "full" | "date" | "time"; className?: string }) {
  const text = mode === "date" ? formatDateOnly(iso) : mode === "time" ? formatTime(iso) : formatDate(iso);
  return (
    <time dateTime={iso} className={className}>
      {text}
    </time>
  );
}

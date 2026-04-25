import { cn } from "@/lib/cn";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand",
        className,
      )}
    >
      <span className="h-2 w-2 rounded-full bg-yellow ring-2 ring-ink" />
      <span>{children}</span>
    </div>
  );
}

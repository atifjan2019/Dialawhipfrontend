import { cn } from "@/lib/cn";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-clay", className)}>
      <span className="h-px w-8 bg-clay/60" />
      <span>{children}</span>
    </div>
  );
}

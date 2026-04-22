import { cn } from "@/lib/cn";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md border border-ink/15 bg-paper px-3.5 py-2 text-[14px] text-ink placeholder:text-ink-muted/70 transition-colors focus:border-forest focus:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20 focus-visible:ring-offset-0 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[96px] w-full rounded-md border border-ink/15 bg-paper px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-muted/70 focus:border-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted",
        className,
      )}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-xs text-[#8B2A1D]">{children}</p>;
}

import { cn } from "@/lib/cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-forest text-cream hover:bg-forest-deep shadow-[0_1px_0_0_rgba(19,36,25,0.4)]",
  secondary:
    "bg-clay text-cream hover:bg-[#AD4C30] shadow-[0_1px_0_0_rgba(150,60,40,0.4)]",
  outline:
    "border border-ink/15 bg-paper text-ink hover:border-ink/30 hover:bg-cream-deep",
  ghost:
    "bg-transparent text-ink hover:bg-cream-deep",
  danger:
    "bg-[#8B2A1D] text-cream hover:bg-[#731F13]",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[14px]",
  lg: "h-13 px-7 text-[15px] tracking-wide",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-[1px]",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

import { cn } from "@/lib/cn";

/**
 * DIAL A WHIP wordmark with a small van + tank glyph on the left.
 * Renders crisp at any scale because it's pure SVG.
 *
 * Pass `tone="light"` when placing on a dark background (footer, hero).
 */
export function Logo({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const ink = tone === "light" ? "#ffffff" : "#000000";
  const accent = tone === "light" ? "#f5eb12" : "#004fb0";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width="34"
        height="22"
        viewBox="0 0 44 28"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* van body */}
        <rect x="2" y="8" width="28" height="13" rx="2" fill={accent} />
        {/* nose / cab */}
        <path d="M30 11 L40 14 L40 21 L30 21 Z" fill={accent} />
        <rect x="32" y="13" width="6" height="4" rx="1" fill={tone === "light" ? "#000000" : "#ffffff"} />
        {/* wheels */}
        <circle cx="11" cy="22" r="3" fill={ink} />
        <circle cx="11" cy="22" r="1" fill={tone === "light" ? "#000000" : "#ffffff"} />
        <circle cx="33" cy="22" r="3" fill={ink} />
        <circle cx="33" cy="22" r="1" fill={tone === "light" ? "#000000" : "#ffffff"} />
        {/* tank silhouette on van */}
        <rect x="6" y="11" width="2" height="6" rx="1" fill={tone === "light" ? "#000000" : "#ffffff"} opacity="0.85" />
        <rect x="10" y="10" width="2" height="7" rx="1" fill={tone === "light" ? "#000000" : "#ffffff"} opacity="0.85" />
        <rect x="14" y="11" width="2" height="6" rx="1" fill={tone === "light" ? "#000000" : "#ffffff"} opacity="0.85" />
      </svg>
      <span
        className="font-extrabold tracking-tight"
        style={{ color: ink, fontSize: "16px", letterSpacing: "-0.02em" }}
      >
        DIAL A WHIP
      </span>
    </span>
  );
}

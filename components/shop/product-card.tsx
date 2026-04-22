import Link from "next/link";
import type { Product } from "@/lib/types";
import { Money } from "@/components/ui/money";

const HUES = [
  { bg: "#E6DCC6", ink: "#3E342A" },
  { bg: "#DCE6DB", ink: "#132419" },
  { bg: "#F3D4CC", ink: "#6B2A1D" },
  { bg: "#EEDFB8", ink: "#4A3A0E" },
  { bg: "#D8CDB8", ink: "#2B2218" },
  { bg: "#E9D3C0", ink: "#5A2E1A" },
];

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const hue = HUES[index % HUES.length];
  const initial = product.name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border hairline bg-paper transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_20px_40px_-20px_rgba(27,20,14,0.15)]"
    >
      <div
        className="relative aspect-[5/4] overflow-hidden paper-grain"
        style={{ backgroundColor: hue.bg }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display text-[96px] font-light italic leading-none opacity-90 transition-transform duration-500 group-hover:scale-105"
            style={{ color: hue.ink }}
          >
            {initial}
          </span>
        </div>
        <div className="absolute bottom-3 left-4 text-[10px] font-medium uppercase tracking-[0.18em]" style={{ color: hue.ink, opacity: 0.7 }}>
          № {String(index + 1).padStart(2, "0")}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-[20px] leading-tight text-ink">{product.name}</h3>
          <Money pence={product.price_pence} className="shrink-0 text-[15px] font-medium text-forest" />
        </div>
        {product.description ? (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
            {product.description}
          </p>
        ) : null}
        <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-clay">
          <span>View</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import type { Product } from "@/lib/types";
import { Money } from "@/components/ui/money";

const HUES = [
  { bg: "#0B1D3A", ink: "#FFDA1A" }, // navy + yellow
  { bg: "#FFDA1A", ink: "#0B1D3A" }, // yellow + navy
  { bg: "#F3E9C8", ink: "#0B1D3A" }, // cream + navy
  { bg: "#061229", ink: "#FCD34D" }, // deep navy + butter
  { bg: "#FBF8EC", ink: "#0B1D3A" },
  { bg: "#253247", ink: "#FFDA1A" },
];

function specHighlight(spec: Product["short_spec"]): string | null {
  if (!spec) return null;
  if (spec.equivalent_chargers) return `≈ ${spec.equivalent_chargers} chargers`;
  if (spec.capacity_g && typeof spec.capacity_g === "number" && spec.capacity_g >= 100) return `${spec.capacity_g}g tank`;
  if (spec.pack_count) return `Pack of ${spec.pack_count}`;
  if (spec.volume_ml) return `${spec.volume_ml}ml`;
  if (spec.weight_g) return `${spec.weight_g}g`;
  if (spec.weight_kg) return `${spec.weight_kg}kg`;
  if (spec.flavour) return String(spec.flavour);
  return null;
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const hue = HUES[index % HUES.length];
  const initial = (product.brand ?? product.name).charAt(0).toUpperCase();
  const highlight = specHighlight(product.short_spec);
  const lowStock = typeof product.stock_count === "number" && product.stock_count > 0 && product.stock_count < 10;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border hairline bg-paper transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_20px_40px_-20px_rgba(10,22,40,0.18)]"
    >
      <div
        className="relative aspect-[5/4] overflow-hidden paper-grain"
        style={{ backgroundColor: hue.bg }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display text-[112px] font-light italic leading-none opacity-95 transition-transform duration-500 group-hover:scale-105"
            style={{ color: hue.ink }}
          >
            {initial}
          </span>
        </div>
        <div className="absolute top-3 left-4 flex gap-1.5">
          {product.is_age_restricted ? (
            <span className="rounded-full bg-clay/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream">18+ ID</span>
          ) : null}
          {lowStock ? (
            <span className="rounded-full bg-butter px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-forest">Only {product.stock_count} left</span>
          ) : null}
        </div>
        {highlight ? (
          <div className="absolute bottom-3 left-4 rounded-full bg-paper/90 px-3 py-1 text-[11px] font-medium tracking-wide text-forest">
            {highlight}
          </div>
        ) : null}
      </div>
      <div className="p-5">
        {product.brand ? (
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-clay">{product.brand}</div>
        ) : null}
        <div className="mt-1 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-[18px] leading-tight text-ink">{product.name}</h3>
          <Money pence={product.price_pence} className="shrink-0 text-[15px] font-medium text-forest" />
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-forest">
          <span>View</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}

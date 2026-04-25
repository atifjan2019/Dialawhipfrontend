import Link from "next/link";
import type { Product } from "@/lib/types";
import { Money } from "@/components/ui/money";

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

/**
 * Product card matching the new design language: light cream image area
 * with a diagonal stripe pattern, monospace product label, brand + name
 * + price below, plus a dark "Add +" pill in the bottom right.
 */
export function ProductCard({
  product,
}: {
  product: Product;
  /** Kept for backwards compatibility with callers that pass an index. */
  index?: number;
}) {
  const highlight = specHighlight(product.short_spec);
  const lowStock = typeof product.stock_count === "number" && product.stock_count > 0 && product.stock_count < 10;
  const productLabel = `${product.brand ?? product.name} ${highlight ?? ""}`.trim().toUpperCase();

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border hairline bg-paper transition-shadow hover:shadow-[0_24px_50px_-30px_rgba(4,18,46,0.25)]"
    >
      <div className="relative aspect-[4/3] product-stripe bg-cream">
        {/* badges */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.is_age_restricted ? (
            <span className="inline-flex h-6 items-center rounded bg-danger px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-paper">
              18+ ID
            </span>
          ) : null}
          {lowStock ? (
            <span className="inline-flex h-6 items-center rounded bg-yellow px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-navy">
              Only {product.stock_count}
            </span>
          ) : null}
        </div>

        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
            <span className="font-mono text-[12px] tracking-[0.12em] text-ink-faint">
              {productLabel || product.name.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.brand ? (
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
            {product.brand}
          </div>
        ) : null}
        <div className="mt-1 text-[15px] font-bold leading-tight text-ink">
          {product.name}
        </div>
        {highlight ? (
          <div className="mt-0.5 text-[11px] text-ink-muted">{highlight}</div>
        ) : null}

        <div className="mt-4 flex items-center justify-between">
          <Money pence={product.price_pence} className="text-[16px] font-extrabold text-ink" />
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-navy px-4 text-[12px] font-semibold text-paper transition-colors group-hover:bg-brand">
            Add <span aria-hidden>+</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { apiServer, ApiRequestError, getCurrentUser } from "@/lib/api-server";
import type { Product } from "@/lib/types";
import { Money } from "@/components/ui/money";
import { AddToCart } from "@/components/shop/add-to-cart";
import { Eyebrow } from "@/components/shop/eyebrow";

type Params = Promise<{ slug: string }>;

const HUES = [
  { bg: "#0B1D3A", ink: "#FFDA1A" },
  { bg: "#FFDA1A", ink: "#0B1D3A" },
  { bg: "#F3E9C8", ink: "#0B1D3A" },
  { bg: "#061229", ink: "#FCD34D" },
];

const SPEC_LABEL: Record<string, string> = {
  purity: "Purity",
  capacity_g: "Capacity",
  capacity_l: "Capacity",
  equivalent_chargers: "≈ chargers",
  pack_count: "Pack count",
  tanks: "Tanks included",
  casing: "Casing",
  edition: "Edition",
  gas: "Gas",
  material: "Material",
  diameter_in: "Diameter",
  size_in: "Size",
  size: "Size",
  volume_ml: "Volume",
  volume_oz: "Volume",
  weight_g: "Weight",
  weight_kg: "Weight",
  form: "Form",
  count: "Count",
  flavour: "Flavour",
  badge: "Highlight",
};

function formatSpecValue(key: string, v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (key === "capacity_g" && typeof v === "number") return `${v} g`;
  if (key === "capacity_l" && typeof v === "number") return `${v} L`;
  if (key === "diameter_in" && typeof v === "number") return `${v}"`;
  if (key === "size_in" && typeof v === "number") return `${v}"`;
  if (key === "volume_ml" && typeof v === "number") return `${v} ml`;
  if (key === "volume_oz" && typeof v === "number") return `${v} oz`;
  if (key === "weight_g" && typeof v === "number") return `${v} g`;
  if (key === "weight_kg" && typeof v === "number") return `${v} kg`;
  return String(v);
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;

  let product: Product;
  try {
    const res = await apiServer<{ data: Product }>(`/api/v1/products/${slug}`, { auth: false });
    product = res.data;
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 404) return notFound();
    throw e;
  }

  const user = await getCurrentUser().catch(() => null);
  const isVerified = user?.verification_status === "verified";

  const hue = HUES[product.name.charCodeAt(0) % HUES.length];
  const inStock = typeof product.stock_count === "number" ? product.stock_count > 0 : true;
  const lowStock = typeof product.stock_count === "number" && product.stock_count > 0 && product.stock_count < 10;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10">
      <nav className="mb-10 flex items-center gap-3 text-[12px] text-ink-muted">
        <Link href="/shop" className="transition-colors hover:text-forest">Shop</Link>
        <span className="opacity-50">/</span>
        {product.category ? (
          <>
            <Link href={`/shop/${product.category.slug}`} className="transition-colors hover:text-forest">
              {product.category.name}
            </Link>
            <span className="opacity-50">/</span>
          </>
        ) : null}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div className="relative">
          <div
            className="aspect-[4/5] overflow-hidden rounded-[22px] paper-grain"
            style={{ backgroundColor: hue.bg }}
          >
            <div className="flex h-full items-center justify-center">
              <span
                className="font-display text-[240px] font-light italic leading-none opacity-95"
                style={{ color: hue.ink }}
              >
                {(product.brand ?? product.name).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute top-5 left-5 flex gap-2">
              {product.is_age_restricted ? (
                <span className="rounded-full bg-clay/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream">
                  18+ · ID required
                </span>
              ) : null}
              {product.brand ? (
                <span className="rounded-full bg-paper/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest">
                  {product.brand}
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            <span>In stock</span>
            <span>Newcastle · 20-min</span>
            <span>Live tracking</span>
          </div>
        </div>

        <div className="flex flex-col pt-4">
          {product.category ? (
            <Eyebrow>{product.category.name}</Eyebrow>
          ) : null}
          <h1 className="mt-6 font-display text-[44px] leading-[1.02] text-ink md:text-[60px]">
            {product.name}
          </h1>

          <div className="mt-5 flex items-baseline gap-4">
            <Money pence={product.price_pence} className="font-display text-[36px] font-medium text-forest" />
            {lowStock ? (
              <span className="rounded-full bg-butter px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest">
                Only {product.stock_count} left
              </span>
            ) : null}
          </div>

          <div className="mt-8 h-px bg-line" />

          {product.description ? (
            <p className="mt-8 text-[15px] leading-[1.75] text-ink-soft whitespace-pre-line">
              {product.description}
            </p>
          ) : null}

          {product.short_spec && Object.keys(product.short_spec).length > 0 ? (
            <div className="mt-8 overflow-hidden rounded-xl border hairline bg-paper">
              <div className="bg-cream-deep/50 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
                Specs
              </div>
              <dl className="grid grid-cols-2 gap-px bg-line">
                {Object.entries(product.short_spec).map(([k, v]) => (
                  <div key={k} className="bg-paper px-5 py-4">
                    <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                      {SPEC_LABEL[k] ?? k.replace(/_/g, " ")}
                    </dt>
                    <dd className="mt-1 font-display text-[16px] text-ink">
                      {formatSpecValue(k, v)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {product.is_age_restricted ? (
            <div className="mt-8 rounded-xl border border-clay/40 bg-cream-deep/60 p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clay text-[12px] font-semibold text-cream">18+</span>
                <div>
                  <h3 className="font-display text-[16px] text-ink">ID verification required</h3>
                  {isVerified ? (
                    <p className="mt-1.5 text-[13px] text-forest">
                      ✓ Your account is verified. You can order this product.
                    </p>
                  ) : user ? (
                    <p className="mt-1.5 text-[13px] text-ink-muted">
                      Your account is not yet verified.{" "}
                      <Link href="/account/verification" className="font-medium text-forest underline underline-offset-4">
                        Upload your ID →
                      </Link>{" "}
                      (approved within minutes).
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[13px] text-ink-muted">
                      <Link href={`/login?next=/products/${product.slug}`} className="font-medium text-forest underline underline-offset-4">Sign in</Link>{" "}
                      or{" "}
                      <Link href="/register" className="font-medium text-forest underline underline-offset-4">create an account</Link>{" "}
                      — we'll check ID once, and never again.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-10">
            {inStock ? (
              <AddToCart
                item={{
                  product_id: product.id,
                  slug: product.slug,
                  name: product.name,
                  unit_price_pence: product.price_pence,
                  image_url: product.image_url,
                }}
              />
            ) : (
              <div className="rounded-xl border hairline bg-paper p-6 text-center">
                <p className="font-display text-[18px] text-ink">Out of stock</p>
                <p className="mt-1 text-[13px] text-ink-muted">We'll restock within 48 hours — try again shortly.</p>
              </div>
            )}
          </div>

          <p className="mt-6 text-[12px] text-ink-muted">
            Order before 03:00 for immediate Newcastle delivery. Free delivery NE1–NE4.
          </p>
        </div>
      </div>
    </div>
  );
}

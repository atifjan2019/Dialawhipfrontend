import { notFound } from "next/navigation";
import Link from "next/link";
import { apiServer, ApiRequestError, getCurrentUser } from "@/lib/api-server";
import type { Product } from "@/lib/types";
import { Money } from "@/components/ui/money";
import { ProductBuyBox } from "@/components/shop/product-buy-box";
import { ProductGallery } from "@/components/shop/product-gallery";
import { Eyebrow } from "@/components/shop/eyebrow";

type Params = Promise<{ slug: string }>;

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

  const inStock = typeof product.stock_count === "number" ? product.stock_count > 0 : true;
  const lowStock = typeof product.stock_count === "number" && product.stock_count > 0 && product.stock_count < 10;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10">
      <nav className="mb-8 flex items-center gap-2 text-[12px] text-ink-muted">
        <Link href="/shop" className="transition-colors hover:text-brand">Shop</Link>
        <span className="opacity-50">/</span>
        {product.category ? (
          <>
            <Link href={`/shop/${product.category.slug}`} className="transition-colors hover:text-brand">
              {product.category.name}
            </Link>
            <span className="opacity-50">/</span>
          </>
        ) : null}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div>
          <ProductGallery
            featured={product.image_url}
            gallery={product.gallery_urls ?? []}
            alt={product.name}
            fallbackLetter={(product.brand ?? product.name).charAt(0).toUpperCase()}
            fallbackBg="#f5f1e6"
            fallbackInk="#04122e"
            topLeftBadges={
              <>
                {product.is_age_restricted ? (
                  <span className="inline-flex h-6 items-center rounded bg-danger px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-paper">
                    18+ ID
                  </span>
                ) : null}
                {product.brand ? (
                  <span className="inline-flex h-6 items-center rounded bg-paper px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
                    {product.brand}
                  </span>
                ) : null}
              </>
            }
          />
          <div className="mt-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            <span>{inStock ? "In stock" : "Out of stock"}</span>
            <span>Newcastle · 20-min</span>
            <span>Live tracking</span>
          </div>
        </div>

        <div className="flex flex-col">
          {product.category ? (
            <Eyebrow>{product.category.name}</Eyebrow>
          ) : null}
          <h1 className="mt-3 text-[40px] font-extrabold leading-[1.05] tracking-tight text-ink md:text-[52px]">
            {product.name}
          </h1>

          <div className="mt-5 flex items-baseline gap-3">
            {product.variants && product.variants.length > 0 ? (
              <>
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-muted">from</span>
                <Money
                  pence={Math.min(...product.variants.filter((v) => v.is_active).map((v) => v.price_pence))}
                  className="text-[36px] font-extrabold text-ink"
                />
              </>
            ) : (
              <Money pence={product.price_pence} className="text-[36px] font-extrabold text-ink" />
            )}
            {lowStock ? (
              <span className="inline-flex h-7 items-center rounded bg-yellow px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-navy">
                Only {product.stock_count} left
              </span>
            ) : null}
          </div>

          {product.is_age_restricted ? (
            <div className="mt-7 rounded-2xl border border-danger/25 bg-danger-soft p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger text-[12px] font-bold text-paper">18+</span>
                <div>
                  <h3 className="text-[14px] font-bold text-ink">ID verification required</h3>
                  {isVerified ? (
                    <p className="mt-1 text-[13px] text-success">✓ Your account is verified. You can order this product.</p>
                  ) : user ? (
                    <p className="mt-1 text-[13px] text-ink-soft">
                      Your account is not yet verified.{" "}
                      <Link href="/account/verification" className="font-semibold text-brand underline underline-offset-2">
                        Upload your ID →
                      </Link>
                    </p>
                  ) : (
                    <p className="mt-1 text-[13px] text-ink-soft">
                      <Link href={`/login?next=/products/${product.slug}`} className="font-semibold text-brand underline underline-offset-2">
                        Sign in
                      </Link>{" "}
                      or{" "}
                      <Link href="/register" className="font-semibold text-brand underline underline-offset-2">
                        create an account
                      </Link>
                      .
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-7">
            {inStock ? (
              <ProductBuyBox
                product={product}
                base={{
                  product_id: product.id,
                  slug: product.slug,
                  name: product.name,
                  image_url: product.image_url,
                }}
              />
            ) : (
              <div className="rounded-2xl border hairline bg-paper p-6 text-center">
                <p className="text-[16px] font-bold text-ink">Out of stock</p>
                <p className="mt-1 text-[13px] text-ink-muted">We&rsquo;ll restock within 48 hours.</p>
              </div>
            )}
          </div>

          <p className="mt-5 text-[12px] text-ink-muted">
            Order before 03:00 for immediate Newcastle delivery. Free delivery NE1–NE4.
          </p>

          <div className="mt-9 h-px bg-line" />

          {product.description ? (
            <p className="mt-7 text-[15px] leading-[1.7] text-ink-soft whitespace-pre-line">
              {product.description}
            </p>
          ) : null}

          {product.short_spec && Object.keys(product.short_spec).length > 0 ? (
            <div className="mt-7 overflow-hidden rounded-2xl border hairline bg-paper">
              <div className="bg-surface px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                Specs
              </div>
              <dl className="grid grid-cols-2 gap-px bg-line">
                {Object.entries(product.short_spec).map(([k, v]) => (
                  <div key={k} className="bg-paper px-5 py-4">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
                      {SPEC_LABEL[k] ?? k.replace(/_/g, " ")}
                    </dt>
                    <dd className="mt-1 text-[15px] font-bold text-ink">{formatSpecValue(k, v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

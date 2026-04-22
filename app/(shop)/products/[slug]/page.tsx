import { notFound } from "next/navigation";
import Link from "next/link";
import { apiServer, ApiRequestError } from "@/lib/api-server";
import type { Product } from "@/lib/types";
import { Money } from "@/components/ui/money";
import { AddToCart } from "@/components/shop/add-to-cart";
import { Eyebrow } from "@/components/shop/eyebrow";

type Params = Promise<{ slug: string }>;

const HUES = [
  { bg: "#DCE6DB", ink: "#132419" },
  { bg: "#E6DCC6", ink: "#3E342A" },
  { bg: "#F3D4CC", ink: "#6B2A1D" },
  { bg: "#EEDFB8", ink: "#4A3A0E" },
];

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

  const hue = HUES[product.name.charCodeAt(0) % HUES.length];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <nav className="mb-10 flex items-center gap-3 text-[12px] text-ink-muted">
        <Link href="/menu" className="transition-colors hover:text-forest">Menu</Link>
        <span className="opacity-50">/</span>
        {product.category ? (
          <>
            <Link href={`/menu?category=${product.category.slug}`} className="transition-colors hover:text-forest">
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
                className="font-display text-[220px] font-light italic leading-none opacity-90"
                style={{ color: hue.ink }}
              >
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            <span>Hand-plated</span>
            <span>Made today</span>
            <span>Free-from options</span>
          </div>
        </div>

        <div className="flex flex-col pt-4">
          {product.category ? (
            <Eyebrow>{product.category.name}</Eyebrow>
          ) : null}
          <h1 className="mt-6 font-display text-[48px] leading-[1.02] text-ink md:text-[64px]">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-4">
            <Money pence={product.price_pence} className="font-display text-[32px] font-medium text-forest" />
            <span className="text-[12px] uppercase tracking-[0.16em] text-ink-muted">per serving</span>
          </div>

          <div className="mt-8 h-px bg-line" />

          {product.description ? (
            <p className="mt-8 text-[15px] leading-[1.75] text-ink-soft whitespace-pre-line">
              {product.description}
            </p>
          ) : null}

          {product.dietary_tags && product.dietary_tags.length > 0 ? (
            <div className="mt-8">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Dietary</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.dietary_tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-moss/40 bg-[#DCE6DB] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-forest-deep">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {product.allergens && product.allergens.length > 0 ? (
            <div className="mt-6 rounded-lg border hairline bg-paper p-5">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-clay">Allergens</div>
              <div className="mt-2 text-[14px] text-ink-soft">{product.allergens.join(" · ")}</div>
            </div>
          ) : null}

          <div className="mt-10">
            <AddToCart
              item={{
                product_id: product.id,
                slug: product.slug,
                name: product.name,
                unit_price_pence: product.price_pence,
                image_url: product.image_url,
              }}
            />
          </div>

          <p className="mt-6 text-[12px] text-ink-muted">
            24-hour lead time on all orders. Free delivery across NE1–NE8.
          </p>
        </div>
      </div>
    </div>
  );
}

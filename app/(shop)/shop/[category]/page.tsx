import { notFound } from "next/navigation";
import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/shop/product-card";
import { Eyebrow } from "@/components/shop/eyebrow";

type Params = Promise<{ category: string }>;

export default async function CategoryPage({ params }: { params: Params }) {
  const { category: slug } = await params;

  const [cats, prods] = await Promise.all([
    apiServer<{ data: Category[] }>("/api/v1/categories", { auth: false, cache: "no-store" }).catch(() => ({ data: [] })),
    apiServer<{ data: Product[] }>("/api/v1/products", {
      auth: false,
      cache: "no-store",
      query: { limit: 200, "filter.category": slug },
    }).catch(() => ({ data: [] })),
  ]);

  const category = cats.data.find((c) => c.slug === slug);
  if (!category) return notFound();

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-14">
      <nav className="flex items-center gap-3 text-[12px] text-ink-muted">
        <Link href="/shop" className="transition-colors hover:text-forest">Shop</Link>
        <span className="opacity-50">/</span>
        <span className="text-ink">{category.name}</span>
      </nav>

      <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Eyebrow>{prods.data.length} in stock</Eyebrow>
          <h1 className="mt-5 font-display text-[48px] leading-[1] text-ink md:text-[80px]">
            {category.name}<span className="text-clay">.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            All {prods.data.length} {category.name.toLowerCase()} we stock, sorted by popularity.
            20-minute delivery across Newcastle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/shop"
            className="inline-flex h-10 items-center rounded-full border hairline bg-paper px-4 text-[12px] font-medium text-ink-soft transition-colors hover:border-forest hover:text-forest"
          >
            ← All categories
          </Link>
        </div>
      </div>

      {prods.data.length === 0 ? (
        <div className="mt-16 rounded-xl border hairline bg-paper p-12 text-center">
          <p className="font-display text-[24px] text-ink">Nothing in stock right now.</p>
          <p className="mt-3 text-[14px] text-ink-muted">Check back soon — we restock weekly.</p>
        </div>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {prods.data.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/shop/product-card";
import { Eyebrow } from "@/components/shop/eyebrow";

export const metadata = { title: "Shop · Dial A Whip" };

type Search = { search?: string };

export default async function ShopPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const search = (params.search ?? "").trim();

  const [cats, prods] = await Promise.all([
    apiServer<{ data: Category[] }>("/api/v1/categories", { auth: false, cache: "no-store" }).catch(() => ({ data: [] })),
    apiServer<{ data: Product[] }>("/api/v1/products", {
      auth: false,
      cache: "no-store",
      query: { limit: 100, "filter.search": search || undefined },
    }).catch(() => ({ data: [] })),
  ]);

  const byCategory = new Map<string, Product[]>();
  for (const p of prods.data) {
    const slug = p.category?.slug ?? "other";
    if (!byCategory.has(slug)) byCategory.set(slug, []);
    byCategory.get(slug)!.push(p);
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-14">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Eyebrow>Shop everything</Eyebrow>
          <h1 className="mt-3 text-[40px] font-extrabold tracking-tight text-ink sm:text-[56px]">
            The whole shelf.
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-muted">
            {prods.data.length} products in stock across {cats.data.length} categories.
            20-minute delivery across Tyneside.
          </p>
        </div>

        <form
          action="/shop"
          method="get"
          className="flex h-12 w-full max-w-sm items-center gap-2 rounded-full border hairline bg-paper pl-5 pr-1.5 focus-within:border-brand"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-ink-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" strokeLinecap="round" />
          </svg>
          <input
            name="search"
            defaultValue={search}
            placeholder="Search brands, packs, sizes…"
            className="h-full flex-1 bg-transparent text-[14px] placeholder:text-ink-faint focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-[12px] font-semibold text-paper"
          >
            Find
          </button>
        </form>
      </div>

      <nav className="mt-10 flex flex-wrap gap-2 border-y hairline py-4">
        <Link
          href="/shop"
          className="rounded-full bg-navy px-4 py-1.5 text-[12px] font-semibold text-paper"
        >
          All
        </Link>
        {cats.data.map((c) => (
          <Link
            key={c.id}
            href={`/shop/${c.slug}`}
            className="rounded-full border hairline bg-paper px-4 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:border-brand hover:text-brand"
          >
            {c.name}
          </Link>
        ))}
      </nav>

      {prods.data.length === 0 ? (
        <div className="mt-16 rounded-2xl border hairline bg-paper p-12 text-center">
          <p className="text-[20px] font-bold text-ink">No products match "{search}".</p>
          <p className="mt-2 text-[14px] text-ink-muted">Try a broader term, or browse a category above.</p>
        </div>
      ) : (
        <div className="mt-12 space-y-16">
          {cats.data.map((c) => {
            const list = byCategory.get(c.slug);
            if (!list || list.length === 0) return null;
            return (
              <section key={c.id}>
                <div className="flex items-end justify-between">
                  <div>
                    <Eyebrow>{c.name}</Eyebrow>
                    <h2 className="mt-3 text-[28px] font-extrabold tracking-tight text-ink sm:text-[36px]">
                      {c.name}
                    </h2>
                  </div>
                  <Link
                    href={`/shop/${c.slug}`}
                    className="hidden text-[13px] font-semibold text-brand transition-colors hover:text-brand-deep md:inline"
                  >
                    See all {list.length} →
                  </Link>
                </div>
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {list.slice(0, 4).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

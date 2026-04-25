import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { Category, Paginated } from "@/lib/types";
import { ProductForm } from "@/components/admin/product-form";
import { Eyebrow } from "@/components/shop/eyebrow";

export default async function NewProductPage() {
  const cats = await apiServer<Paginated<Category>>("/api/v1/admin/categories").catch(() => ({
    data: [] as Category[],
    meta: { next_cursor: null, prev_cursor: null },
  }));

  if (cats.data.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-10 py-10">
        <Link href="/admin/products" className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-forest">
          ← Products
        </Link>
        <Eyebrow className="mt-8">Set up</Eyebrow>
        <h1 className="mt-5 font-display text-[44px] leading-[1] text-ink">Add a category first</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          Every product belongs to a category. You don&rsquo;t have any yet — create one and then come back here.
        </p>
        <Link
          href="/admin/categories"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-forest px-5 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          Manage categories →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
      <Link href="/admin/products" className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-forest">
        ← Products
      </Link>
      <Eyebrow className="mt-8">Add</Eyebrow>
      <h1 className="mt-5 font-display text-[44px] leading-[1] text-ink">New product</h1>
      <div className="mt-10 rounded-lg border hairline bg-paper p-7">
        <ProductForm categories={cats.data} />
      </div>
    </div>
  );
}

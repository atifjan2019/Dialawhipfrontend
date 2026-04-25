import { apiServer } from "@/lib/api-server";
import type { Category, Paginated } from "@/lib/types";
import { Eyebrow } from "@/components/shop/eyebrow";
import { CategoriesManager } from "@/components/admin/categories-manager";

export default async function AdminCategoriesPage() {
  const res = await apiServer<Paginated<Category>>("/api/v1/admin/categories").catch(() => ({
    data: [] as Category[],
    meta: { next_cursor: null, prev_cursor: null },
  }));

  return (
    <div className="mx-auto max-w-3xl px-10 py-10">
      <Eyebrow>Catalogue</Eyebrow>
      <h1 className="mt-5 font-display text-[44px] leading-[1] text-ink">Categories</h1>
      <p className="mt-3 text-[14px] text-ink-muted">
        Group products into categories. Each product must belong to one.
      </p>
      <CategoriesManager initial={res.data} />
    </div>
  );
}

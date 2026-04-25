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
    <>
      <section className="border-b-2 border-ink bg-yellow">
        <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
          <Eyebrow>Catalogue</Eyebrow>
          <h1 className="mt-5 font-display text-[44px] font-bold leading-[1] tracking-tight text-ink md:text-[64px]">
            <span className="text-brand">Categories.</span>
          </h1>
          <p className="mt-4 text-[14px] font-medium text-ink/80 md:text-[15px]">
            Group products into categories. Each product must belong to one.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
        <CategoriesManager initial={res.data} />
      </div>
    </>
  );
}

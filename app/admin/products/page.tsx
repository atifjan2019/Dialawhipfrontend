import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { Product, Paginated } from "@/lib/types";
import { Money } from "@/components/ui/money";
import { Eyebrow } from "@/components/shop/eyebrow";

export default async function ProductsList() {
  const res = await apiServer<Paginated<Product>>("/api/v1/admin/products", { query: { limit: 200 } })
    .catch(() => ({ data: [], meta: { next_cursor: null, prev_cursor: null } }));

  return (
    <>
      <section className="border-b-2 border-ink bg-yellow">
        <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>Catalogue</Eyebrow>
              <h1 className="mt-5 font-display text-[44px] font-bold leading-[1] tracking-tight text-ink md:text-[64px]">
                <span className="text-brand">Products.</span>
              </h1>
              <p className="mt-3 text-[14px] font-medium text-ink/75">
                {res.data.length} active {res.data.length === 1 ? "product" : "products"} in the catalogue.
              </p>
            </div>
            <Link
              href="/admin/products/new"
              className="inline-flex h-12 items-center rounded-full bg-ink px-5 text-[13px] font-bold text-yellow transition-transform hover:-translate-y-0.5"
            >
              + New product
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
        <div className="overflow-x-auto rounded-2xl bg-paper ring-2 ring-ink/10">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead className="border-b-2 border-ink/10 bg-yellow text-left text-[10px] font-bold uppercase tracking-[0.18em] text-ink">
              <tr>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {res.data.map((p, idx) => (
                <tr key={p.id} className={(idx > 0 ? "border-t-2 border-ink/10 " : "") + "transition-colors hover:bg-yellow"}>
                  <td className="px-5 py-3.5 font-display text-[15px] font-bold text-ink">
                    <Link href={`/admin/products/${p.id}`} className="hover:text-brand">{p.name}</Link>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-ink-muted">{p.category?.name ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={
                        p.is_active
                          ? "inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-yellow"
                          : "inline-flex items-center gap-1.5 rounded-full bg-stone-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted"
                      }
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      {p.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-display text-[16px] font-bold text-ink"><Money pence={p.price_pence} /></td>
                </tr>
              ))}
              {res.data.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center font-medium italic text-ink-muted">No products yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

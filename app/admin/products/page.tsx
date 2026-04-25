import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { Product, Paginated } from "@/lib/types";
import { Money } from "@/components/ui/money";
import { Eyebrow } from "@/components/shop/eyebrow";

export default async function ProductsList() {
  const res = await apiServer<Paginated<Product>>("/api/v1/admin/products", { query: { limit: 200 } })
    .catch(() => ({ data: [], meta: { next_cursor: null, prev_cursor: null } }));

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Catalogue</Eyebrow>
          <h1 className="mt-5 font-display text-[44px] leading-[1] text-ink">Products</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center rounded-full bg-forest px-5 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          + New product
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border hairline bg-paper">
        <table className="w-full text-[13px]">
          <thead className="border-b hairline bg-cream-deep/50 text-left text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {res.data.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-cream-deep/40">
                <td className="px-5 py-3.5 font-display text-[15px] text-ink">
                  <Link href={`/admin/products/${p.id}`} className="hover:text-forest">{p.name}</Link>
                </td>
                <td className="px-5 py-3.5 text-ink-muted">{p.category?.name ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={
                      p.is_active
                        ? "inline-flex items-center gap-1.5 rounded-full bg-[#DCE6DB] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-forest-deep ring-1 ring-inset ring-moss/40"
                        : "inline-flex items-center gap-1.5 rounded-full bg-cream-deep px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted ring-1 ring-inset ring-line"
                    }
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    {p.is_active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-display text-[15px] text-forest"><Money pence={p.price_pence} /></td>
              </tr>
            ))}
            {res.data.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center italic text-ink-muted">No products.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { User, Paginated } from "@/lib/types";
import { Eyebrow } from "@/components/shop/eyebrow";

type SP = Promise<{ cursor?: string; search?: string }>;

export default async function CustomersList({ searchParams }: { searchParams: SP }) {
  const { cursor, search } = await searchParams;
  const res = await apiServer<Paginated<User & { orders_count?: number; lifetime_pence?: number }>>("/api/v1/admin/customers", {
    query: { cursor, search, limit: 50 },
  }).catch(() => ({ data: [], meta: { next_cursor: null, prev_cursor: null } }));

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      <Eyebrow>People</Eyebrow>
      <h1 className="mt-5 font-display text-[44px] leading-[1] text-ink">Customers</h1>

      <form className="mt-8" action="/admin/customers">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or email"
          className="h-11 w-80 rounded-md border border-ink/15 bg-paper px-3.5 text-[13px] text-ink placeholder:text-ink-muted/70 focus:border-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20"
        />
      </form>

      <div className="mt-6 overflow-hidden rounded-lg border hairline bg-paper">
        <table className="w-full text-[13px]">
          <thead className="border-b hairline bg-cream-deep/50 text-left text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {res.data.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-cream-deep/40">
                <td className="px-5 py-3.5 font-display text-[15px] text-ink">
                  <Link href={`/admin/customers/${c.id}`} className="hover:text-forest">{c.name}</Link>
                </td>
                <td className="px-5 py-3.5 text-ink-muted">{c.email}</td>
                <td className="px-5 py-3.5 text-ink-muted">{c.phone ?? "—"}</td>
              </tr>
            ))}
            {res.data.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-10 text-center italic text-ink-muted">No customers found.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { IdVerification } from "@/lib/types";
import { Eyebrow } from "@/components/shop/eyebrow";

type Search = { status?: string; search?: string };

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const status = params.status ?? "pending";
  const search = params.search ?? "";

  const res = await apiServer<{ data: IdVerification[] }>("/api/v1/admin/verifications", {
    query: {
      "filter.status": status,
      "filter.search": search || undefined,
      limit: 50,
    },
  }).catch(() => ({ data: [] }));

  return (
    <>
      <section className="border-b-2 border-ink bg-yellow">
        <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Compliance · 18+</Eyebrow>
              <h1 className="mt-5 font-display text-[36px] font-bold leading-[1] tracking-tight text-ink md:text-[56px]">
                ID <span className="text-brand">verifications.</span>
              </h1>
              <p className="mt-3 max-w-lg text-[14px] font-medium text-ink/80">
                Review submitted documents and approve or reject access to age-restricted products.
              </p>
            </div>

            <form action="/admin/verifications" method="get" className="flex h-12 w-full max-w-sm items-center gap-2 rounded-full border-2 border-ink bg-paper pl-5 pr-1.5">
              <input type="hidden" name="status" value={status} />
              <input
                name="search"
                defaultValue={search}
                placeholder="Name or email…"
                className="h-full flex-1 bg-transparent text-[13px] font-medium text-ink placeholder:text-ink/40 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-[12px] font-bold text-yellow"
              >
                Find
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
        <nav className="flex gap-2 border-b-2 border-ink/10 pb-1">
          {(["pending", "approved", "rejected"] as const).map((s) => (
            <Link
              key={s}
              href={`/admin/verifications?status=${s}`}
              className={
                s === status
                  ? "rounded-t-lg bg-ink px-5 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-yellow"
                  : "rounded-t-lg px-5 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-muted transition-colors hover:bg-yellow hover:text-ink"
              }
            >
              {s[0].toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </nav>

        {res.data.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-yellow p-14 text-center ring-2 ring-ink">
            <p className="font-display text-[28px] font-bold text-ink">No {status} verifications.</p>
            <p className="mt-2 text-[14px] font-medium text-ink/75">All caught up.</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="mt-6 space-y-3 md:hidden">
              {res.data.map((v) => (
                <Link
                  key={v.id}
                  href={`/admin/verifications/${v.id}`}
                  className="block rounded-2xl bg-paper p-5 ring-2 ring-ink/10 transition-all hover:ring-brand"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-[16px] font-bold text-ink">{v.user?.name}</div>
                      <div className="truncate text-[12px] font-medium text-ink-muted">{v.user?.email}</div>
                    </div>
                    <span className="inline-flex h-9 shrink-0 items-center rounded-full bg-ink px-4 text-[11px] font-bold text-yellow">
                      Review →
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                    <span className="capitalize">{v.doc_type.replace(/_/g, " ")}</span>
                    <span>·</span>
                    <span className="text-ink-muted">{new Date(v.created_at).toLocaleString("en-GB")}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="mt-6 hidden overflow-x-auto rounded-2xl bg-paper ring-2 ring-ink/10 md:block">
              <table className="w-full text-[13px]">
                <thead className="bg-yellow text-[10px] font-bold uppercase tracking-[0.18em] text-ink">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Customer</th>
                    <th className="px-5 py-3.5 text-left">Document</th>
                    <th className="px-5 py-3.5 text-left">Submitted</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {res.data.map((v, idx) => (
                    <tr key={v.id} className={(idx > 0 ? "border-t-2 border-ink/10 " : "") + "transition-colors hover:bg-yellow"}>
                      <td className="px-5 py-4">
                        <div className="font-display text-[15px] font-bold text-ink">{v.user?.name}</div>
                        <div className="text-[12px] font-medium text-ink-muted">{v.user?.email}</div>
                      </td>
                      <td className="px-5 py-4 font-medium capitalize text-ink-soft">
                        {v.doc_type.replace(/_/g, " ")}
                      </td>
                      <td className="px-5 py-4 text-[12px] font-medium text-ink-muted">
                        {new Date(v.created_at).toLocaleString("en-GB")}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/verifications/${v.id}`}
                          className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-[12px] font-bold text-yellow transition-transform hover:-translate-y-0.5"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

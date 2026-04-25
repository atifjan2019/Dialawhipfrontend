import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { IdVerification } from "@/lib/types";

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
    <div className="px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Compliance
          </div>
          <h1 className="mt-2 font-display text-[28px] leading-tight text-ink sm:text-[36px]">
            ID verifications
          </h1>
          <p className="mt-2 text-[13px] text-ink-muted sm:text-[14px]">
            Review submitted documents and approve or reject access to age-restricted products.
          </p>
        </div>

        <form action="/admin/verifications" method="get" className="flex h-10 w-full items-center gap-2 rounded-full border hairline bg-paper pl-4 pr-1 focus-within:border-forest md:w-auto">
          <input type="hidden" name="status" value={status} />
          <input
            name="search"
            defaultValue={search}
            placeholder="Name or email…"
            className="h-full w-full bg-transparent text-[14px] placeholder:text-ink-muted/60 focus:outline-none md:w-56 md:text-[13px]"
          />
          <button type="submit" className="inline-flex h-8 shrink-0 items-center rounded-full bg-forest px-3 text-[11px] font-medium text-cream">
            Find
          </button>
        </form>
      </div>

      <nav className="mt-6 flex gap-2 border-b hairline">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/verifications?status=${s}`}
            className={
              s === status
                ? "border-b-2 border-forest px-4 py-3 text-[13px] font-medium text-forest"
                : "px-4 py-3 text-[13px] text-ink-muted transition-colors hover:text-forest"
            }
          >
            {s[0].toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </nav>

      {res.data.length === 0 ? (
        <div className="mt-14 rounded-xl border hairline bg-paper p-14 text-center">
          <p className="font-display text-[22px] text-ink">No {status} verifications.</p>
          <p className="mt-2 text-[13px] text-ink-muted">All caught up.</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards. Desktop: table */}
          <div className="mt-6 space-y-3 md:hidden">
            {res.data.map((v) => (
              <Link
                key={v.id}
                href={`/admin/verifications/${v.id}`}
                className="block rounded-xl border hairline bg-paper p-4 transition-colors hover:border-forest"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-ink">{v.user?.name}</div>
                    <div className="truncate text-[12px] text-ink-muted">{v.user?.email}</div>
                  </div>
                  <span className="inline-flex h-8 shrink-0 items-center rounded-full bg-forest px-3 text-[11px] font-medium text-cream">
                    Review →
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-muted">
                  <span className="capitalize">{v.doc_type.replace(/_/g, " ")}</span>
                  <span>·</span>
                  <span>{new Date(v.created_at).toLocaleString("en-GB")}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 hidden overflow-x-auto rounded-xl border hairline bg-paper md:block">
            <table className="w-full text-[13px]">
              <thead className="bg-cream-deep text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                <tr>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Document</th>
                  <th className="px-5 py-3 text-left">Submitted</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {res.data.map((v) => (
                  <tr key={v.id} className="border-t hairline hover:bg-cream-deep/30">
                    <td className="px-5 py-4">
                      <div className="font-medium text-ink">{v.user?.name}</div>
                      <div className="text-[12px] text-ink-muted">{v.user?.email}</div>
                    </td>
                    <td className="px-5 py-4 capitalize text-ink-soft">
                      {v.doc_type.replace(/_/g, " ")}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {new Date(v.created_at).toLocaleString("en-GB")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/verifications/${v.id}`}
                        className="inline-flex h-8 items-center rounded-full bg-forest px-4 text-[12px] font-medium text-cream transition-colors hover:bg-forest-deep"
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
  );
}

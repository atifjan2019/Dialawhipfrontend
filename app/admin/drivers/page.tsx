import { apiServer } from "@/lib/api-server";
import type { User } from "@/lib/types";
import { AddDriverForm } from "@/components/admin/add-driver-form";
import { Eyebrow } from "@/components/shop/eyebrow";

export default async function DriversPage() {
  const res = await apiServer<{ data: User[] }>("/api/v1/admin/drivers").catch(() => ({ data: [] }));

  return (
    <>
      <section className="border-b-2 border-ink bg-yellow">
        <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
          <Eyebrow>Fleet</Eyebrow>
          <h1 className="mt-5 font-display text-[44px] font-bold leading-[1] tracking-tight text-ink md:text-[64px]">
            <span className="text-brand">Drivers.</span>
          </h1>
          <p className="mt-3 text-[14px] font-medium text-ink/75">
            {res.data.length} {res.data.length === 1 ? "driver" : "drivers"} on the road.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="overflow-x-auto rounded-2xl bg-paper ring-2 ring-ink/10">
            <table className="w-full min-w-[560px] text-[13px]">
              <thead className="border-b-2 border-ink/10 bg-yellow text-left text-[10px] font-bold uppercase tracking-[0.18em] text-ink">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Phone</th>
                </tr>
              </thead>
              <tbody>
                {res.data.map((d, idx) => (
                  <tr key={d.id} className={(idx > 0 ? "border-t-2 border-ink/10 " : "") + "transition-colors hover:bg-yellow"}>
                    <td className="px-5 py-3.5 font-display text-[15px] font-bold text-ink">{d.name}</td>
                    <td className="px-5 py-3.5 font-medium text-ink-muted">{d.email}</td>
                    <td className="px-5 py-3.5 font-medium text-ink-muted">{d.phone ?? "—"}</td>
                  </tr>
                ))}
                {res.data.length === 0 ? (
                  <tr><td colSpan={3} className="px-5 py-12 text-center font-medium italic text-ink-muted">No drivers yet.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="h-fit rounded-2xl bg-paper p-6 ring-2 ring-ink">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Add driver</div>
            <h2 className="mt-1.5 font-display text-[24px] font-bold text-ink">Invite a new driver</h2>
            <div className="mt-5">
              <AddDriverForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

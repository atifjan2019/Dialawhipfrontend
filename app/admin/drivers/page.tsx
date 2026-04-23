import { apiServer } from "@/lib/api-server";
import type { User } from "@/lib/types";
import { AddDriverForm } from "@/components/admin/add-driver-form";
import { Eyebrow } from "@/components/shop/eyebrow";

export default async function DriversPage() {
  const res = await apiServer<{ data: User[] }>("/api/v1/admin/drivers").catch(() => ({ data: [] }));

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      <Eyebrow>Fleet</Eyebrow>
      <h1 className="mt-5 font-display text-[44px] leading-[1] text-ink">Drivers</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-lg border hairline bg-paper">
          <table className="w-full text-[13px]">
            <thead className="border-b hairline bg-cream-deep/50 text-left text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {res.data.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-cream-deep/40">
                  <td className="px-5 py-3.5 font-display text-[15px] text-ink">{d.name}</td>
                  <td className="px-5 py-3.5 text-ink-muted">{d.email}</td>
                  <td className="px-5 py-3.5 text-ink-muted">{d.phone ?? "—"}</td>
                </tr>
              ))}
              {res.data.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-10 text-center italic text-ink-muted">No drivers yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="h-fit rounded-lg border hairline bg-paper p-6">
          <div className="font-display text-[13px] italic text-clay">Add driver</div>
          <h2 className="mt-1 font-display text-[22px] text-ink">Invite a new driver</h2>
          <div className="mt-5">
            <AddDriverForm />
          </div>
        </div>
      </div>
    </div>
  );
}

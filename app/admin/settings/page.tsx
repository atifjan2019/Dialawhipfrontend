import { apiServer } from "@/lib/api-server";
import type { SettingsPayload, ServiceArea } from "@/lib/types";
import { Eyebrow } from "@/components/shop/eyebrow";
import { SettingsForm } from "@/components/admin/settings-form";
import { ServiceAreasManager } from "@/components/admin/service-areas-manager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settingsRes = await apiServer<{ data: SettingsPayload }>("/api/v1/admin/settings")
    .catch(() => ({ data: { groups: {}, flat: {} } as SettingsPayload }));

  const areasRes = await apiServer<{ data: ServiceArea[] }>("/api/v1/admin/service-areas")
    .catch(() => ({ data: [] as ServiceArea[] }));

  return (
    <>
      <section className="border-b-2 border-ink bg-yellow">
        <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
          <Eyebrow>Configuration</Eyebrow>
          <h1 className="mt-5 font-display text-[44px] font-bold leading-[1] tracking-tight text-ink md:text-[64px]">
            <span className="text-brand">Settings.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] font-medium text-ink/75 md:text-[15px]">
            Manage branding, contact details, social links, SEO, legal pages, delivery charges and every other website setting from one place.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
        <SettingsForm initial={settingsRes.data} />

        <div className="mt-16">
          <ServiceAreasManager initial={areasRes.data} />
        </div>
      </div>
    </>
  );
}

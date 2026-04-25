import { ShopHeader } from "@/components/shop/header";
import { ShopFooter } from "@/components/shop/footer";
import { ShopClosedBanner } from "@/components/shop/shop-closed-banner";
import { getCurrentUser } from "@/lib/api-server";
import { getPublicSettings } from "@/lib/settings";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([
    getCurrentUser().catch(() => null),
    getPublicSettings(),
  ]);
  return (
    <>
      <ShopHeader user={user} settings={settings} />
      {/* Visible on every customer-facing page when admin has set order.is_open = false. */}
      <div className="mx-auto w-full max-w-[1280px] px-6">
        <ShopClosedBanner settings={settings} className="mt-4" />
      </div>
      <main className="flex-1">{children}</main>
      <ShopFooter settings={settings} />
    </>
  );
}

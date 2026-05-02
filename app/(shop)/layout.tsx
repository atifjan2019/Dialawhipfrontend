import { ShopHeader } from "@/components/shop/header";
import { ShopFooter } from "@/components/shop/footer";
import { ShopClosedBanner } from "@/components/shop/shop-closed-banner";
import { SpinToWinPopup } from "@/components/shop/spin-to-win-popup";
import { getCurrentUser } from "@/lib/api-server";
import { getPublicSettings, settingBool, settingString } from "@/lib/settings";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([
    getCurrentUser().catch(() => null),
    getPublicSettings(),
  ]);

  if (settingBool(settings, "maintenance.enabled", false)) {
    const brandName = settingString(settings, "business.name", "Dialawhip");
    const message =
      settingString(settings, "maintenance.message") ||
      "We're making a few quick changes. Please check back shortly.";
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-20 text-center">
        <span className="font-display text-[36px] text-forest md:text-[48px]">{brandName}</span>
        <h1 className="mt-6 max-w-xl font-display text-[44px] leading-[1.05] text-ink md:text-[64px]">
          We&rsquo;ll be back shortly.
        </h1>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">{message}</p>
      </main>
    );
  }

  return (
    <>
      <ShopHeader user={user} settings={settings} />
      {/* Visible on every customer-facing page when admin has set order.is_open = false. */}
      <div className="mx-auto w-full max-w-[1280px] px-6">
        <ShopClosedBanner settings={settings} className="mt-4" />
      </div>
      <SpinToWinPopup />
      <main className="flex-1">{children}</main>
      <ShopFooter settings={settings} />
    </>
  );
}

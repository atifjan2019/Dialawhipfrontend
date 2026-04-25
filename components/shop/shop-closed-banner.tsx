import type { PublicSettings } from "@/lib/settings";
import { settingBool, settingString } from "@/lib/settings";

/**
 * Shows a notice when the admin has flipped `order.is_open` off.
 *
 * Returns null when the shop is open, so callers can drop it in
 * unconditionally without extra guards.
 */
export function ShopClosedBanner({
  settings,
  className = "",
}: {
  settings: PublicSettings;
  className?: string;
}) {
  const isOpen = settingBool(settings, "order.is_open", true);
  if (isOpen) return null;

  const message =
    settingString(settings, "maintenance.message") ||
    "We are not accepting orders right now. Please check back shortly.";

  return (
    <div
      className={
        "rounded-xl border-2 border-clay/40 bg-butter/40 p-4 text-[13px] leading-relaxed text-ink " +
        className
      }
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clay text-[12px] font-bold text-cream">
          !
        </span>
        <div>
          <strong className="block font-display text-[15px] text-ink">
            Shop is currently closed
          </strong>
          <span className="mt-1 block text-ink-soft">{message}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper to check whether the shop is open. Used by the cart and checkout
 * pages to disable the pay/continue buttons.
 */
export function isShopOpen(settings: PublicSettings | undefined | null): boolean {
  if (!settings) return true;
  return settingBool(settings, "order.is_open", true);
}

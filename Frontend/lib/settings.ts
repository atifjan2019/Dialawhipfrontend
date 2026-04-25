/**
 * Server-side helper that fetches the public settings the admin manages
 * (logo, favicon, social links, contact details, SEO, legal URLs, etc.).
 *
 * The types and pure helpers live in `lib/settings-core` so client
 * components can import them without dragging in `apiServer`. This file
 * re-exports everything from settings-core and adds the server fetcher.
 *
 * The Laravel backend caches the public settings for 60s, so admin
 * changes flow through within a minute.
 */

import { apiServer } from "@/lib/api-server";
import { DEFAULTS, type PublicSettings } from "@/lib/settings-core";

// Re-export all types + pure helpers so callers can keep importing from
// `@/lib/settings` without changing anything.
export {
  DEFAULTS,
  settingString,
  settingNumber,
  settingBool,
  formatBusinessHours,
  humaniseDayKey,
  socialLinks,
} from "@/lib/settings-core";
export type { PublicSettings } from "@/lib/settings-core";

/**
 * Fetch the public settings. Server-only — uses Next.js fetch tag so
 * settings can be invalidated when the admin saves a change.
 */
export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const res = await apiServer<{ data: PublicSettings }>(
      "/api/v1/settings/public",
      {
        auth: false,
        // Re-fetch every 60s so admin changes flow through quickly.
        cache: "force-cache",
        next: { revalidate: 60, tags: ["public-settings"] },
      },
    );
    return { ...DEFAULTS, ...(res.data ?? {}) };
  } catch {
    return DEFAULTS;
  }
}

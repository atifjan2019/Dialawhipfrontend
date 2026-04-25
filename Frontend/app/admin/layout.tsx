import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api-server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { getPublicSettings, settingString } from "@/lib/settings";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin" && user.role !== "staff") redirect("/forbidden");

  const settings = await getPublicSettings();
  const brandName = settingString(settings, "business.name", "Dialawhip");
  // Prefer the dark-mode logo for the dark-forest sidebar; fall back to the regular logo.
  const logoUrl =
    settingString(settings, "branding.logo_dark_url", "") ||
    settingString(settings, "branding.logo_url", "");

  return (
    <div className="flex min-h-screen flex-col bg-cream md:flex-row">
      <AdminSidebar name={user.name} brandName={brandName} logoUrl={logoUrl} />
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}

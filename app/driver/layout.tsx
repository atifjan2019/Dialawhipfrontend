import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api-server";
import { DriverLogoutButton } from "@/components/driver/logout-button";

export const metadata = {
  title: "Driver",
  description: "Delivery runs dashboard",
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#1E3A2B",
};

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/driver");
  if (user.role !== "driver" && user.role !== "admin") redirect("/forbidden");

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-30 border-b hairline bg-forest text-cream">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/driver" className="flex items-baseline gap-1.5">
            <span className="font-display text-[20px] tracking-tight">Dialawhip</span>
            <span className="font-display text-[13px] italic text-butter">on the road</span>
          </Link>
          <div className="flex items-center gap-4 text-[13px]">
            <span className="text-cream/80">{user.name.split(" ")[0]}</span>
            <DriverLogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

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
  themeColor: "#000000",
};

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/driver");
  if (user.role !== "driver" && user.role !== "admin") redirect("/forbidden");

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-30 border-b-2 border-ink bg-ink text-paper">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link href="/driver" className="flex items-baseline gap-2">
            <span className="font-display text-[22px] font-bold leading-none">
              Dialawhip<span className="text-yellow">.</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-yellow">
              On the road
            </span>
          </Link>
          <div className="flex items-center gap-3 text-[13px]">
            <span className="hidden font-bold text-paper/85 sm:inline">{user.name.split(" ")[0]}</span>
            <DriverLogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  FolderTree,
  Truck,
  BarChart3,
  LogOut,
  ShieldCheck,
  Settings as SettingsIcon,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/verifications", label: "ID verifications", icon: ShieldCheck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/drivers", label: "Drivers", icon: Truck },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export function AdminSidebar({
  name,
  brandName = "Dialawhip",
  logoUrl = "",
}: {
  name: string;
  brandName?: string;
  logoUrl?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const active = NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))?.label ?? "Admin";

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-ink bg-yellow px-4 py-3 text-ink md:hidden">
        <Link href="/admin" className="flex items-baseline gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={brandName} className="h-7 w-auto" />
          ) : (
            <span className="font-display text-[20px] font-bold leading-none text-ink">
              {brandName}<span className="text-brand">.</span>
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">{active}</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-paper text-ink"
          aria-label="Open admin menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </header>

      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r-2 border-ink bg-ink text-paper md:sticky md:top-0 md:flex">
        <SidebarContents name={name} brandName={brandName} logoUrl={logoUrl} pathname={pathname} onLogout={logout} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col border-r-2 border-ink bg-ink text-paper shadow-[20px_0_60px_-20px_rgba(0,0,0,0.45)]">
            <div className="flex justify-end border-b-2 border-paper/10 px-3 py-3">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-paper/20 text-paper"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContents name={name} brandName={brandName} logoUrl={logoUrl} pathname={pathname} onLogout={logout} />
          </aside>
        </div>
      ) : null}
    </>
  );
}

function SidebarContents({
  name,
  brandName,
  logoUrl,
  pathname,
  onLogout,
}: {
  name: string;
  brandName: string;
  logoUrl: string;
  pathname: string;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="border-b-2 border-paper/10 px-6 py-7">
        <Link href="/admin" className="block">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={brandName} className="h-10 w-auto" />
          ) : (
            <span className="font-display text-[24px] font-bold leading-none text-paper">
              {brandName}<span className="text-yellow">.</span>
            </span>
          )}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((n) => {
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13px] font-bold transition-colors",
                active
                  ? "bg-yellow text-ink"
                  : "text-paper/70 hover:bg-paper/10 hover:text-paper",
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t-2 border-paper/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12px] font-bold text-paper/60 transition-colors hover:bg-paper/10 hover:text-yellow"
        >
          ← Back to site
        </Link>
        <button
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3.5 py-2 text-[12px] font-bold text-paper/60 transition-colors hover:bg-paper/10 hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );
}

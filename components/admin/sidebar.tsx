"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { LayoutDashboard, ClipboardList, Users, Package, Truck, BarChart3, LogOut, ShieldCheck, Settings as SettingsIcon, Menu, X } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/verifications", label: "ID verifications", icon: ShieldCheck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
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
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-cream/10 bg-forest px-4 py-3 text-cream md:hidden">
        <Link href="/admin" className="flex items-baseline gap-1.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={brandName} className="h-7 w-auto" />
          ) : (
            <span className="font-display text-[20px] leading-none text-cream">{brandName}</span>
          )}
          <span className="font-display text-[12px] italic text-butter">{active}</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 bg-forest-deep/40 text-cream"
          aria-label="Open admin menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </header>

      <aside className="hidden h-screen w-64 shrink-0 flex-col bg-forest text-cream md:sticky md:top-0 md:flex">
        <SidebarContents name={name} brandName={brandName} logoUrl={logoUrl} pathname={pathname} onLogout={logout} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-forest text-cream shadow-[20px_0_60px_-20px_rgba(10,22,40,0.45)]">
            <div className="flex justify-end px-3 py-3">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cream/15 bg-forest-deep/40 text-cream"
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
      <div className="px-6 py-7 md:pt-7 pt-0">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={brandName} className="h-10 w-auto" />
        ) : (
          <div className="font-display leading-tight">
            <span className="block text-[24px] text-cream">{brandName}</span>
          </div>
        )}
        <div className="mt-5 text-[10px] font-medium uppercase tracking-[0.22em] text-butter/80">Admin</div>
        <div className="mt-1 font-display text-[15px] text-cream">{name}</div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV.map((n) => {
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3.5 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-cream text-forest-deep"
                  : "text-cream/70 hover:bg-cream/10 hover:text-cream",
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 border-t border-cream/10 pt-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-3.5 py-2 text-[12px] font-medium text-cream/60 transition-colors hover:text-cream"
        >
          ← Back to site
        </Link>
        <button
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-[12px] font-medium text-cream/60 transition-colors hover:text-clay"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );
}

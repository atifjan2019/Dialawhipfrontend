"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { LayoutDashboard, ClipboardList, Users, Package, Truck, BarChart3, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/drivers", label: "Drivers", icon: Truck },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-forest text-cream">
      <div className="px-6 py-7">
        <div className="font-display leading-tight">
          <span className="block text-[24px] text-cream">Dialawhip</span>
          <span className="block text-[13px] italic font-light text-butter">Newcastle catering</span>
        </div>
        <div className="mt-5 text-[10px] font-medium uppercase tracking-[0.22em] text-butter/80">Admin</div>
        <div className="mt-1 font-display text-[15px] text-cream">{name}</div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
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
          onClick={logout}
          className="mt-1 flex w-full items-center gap-2 rounded-md px-3.5 py-2 text-[12px] font-medium text-cream/60 transition-colors hover:text-clay"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

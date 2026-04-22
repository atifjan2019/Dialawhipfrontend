"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import type { User } from "@/lib/types";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function ShopHeader({ user }: { user: User | null }) {
  const count = useCart((s) => s.count());
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-[24px] font-medium leading-none tracking-tight text-forest">
            Dialawhip
          </span>
          <span className="hidden font-display text-[14px] italic font-light leading-none text-clay sm:inline">
            Newcastle catering
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] font-medium text-ink-soft md:flex">
          <Link href="/menu" className="transition-colors hover:text-forest">Menu</Link>
          <Link href="/service-area" className="transition-colors hover:text-forest">Delivery</Link>
          <Link href="/contact" className="transition-colors hover:text-forest">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="group relative inline-flex h-10 items-center gap-2 rounded-full border hairline bg-paper px-4 text-[13px] font-medium text-ink-soft transition-all hover:border-forest hover:text-forest"
            aria-label="Cart"
          >
            <BagIcon />
            <span className="hidden sm:inline">Bag</span>
            {count > 0 ? (
              <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1.5 text-[11px] font-semibold text-cream tabular-nums">
                {count}
              </span>
            ) : null}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-full border hairline bg-paper px-4 text-[13px] font-medium text-ink-soft transition-colors hover:border-forest hover:text-forest"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-forest text-[11px] font-semibold text-cream">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
              </button>
              {open ? (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border hairline bg-paper shadow-lg shadow-ink/5">
                  <MenuLink href="/account">Account</MenuLink>
                  <MenuLink href="/account/orders">My orders</MenuLink>
                  <MenuLink href="/account/addresses">Addresses</MenuLink>
                  {(user.role === "admin" || user.role === "staff") && (
                    <MenuLink href="/admin" tone="forest">Admin</MenuLink>
                  )}
                  {user.role === "driver" && (
                    <MenuLink href="/driver" tone="forest">Driver</MenuLink>
                  )}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await fetch("/api/auth/logout", { method: "POST" });
                      window.location.href = "/";
                    }}
                    className="border-t hairline"
                  >
                    <button
                      type="submit"
                      className="block w-full px-4 py-2.5 text-left text-[13px] text-ink-muted transition-colors hover:bg-cream-deep hover:text-ink"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-full bg-forest px-5 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuLink({ href, children, tone }: { href: string; children: React.ReactNode; tone?: "forest" }) {
  return (
    <Link
      href={href}
      className={cn(
        "block px-4 py-2.5 text-[13px] transition-colors hover:bg-cream-deep",
        tone === "forest" ? "font-medium text-forest" : "text-ink-soft",
      )}
    >
      {children}
    </Link>
  );
}

function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

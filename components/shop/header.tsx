"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import type { User } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const SHOP_LINKS: { name: string; href: string; hot?: boolean }[] = [
  { name: "Cream chargers", href: "/shop/cream-chargers", hot: true },
  { name: "Smartwhip tanks", href: "/shop/smartwhip-tanks", hot: true },
  { name: "MAXXI tanks", href: "/shop/maxxi-tanks" },
  { name: "Whippers", href: "/shop/whippers" },
  { name: "CO₂ cartridges", href: "/shop/co2-cartridges" },
  { name: "Soda siphons", href: "/shop/soda-siphons" },
  { name: "Monin syrups", href: "/shop/monin-syrups" },
  { name: "Coffee", href: "/shop/coffee" },
  { name: "Baking", href: "/shop/baking" },
  { name: "Disposables", href: "/shop/disposables" },
];

export function ShopHeader({ user }: { user: User | null }) {
  const count = useCart((s) => s.count());
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-[1280px] items-center justify-between px-6 py-5">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-[24px] font-medium leading-none tracking-tight text-forest">
            Dialawhip
          </span>
          <span className="hidden font-display text-[14px] italic font-light leading-none text-clay sm:inline">
            Newcastle
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] font-medium text-ink-soft md:flex">
          <div ref={shopRef} className="relative">
            <button
              onClick={() => setShopOpen((v) => !v)}
              className="inline-flex items-center gap-1 transition-colors hover:text-forest"
              aria-expanded={shopOpen}
            >
              Shop
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className={cn("transition-transform", shopOpen && "rotate-180")}>
                <path d="M2 4.5 6 8.5 10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {shopOpen ? (
              <div className="absolute left-1/2 top-[calc(100%+10px)] w-[520px] -translate-x-1/2 overflow-hidden rounded-xl border hairline bg-paper shadow-xl shadow-ink/10">
                <div className="grid grid-cols-2 gap-px bg-line">
                  {SHOP_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setShopOpen(false)}
                      className="group flex items-center justify-between bg-paper px-4 py-3 text-[13px] text-ink-soft transition-colors hover:bg-cream-deep hover:text-forest"
                    >
                      <span>{l.name}</span>
                      {l.hot ? (
                        <span className="rounded-full bg-butter/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-forest">Hot</span>
                      ) : null}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/shop"
                  onClick={() => setShopOpen(false)}
                  className="block border-t hairline bg-cream-deep/50 px-5 py-3 text-center text-[12px] font-medium text-forest transition-colors hover:bg-cream-deep"
                >
                  Full catalogue →
                </Link>
              </div>
            ) : null}
          </div>
          <Link href="/delivery" className="transition-colors hover:text-forest">Delivery</Link>
          <Link href="/trade" className="transition-colors hover:text-forest">Trade</Link>
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
            {mounted && count > 0 ? (
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
                  <MenuLink href="/account/verification">ID &amp; verification</MenuLink>
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

"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import type { User } from "@/lib/types";
import type { PublicSettings } from "@/lib/settings";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
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

export function ShopHeader({
  user,
  settings,
}: {
  user: User | null;
  settings?: PublicSettings;
}) {
  // Brand info pulled from admin settings (with sensible fallbacks).
  const brandName = (settings?.["business.name"] as string) || "Dialawhip";
  const brandTagline = (settings?.["business.city"] as string) || "Newcastle";
  const logoUrl = (settings?.["branding.logo_url"] as string) || "";
  const phone = (settings?.["business.phone"] as string) || "";

  const count = useCart((s) => s.count());
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShopOpen(false);
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
    <header className="sticky top-0 z-40 border-b hairline bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:h-18 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={brandName}
              className="h-8 w-auto sm:h-10"
            />
          ) : (
            <span className="font-display text-[22px] font-medium leading-none tracking-tight text-forest sm:text-[24px]">
              {brandName}
            </span>
          )}
          {brandTagline ? (
            <span className="hidden font-display text-[14px] italic font-light leading-none text-clay sm:inline">
              {brandTagline}
            </span>
          ) : null}
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

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/cart"
            className="group relative inline-flex h-10 items-center gap-1.5 rounded-full border hairline bg-paper px-3 text-[13px] font-medium text-ink-soft transition-all hover:border-forest hover:text-forest sm:gap-2 sm:px-4"
            aria-label="Cart"
          >
            <BagIcon />
            <span className="hidden sm:inline">Bag</span>
            {mounted && count > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1.5 text-[11px] font-semibold text-cream tabular-nums">
                {count}
              </span>
            ) : null}
          </Link>

          {user ? (
            <div className="relative hidden md:block">
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
              className="hidden h-10 items-center rounded-full bg-forest px-5 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep md:inline-flex"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border hairline bg-paper text-ink-soft transition-colors hover:border-forest hover:text-forest md:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <BurgerIcon />
          </button>
        </div>
      </div>
    </header>

    {mobileOpen ? (
      <MobileDrawer user={user} onClose={() => setMobileOpen(false)} brandName={brandName} brandTagline={brandTagline} logoUrl={logoUrl} phone={phone} />
    ) : null}
    </>
  );
}

function MobileDrawer({
  user, onClose, brandName, brandTagline, logoUrl, phone,
}: {
  user: User | null;
  onClose: () => void;
  brandName: string;
  brandTagline: string;
  logoUrl: string;
  phone: string;
}) {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-cream shadow-[-20px_0_60px_-20px_rgba(10,22,40,0.35)]">
        <div className="flex items-center justify-between border-b hairline px-5 py-4">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={brandName} className="h-9 w-auto" />
            ) : (
              <div className="font-display leading-tight">
                <span className="block text-[20px] text-forest">{brandName}</span>
                {brandTagline ? (
                  <span className="block text-[12px] italic font-light text-clay">{brandTagline}</span>
                ) : null}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border hairline bg-paper text-ink-soft transition-colors hover:border-forest hover:text-forest"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {user ? (
            <div className="border-b hairline bg-paper px-5 py-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-forest font-display text-[15px] text-cream">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <div className="font-display text-[16px] text-ink">{user.name}</div>
                  <div className="text-[12px] text-ink-muted">{user.email}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-b hairline bg-paper px-5 py-5">
              <Link
                href="/login"
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-forest px-5 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-full border hairline bg-paper px-5 text-[14px] font-medium text-ink"
              >
                Create an account
              </Link>
            </div>
          )}

          <nav className="px-5 py-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">Shop by category</div>
            <div className="mt-3 space-y-1">
              {SHOP_LINKS.map((l) => (
                <DrawerLink key={l.href} href={l.href}>
                  <span>{l.name}</span>
                  {l.hot ? (
                    <span className="rounded-full bg-butter/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-forest">Hot</span>
                  ) : null}
                </DrawerLink>
              ))}
              <DrawerLink href="/shop" highlight>
                <span>All products →</span>
              </DrawerLink>
            </div>
          </nav>

          <nav className="border-t hairline px-5 py-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">{brandName}</div>
            <div className="mt-3 space-y-1">
              <DrawerLink href="/delivery"><span>Delivery &amp; ETAs</span></DrawerLink>
              <DrawerLink href="/trade"><span>Trade accounts</span></DrawerLink>
              <DrawerLink href="/about"><span>About us</span></DrawerLink>
              <DrawerLink href="/contact"><span>Contact</span></DrawerLink>
              {phone ? (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-medium text-forest hover:bg-cream-deep"
                >
                  <span>Call {phone}</span>
                </a>
              ) : null}
            </div>
          </nav>

          {user ? (
            <nav className="border-t hairline px-5 py-4">
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">Your account</div>
              <div className="mt-3 space-y-1">
                <DrawerLink href="/account"><span>Account</span></DrawerLink>
                <DrawerLink href="/account/orders"><span>My orders</span></DrawerLink>
                <DrawerLink href="/account/addresses"><span>Addresses</span></DrawerLink>
                <DrawerLink href="/account/verification"><span>ID &amp; verification</span></DrawerLink>
                {(user.role === "admin" || user.role === "staff") ? (
                  <DrawerLink href="/admin" highlight><span>Admin dashboard →</span></DrawerLink>
                ) : null}
                {user.role === "driver" ? (
                  <DrawerLink href="/driver" highlight><span>Driver app →</span></DrawerLink>
                ) : null}
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
                className="mt-2"
              >
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border hairline bg-paper px-4 text-[13px] font-medium text-ink-muted transition-colors hover:border-ink/25"
                >
                  Sign out
                </button>
              </form>
            </nav>
          ) : null}
        </div>

        <div className="border-t hairline px-5 py-4 text-[11px] leading-relaxed text-ink-muted">
          <p className="font-medium text-ink">18+ only.</p>
          <p className="mt-1">For culinary use. We reserve the right to refuse supply.</p>
        </div>
      </aside>
    </div>
  );
}

function DrawerLink({
  href,
  children,
  highlight,
}: {
  href: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] transition-colors",
        highlight
          ? "font-medium text-forest hover:bg-cream-deep"
          : "text-ink-soft hover:bg-cream-deep hover:text-ink",
      )}
    >
      {children}
    </Link>
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

function BurgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

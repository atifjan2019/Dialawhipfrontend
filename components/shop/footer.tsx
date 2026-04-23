import Link from "next/link";

export function ShopFooter() {
  return (
    <footer className="mt-24 bg-forest text-cream/90">
      <div className="mx-auto max-w-[1280px] px-6 pt-16 pb-10">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display leading-tight">
              <span className="block text-[32px]">Dialawhip</span>
              <span className="block text-[18px] italic font-light text-butter">Newcastle · 20-min delivery</span>
            </div>
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-cream/70">
              Rapid catering supplies across Tyneside — chargers, whippers, syrups,
              coffee and disposables, at your door in minutes. Strictly trade &amp; 18+.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-cream/60">
              <span className="rounded-full border border-cream/15 px-3 py-1.5">Visa</span>
              <span className="rounded-full border border-cream/15 px-3 py-1.5">Amex</span>
              <span className="rounded-full border border-cream/15 px-3 py-1.5">Klarna</span>
              <span className="rounded-full border border-cream/15 px-3 py-1.5">Apple Pay</span>
              <span className="rounded-full border border-cream/15 px-3 py-1.5">Cash</span>
            </div>
          </div>

          <FooterCol title="Shop">
            <FooterLink href="/shop/cream-chargers">Cream chargers</FooterLink>
            <FooterLink href="/shop/smartwhip-tanks">Smartwhip tanks</FooterLink>
            <FooterLink href="/shop/maxxi-tanks">MAXXI tanks</FooterLink>
            <FooterLink href="/shop/whippers">Whippers</FooterLink>
            <FooterLink href="/shop/monin-syrups">Monin syrups</FooterLink>
            <FooterLink href="/shop">Full catalogue →</FooterLink>
          </FooterCol>

          <FooterCol title="Service">
            <FooterLink href="/delivery">Delivery &amp; coverage</FooterLink>
            <FooterLink href="/trade">Trade accounts</FooterLink>
            <FooterLink href="/account/orders">Track an order</FooterLink>
            <FooterLink href="/contact">Contact us</FooterLink>
            <FooterLink href="/about">About Dialawhip</FooterLink>
          </FooterCol>

          <FooterCol title="Legal">
            <FooterLink href="/legal/terms">Terms &amp; conditions</FooterLink>
            <FooterLink href="/legal/privacy">Privacy policy</FooterLink>
            <FooterLink href="/legal/shipping">Shipping &amp; payment</FooterLink>
            <FooterLink href="/legal/n2o-agreement">N₂O chargers agreement</FooterLink>
            <FooterLink href="/legal/report-abuse">Report abuse</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-14 space-y-3 rounded-xl border border-cream/10 bg-forest-deep/50 p-5 text-[12px] leading-relaxed text-cream/70">
          <p><strong className="text-butter">You must be at least 18 years of age to use this website.</strong></p>
          <p>Products for sale on this website are for use in the preparation of food and beverages only.</p>
          <p>We retain the right to refuse to sell to anyone we suspect may have the intention of misusing our products.</p>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-8 text-[12px] text-cream/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Dialawhip Ltd — Newcastle upon Tyne.</p>
          <p className="flex flex-wrap gap-5">
            <span>Tue–Sun · 10:00–03:00</span>
            <span>Closed Mondays</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-medium uppercase tracking-[0.18em] text-butter/90">{title}</h4>
      <div className="mt-4 flex flex-col gap-2.5 text-[14px]">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-cream/70 transition-colors hover:text-butter">
      {children}
    </Link>
  );
}

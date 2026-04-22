import Link from "next/link";

export function ShopFooter() {
  return (
    <footer className="mt-24 bg-forest text-cream/90">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display leading-tight">
              <span className="block text-[32px]">Dialawhip</span>
              <span className="block text-[18px] italic font-light text-butter">Newcastle catering</span>
            </div>
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-cream/70">
              Hand-prepared catering from the heart of Tyneside — office lunches,
              family gatherings and events, delivered the same day.
            </p>
          </div>

          <FooterCol title="Shop">
            <FooterLink href="/menu">Full menu</FooterLink>
            <FooterLink href="/service-area">Delivery zones</FooterLink>
            <FooterLink href="/account/orders">Your orders</FooterLink>
          </FooterCol>

          <FooterCol title="Company">
            <FooterLink href="/contact">Contact us</FooterLink>
            <FooterLink href="/contact">Corporate</FooterLink>
            <FooterLink href="/contact">Careers</FooterLink>
          </FooterCol>

          <FooterCol title="Visit">
            <p className="text-[14px] leading-relaxed text-cream/70">
              Grainger Market<br />
              Newcastle upon Tyne<br />
              NE1 5QQ
            </p>
            <p className="mt-3 text-[14px] text-cream/70">
              <a href="tel:01910000000" className="hover:text-butter">0191 000 0000</a><br />
              <a href="mailto:hello@dialawhip.test" className="hover:text-butter">hello@dialawhip.test</a>
            </p>
          </FooterCol>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-8 text-[12px] text-cream/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Dialawhip — Made on Tyneside.</p>
          <p className="flex gap-5">
            <span>Mon–Fri 08:00–17:00</span>
            <span>Sat 09:00–14:00</span>
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

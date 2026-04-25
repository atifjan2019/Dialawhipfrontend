import Link from "next/link";
import type { PublicSettings } from "@/lib/settings";
import { settingString, socialLinks, formatBusinessHours } from "@/lib/settings";

export function ShopFooter({ settings }: { settings?: PublicSettings }) {
  const s = settings ?? {};

  const brandName = settingString(s, "business.name", "Dialawhip");
  const tagline = settingString(s, "business.tagline", "Newcastle · 20-min delivery");
  const logoUrl = settingString(s, "branding.logo_url");
  const phone = settingString(s, "business.phone");
  const whatsapp = settingString(s, "business.whatsapp");
  const email = settingString(s, "business.email");
  const supportEmail = settingString(s, "business.support_email");
  const address = settingString(s, "business.address");
  const city = settingString(s, "business.city");
  const country = settingString(s, "business.country");

  const termsUrl = settingString(s, "legal.terms_url", "/legal/terms");
  const privacyUrl = settingString(s, "legal.privacy_url", "/legal/privacy");
  const shippingUrl = settingString(s, "legal.refund_url", "/legal/shipping");
  const cookiesUrl = settingString(s, "legal.cookies_url");

  const socials = socialLinks(s);
  const hours = formatBusinessHours(s);

  return (
    <footer className="mt-24 bg-forest text-cream/90">
      <div className="mx-auto max-w-[1280px] px-6 pt-16 pb-10">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display leading-tight">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={brandName} className="h-12 w-auto" />
              ) : (
                <span className="block text-[32px]">{brandName}</span>
              )}
              {tagline ? (
                <span className="mt-2 block text-[18px] italic font-light text-butter">{tagline}</span>
              ) : null}
            </div>
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-cream/70">
              Rapid catering supplies across Tyneside — chargers, whippers, syrups,
              coffee and disposables, at your door in minutes. Strictly trade &amp; 18+.
            </p>

            {(phone || email || address) ? (
              <div className="mt-6 space-y-2 text-[13px] text-cream/80">
                {phone ? (
                  <div>
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-butter">
                      {phone}
                    </a>
                  </div>
                ) : null}
                {whatsapp ? (
                  <div>
                    <a
                      href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-butter"
                    >
                      WhatsApp · {whatsapp}
                    </a>
                  </div>
                ) : null}
                {email ? (
                  <div>
                    <a href={`mailto:${email}`} className="hover:text-butter">{email}</a>
                  </div>
                ) : null}
                {supportEmail && supportEmail !== email ? (
                  <div>
                    <a href={`mailto:${supportEmail}`} className="hover:text-butter">
                      Support · {supportEmail}
                    </a>
                  </div>
                ) : null}
                {address || city || country ? (
                  <div className="text-cream/60">
                    {[address, city, country].filter(Boolean).join(", ")}
                  </div>
                ) : null}
              </div>
            ) : null}

            {socials.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.12em]">
                {socials.map((soc) => (
                  <a
                    key={soc.key}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-cream/15 px-3 py-1.5 text-cream/70 transition-colors hover:border-butter hover:text-butter"
                  >
                    {soc.label}
                  </a>
                ))}
              </div>
            ) : null}

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
            <FooterLink href="/about">About {brandName}</FooterLink>
          </FooterCol>

          <FooterCol title="Legal">
            <FooterLink href={termsUrl}>Terms &amp; conditions</FooterLink>
            <FooterLink href={privacyUrl}>Privacy policy</FooterLink>
            <FooterLink href={shippingUrl}>Shipping &amp; payment</FooterLink>
            {cookiesUrl ? <FooterLink href={cookiesUrl}>Cookies policy</FooterLink> : null}
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
          <p>© {new Date().getFullYear()} {brandName} Ltd{city ? ` — ${city}` : ""}.</p>
          {hours.length > 0 ? (
            <p className="flex flex-wrap gap-x-5 gap-y-1.5">
              {hours.map((h, idx) => (
                <span key={`${h.label}-${idx}`}>
                  {h.label ? <strong className="font-medium text-cream/80">{h.label}</strong> : null}
                  {h.label ? " · " : ""}
                  {h.value}
                </span>
              ))}
            </p>
          ) : null}
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

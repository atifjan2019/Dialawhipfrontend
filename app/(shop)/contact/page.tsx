import { Eyebrow } from "@/components/shop/eyebrow";
import { getPublicSettings, settingString, socialLinks, formatBusinessHours } from "@/lib/settings";

export default async function ContactPage() {
  const s = await getPublicSettings();

  const phone = settingString(s, "business.phone");
  const email = settingString(s, "business.email");
  const supportEmail = settingString(s, "business.support_email");
  const address = settingString(s, "business.address");
  const city = settingString(s, "business.city");
  const country = settingString(s, "business.country");
  const whatsapp = settingString(s, "business.whatsapp");
  const socials = socialLinks(s);
  const hours = formatBusinessHours(s);
  const hoursHint = hours.length > 0
    ? hours.map((h) => (h.label ? `${h.label} ${h.value}` : h.value)).join(" · ")
    : "Tue–Sun 10:00–03:00";
  const brandName = settingString(s, "business.name", "Dialawhip");

  const cards: Array<{ label: string; value: string; href: string; hint: string }> = [];
  if (phone) {
    cards.push({
      label: "Phone",
      value: phone,
      href: `tel:${phone.replace(/\s+/g, "")}`,
      hint: hoursHint,
    });
  }
  if (email) {
    cards.push({
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      hint: "Replies within 1 hour",
    });
  }
  if (whatsapp) {
    cards.push({
      label: "WhatsApp",
      value: whatsapp,
      href: `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`,
      hint: "Chat with us directly",
    });
  }
  if (address || city) {
    cards.push({
      label: "Visit",
      value: city || address,
      href: `https://maps.google.com/?q=${encodeURIComponent(`${address} ${city}`.trim())}`,
      hint: [city, country].filter(Boolean).join(", ") || address,
    });
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-20">
      <div className="max-w-2xl">
        <Eyebrow>Say hello</Eyebrow>
        <h1 className="mt-5 font-display text-[56px] leading-[1] text-ink md:text-[80px]">
          Get in <span className="italic font-light text-forest">touch</span>.
        </h1>
        <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
          Questions about a booking, trade account, or something bespoke? We're on
          hand Tue–Sun — drop us a line.
        </p>
      </div>

      {cards.length > 0 ? (
        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border hairline bg-line md:grid-cols-3">
          {cards.map((c) => (
            <ContactCard key={c.label} {...c} />
          ))}
        </div>
      ) : null}

      {socials.length > 0 ? (
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Follow us
          </span>
          {socials.map((soc) => (
            <a
              key={soc.key}
              href={soc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border hairline bg-paper px-3.5 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:border-forest hover:text-forest"
            >
              {soc.label}
            </a>
          ))}
        </div>
      ) : null}

      <div className="mt-20 rounded-[22px] bg-forest p-14 text-cream md:p-20 paper-grain">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-16">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-butter/80">
              Trade & events
            </div>
            <h2 className="mt-5 font-display text-[40px] leading-[1] text-cream md:text-[52px]">
              Something <span className="italic font-light text-butter">bigger</span> in mind?
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-cream/75">
              Weddings, office events, private bars — we set up trade accounts with
              discounted pricing, account managers, and 24/7 ordering.
            </p>
          </div>
          <div className="space-y-4">
            {email ? (
              <a
                href={`mailto:${email}`}
                className="block rounded-lg bg-cream/5 p-5 transition-colors hover:bg-cream/10"
              >
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-butter/80">General</div>
                <div className="mt-1 font-display text-[20px] text-cream">{email}</div>
              </a>
            ) : null}
            {supportEmail ? (
              <a
                href={`mailto:${supportEmail}`}
                className="block rounded-lg bg-cream/5 p-5 transition-colors hover:bg-cream/10"
              >
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-butter/80">Support</div>
                <div className="mt-1 font-display text-[20px] text-cream">{supportEmail}</div>
              </a>
            ) : null}
            {!email && !supportEmail ? (
              <div className="rounded-lg bg-cream/5 p-5 text-[14px] text-cream/70">
                Add a contact email in <strong className="text-butter">{brandName}</strong> admin → Settings → Business.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ label, value, href, hint }: { label: string; value: string; href: string; hint: string }) {
  return (
    <a href={href} className="group block bg-paper p-8 transition-colors hover:bg-cream-deep/60">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-clay">{label}</div>
      <div className="mt-4 font-display text-[24px] leading-tight text-ink transition-colors group-hover:text-forest">
        {value}
      </div>
      <div className="mt-3 text-[12px] text-ink-muted">{hint}</div>
    </a>
  );
}

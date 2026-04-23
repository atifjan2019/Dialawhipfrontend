import { Eyebrow } from "@/components/shop/eyebrow";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-20">
      <div className="max-w-2xl">
        <Eyebrow>Say hello</Eyebrow>
        <h1 className="mt-5 font-display text-[56px] leading-[1] text-ink md:text-[80px]">
          Get in <span className="italic font-light text-forest">touch</span>.
        </h1>
        <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
          Questions about a booking, corporate account, or something bespoke?
          We're on hand Monday to Saturday — drop us a line.
        </p>
      </div>

      <div className="mt-16 grid gap-px overflow-hidden rounded-lg border hairline bg-line md:grid-cols-3">
        <ContactCard
          label="Phone"
          value="0191 000 0000"
          href="tel:+441910000000"
          hint="Mon–Fri 08:00–17:00"
        />
        <ContactCard
          label="Email"
          value="hello@dialawhip.test"
          href="mailto:hello@dialawhip.test"
          hint="Replies within 4 hours"
        />
        <ContactCard
          label="Visit"
          value="Grainger Market"
          href="https://maps.google.com/?q=Grainger+Market+Newcastle"
          hint="Newcastle NE1 5QQ"
        />
      </div>

      <div className="mt-20 rounded-[22px] bg-forest p-14 text-cream md:p-20 paper-grain">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-16">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-butter/80">
              Corporate & events
            </div>
            <h2 className="mt-5 font-display text-[40px] leading-[1] text-cream md:text-[52px]">
              Something <span className="italic font-light text-butter">bigger</span> in mind?
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-cream/75">
              Weddings, office lunches, private dinners — we build bespoke menus
              from ten to three hundred covers. Tell us what you have in mind.
            </p>
          </div>
          <div className="space-y-4">
            <a
              href="mailto:events@dialawhip.test"
              className="block rounded-lg bg-cream/5 p-5 transition-colors hover:bg-cream/10"
            >
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-butter/80">Events</div>
              <div className="mt-1 font-display text-[20px] text-cream">events@dialawhip.test</div>
            </a>
            <a
              href="mailto:corporate@dialawhip.test"
              className="block rounded-lg bg-cream/5 p-5 transition-colors hover:bg-cream/10"
            >
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-butter/80">Corporate</div>
              <div className="mt-1 font-display text-[20px] text-cream">corporate@dialawhip.test</div>
            </a>
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

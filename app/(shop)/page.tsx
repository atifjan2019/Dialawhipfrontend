import Link from "next/link";
import { Eyebrow } from "@/components/shop/eyebrow";
import { PostcodeChecker } from "@/components/shop/postcode-checker";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustRow />
      <Shelves />
      <HowItWorks />
      <Compliance />
      <ClosingCta />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-cream-deep/40 via-cream to-cream" aria-hidden />
      <div className="relative mx-auto grid max-w-[1280px] gap-12 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-24 md:grid-cols-[1.15fr_1fr] md:gap-10 md:pt-24 md:pb-32">
        <div className="flex flex-col justify-center">
          <Eyebrow>Newcastle · 20-minute delivery</Eyebrow>
          <h1 className="mt-5 font-display text-[44px] leading-[0.95] tracking-[-0.02em] text-ink sm:text-[56px] md:text-[88px]">
            Catering supplies,
            <br />
            <span className="italic font-light text-forest">in minutes</span>
            <span className="text-clay">.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft sm:mt-8 sm:text-[17px]">
            Cream chargers, whippers, syrups, coffee, and disposables — delivered to
            your kitchen, bar, or event across Tyneside. Average arrival: 18 minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center gap-1.5 whitespace-nowrap rounded-full bg-forest px-6 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep sm:h-13 sm:px-7"
            >
              Shop now
              <span aria-hidden>→</span>
            </Link>
            <a
              href="tel:01910000000"
              className="inline-flex h-12 items-center whitespace-nowrap rounded-full border hairline bg-paper px-6 text-[14px] font-medium text-ink transition-colors hover:border-ink/30 hover:bg-cream-deep sm:h-13 sm:px-7"
            >
              Call 0191 000 0000
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t hairline pt-7 text-[13px] sm:mt-14 sm:gap-6 sm:pt-8">
            <Stat k="18 min" v="Avg delivery" />
            <Stat k="20 mi" v="Radius, NE" />
            <Stat k="24/7" v="Support line" />
          </div>
        </div>

        <div className="relative flex items-center">
          <div className="w-full">
            <PostcodeChecker />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-display text-[20px] leading-tight text-forest sm:text-[24px]">{k}</div>
      <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted sm:text-[11px] sm:tracking-[0.14em]">{v}</div>
    </div>
  );
}

function TrustRow() {
  const items = [
    { k: "20-min", v: "Delivery window" },
    { k: "Live GPS", v: "Driver on the map" },
    { k: "Cash · Card", v: "Klarna · Apple Pay" },
    { k: "18+", v: "ID verified · secure" },
  ];
  return (
    <section className="border-y hairline bg-forest text-cream">
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-6 md:grid-cols-4">
          {items.map((i) => (
            <div key={i.k} className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:gap-3">
              <div className="font-display text-[18px] leading-none text-butter sm:text-[22px]">{i.k}</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-cream/70 sm:text-[11px] sm:tracking-[0.18em]">{i.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const SHELVES: { name: string; slug: string; blurb: string }[] = [
  { name: "Cream chargers", slug: "cream-chargers", blurb: "8g & 8.2g N₂O canisters — food-grade, ID required." },
  { name: "Smartwhip tanks", slug: "smartwhip-tanks", blurb: "580g, 640g, 666g — equivalent to 70+ chargers." },
  { name: "MAXXI tanks", slug: "maxxi-tanks", blurb: "2KG & 4KG disposables — 250 chargers per tank." },
  { name: "Whippers", slug: "whippers", blurb: "Quarter and half-litre dispensers — pro-grade." },
  { name: "CO₂ cartridges", slug: "co2-cartridges", blurb: "Pro Fizz · Liss · Mosa · ISI — for soda siphons." },
  { name: "Soda siphons", slug: "soda-siphons", blurb: "ISI 1L — the bar-standard sparkling water maker." },
  { name: "Monin syrups", slug: "monin-syrups", blurb: "Full flavour range — strawberry, gomme, curaçao." },
  { name: "Coffee", slug: "coffee", blurb: "Lavazza, Starbucks, Costa, Nescafé beans & instant." },
  { name: "Baking", slug: "baking", blurb: "Flour, sugar, eggs, baking powder — trade quantities." },
  { name: "Disposables", slug: "disposables", blurb: "Bagasse plates, paper cups, wooden cutlery, SOS bags." },
];

function Shelves() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-20">
      <div className="flex items-end justify-between gap-6">
        <div>
          <Eyebrow>What we stock</Eyebrow>
          <h2 className="mt-5 font-display text-[40px] leading-[1] text-ink md:text-[52px]">
            The <span className="italic text-forest">whole shelf</span>, on demand
          </h2>
        </div>
        <Link href="/shop" className="hidden text-[13px] font-medium text-ink-muted transition-colors hover:text-forest sm:inline-flex">
          Full catalogue →
        </Link>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-lg border hairline bg-line sm:grid-cols-2 lg:grid-cols-5">
        {SHELVES.map((c, i) => (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className="group relative block bg-paper p-6 transition-colors hover:bg-cream-deep"
          >
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-clay">№ {String(i + 1).padStart(2, "0")}</div>
            <h3 className="mt-5 font-display text-[20px] leading-tight text-ink transition-colors group-hover:text-forest">
              {c.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink-muted">{c.blurb}</p>
            <div className="mt-5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-forest">
              <span>Browse</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "1", t: "Verify once", d: "Upload ID at sign-up — passport, driving licence or residency card. Approved in minutes, never asked again." },
    { n: "2", t: "Add to bag", d: "Shop chargers, tanks, syrups, packaging. Stock levels shown live. Mix brands in one order." },
    { n: "3", t: "Pick a window", d: "Standard (20 min), Priority (+£5, 10 min) or Super-priority for true emergencies." },
    { n: "4", t: "We're at the door", d: "Watch the driver on the map. SMS & WhatsApp updates at every stage. Pay card, cash, Klarna." },
  ];
  return (
    <section className="border-y hairline bg-forest text-cream">
      <div className="mx-auto grid max-w-[1280px] gap-16 px-6 py-24 md:grid-cols-[1fr_1.4fr] md:gap-20">
        <div>
          <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-butter">
            <span className="h-px w-8 bg-butter/60" />
            <span>How it works</span>
          </div>
          <h2 className="mt-6 font-display text-[40px] leading-[1] text-cream md:text-[56px]">
            Faster than your
            <br />
            <span className="italic font-light text-butter">usual supplier</span>
          </h2>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-cream/70">
            We carry stock close to the city so your kitchen doesn't stop when it
            runs out. Order by 3am, Tuesday to Sunday.
          </p>
        </div>

        <ol className="grid gap-px overflow-hidden rounded-lg bg-cream/10 sm:grid-cols-2">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-6 bg-forest p-7">
              <div className="font-display text-[48px] italic font-light leading-none text-butter/80">
                {s.n}
              </div>
              <div className="flex-1 pt-1.5">
                <h3 className="font-display text-[20px] leading-tight text-cream">{s.t}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-cream/70">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Compliance() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-24">
      <div className="grid gap-12 rounded-2xl border hairline bg-cream-deep/50 p-10 md:grid-cols-[1.1fr_1fr] md:gap-16 md:p-14">
        <div>
          <Eyebrow>Strictly trade &amp; over-18</Eyebrow>
          <h2 className="mt-5 font-display text-[32px] leading-tight text-ink md:text-[40px]">
            Sold for catering and <span className="italic text-forest">culinary use only</span>.
          </h2>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-ink-soft">
            Nitrous oxide is a Class C substance under the Misuse of Drugs Act 2023.
            Supply for food preparation is legal — and we take that seriously. Every
            customer is ID-checked and every order carries a signed statement of use.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            <span className="rounded-full border hairline bg-paper px-3 py-1.5">Passport</span>
            <span className="rounded-full border hairline bg-paper px-3 py-1.5">Driving licence</span>
            <span className="rounded-full border hairline bg-paper px-3 py-1.5">Residency card</span>
            <span className="rounded-full border hairline bg-paper px-3 py-1.5">Citizen card</span>
            <span className="rounded-full border hairline bg-paper px-3 py-1.5">Military ID</span>
          </div>
        </div>

        <div className="rounded-xl bg-paper p-8">
          <div className="flex items-center justify-between border-b hairline pb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
            <span>Order readiness</span>
            <span className="text-forest">3 of 3</span>
          </div>
          <ul className="mt-5 space-y-4 text-[13px] text-ink-soft">
            <Check>Account created &amp; email verified</Check>
            <Check>ID uploaded once — valid for 2 years</Check>
            <Check>Statement of use signed at checkout</Check>
          </ul>
          <Link
            href="/register"
            className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-full bg-ink px-5 text-[13px] font-medium text-cream transition-colors hover:bg-ink-soft"
          >
            Open a trade account →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest text-[10px] font-semibold text-butter">✓</span>
      <span>{children}</span>
    </li>
  );
}

function ClosingCta() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 pb-28 text-center">
      <Eyebrow className="justify-center">Dialawhip · Newcastle</Eyebrow>
      <p className="mx-auto mt-8 max-w-3xl font-display text-[44px] leading-[1.05] text-ink md:text-[68px]">
        Out of stock? <span className="italic font-light text-forest">Not for long</span>.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="inline-flex h-13 items-center rounded-full bg-forest px-8 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          Start your order
        </Link>
        <Link
          href="/trade"
          className="inline-flex h-13 items-center rounded-full border hairline bg-paper px-8 text-[14px] font-medium text-ink transition-colors hover:border-ink/30"
        >
          Open a trade account
        </Link>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Eyebrow } from "@/components/shop/eyebrow";
import { PostcodeChecker } from "@/components/shop/postcode-checker";
import { apiServer } from "@/lib/api-server";
import { getPublicSettings, settingString } from "@/lib/settings";
import type { Product, Paginated } from "@/lib/types";

export default async function HomePage() {
  const [settings, productsRes] = await Promise.all([
    getPublicSettings(),
    apiServer<Paginated<Product>>("/api/v1/products", { auth: false }).catch(() => ({
      data: [] as Product[],
      meta: { next_cursor: null, prev_cursor: null },
    })),
  ]);
  const tagline = settingString(settings, "business.tagline", "Newcastle · 20-minute delivery");
  const phone = settingString(settings, "business.phone");
  const featured = productsRes.data?.[0] ?? null;

  return (
    <>
      <Hero tagline={tagline} phone={phone} featured={featured} />
      <Marquee />
      <FeatureProduct product={featured} />
      <Shelves />
      <HowItWorks />
      <Compliance />
      <ClosingCta />
    </>
  );
}

function Hero({
  tagline,
  phone,
  featured,
}: {
  tagline: string;
  phone: string;
  featured: Product | null;
}) {
  return (
    <section className="relative overflow-hidden bg-yellow">
      {/* Diagonal black corner */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] bg-ink md:block"
        style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0 100%)" }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-[1280px] gap-10 px-5 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28 md:grid-cols-[1.05fr_1fr] md:gap-12 md:pt-28 md:pb-36">
        <div className="relative z-10 flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-ink bg-paper px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
            <span className="h-2 w-2 rounded-full bg-brand" /> {tagline}
          </div>
          <h1 className="mt-6 font-display text-[56px] font-bold leading-[0.92] tracking-[-0.03em] text-ink sm:text-[72px] md:text-[112px]">
            Out of gas?
            <br />
            <span className="text-brand">Not for long.</span>
          </h1>
          <p className="mt-7 max-w-md text-[16px] leading-relaxed text-ink/85 sm:text-[18px]">
            Premium cream chargers, tanks, syrups & coffee — at your kitchen
            door across Tyneside in <strong>under 20 minutes</strong>.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex h-13 items-center gap-2 rounded-full bg-ink px-7 text-[14px] font-bold text-paper transition-transform hover:-translate-y-0.5"
            >
              Shop now <span aria-hidden>→</span>
            </Link>
            {phone ? (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="inline-flex h-13 items-center rounded-full border-2 border-ink bg-yellow px-7 text-[14px] font-bold text-ink transition-colors hover:bg-paper"
              >
                Call {phone}
              </a>
            ) : null}
          </div>

          <div className="mt-12 grid grid-cols-3 gap-5 border-t-2 border-ink/15 pt-7">
            <Stat k="18" v="Min avg delivery" tone="ink" />
            <Stat k="20mi" v="Tyneside coverage" tone="ink" />
            <Stat k="24/7" v="Driver tracking" tone="ink" />
          </div>
        </div>

        {/* Right side: postcode checker on top of black panel */}
        <div className="relative z-10 flex flex-col justify-center gap-6">
          {featured?.image_url ? (
            <div className="relative overflow-hidden rounded-3xl bg-paper p-6 ring-2 ring-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.image_url}
                alt={featured.name}
                className="mx-auto h-64 w-auto object-contain md:h-80"
              />
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                    Featured
                  </div>
                  <div className="mt-1 font-display text-[18px] font-bold text-ink">
                    {featured.name}
                  </div>
                </div>
                <Link
                  href={`/products/${featured.slug}`}
                  className="inline-flex h-10 items-center rounded-full bg-brand px-4 text-[12px] font-bold text-paper transition-colors hover:bg-brand-deep"
                >
                  View →
                </Link>
              </div>
            </div>
          ) : null}
          <div className="rounded-3xl bg-paper p-1 ring-2 ring-ink">
            <PostcodeChecker />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v, tone }: { k: string; v: string; tone: "ink" | "paper" }) {
  return (
    <div>
      <div
        className={
          tone === "ink"
            ? "font-display text-[28px] font-bold leading-none text-ink sm:text-[32px]"
            : "font-display text-[28px] font-bold leading-none text-paper sm:text-[32px]"
        }
      >
        {k}
      </div>
      <div
        className={
          tone === "ink"
            ? "mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/70 sm:text-[11px]"
            : "mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-paper/70 sm:text-[11px]"
        }
      >
        {v}
      </div>
    </div>
  );
}

function Marquee() {
  const items = [
    "Cream Deluxe",
    "Smartwhip",
    "MAXXI",
    "Mosa",
    "iSi",
    "Monin",
    "Lavazza",
    "Costa",
  ];
  return (
    <section className="border-y-2 border-ink bg-ink py-5 text-paper">
      <div className="mx-auto max-w-[1280px] overflow-hidden px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:justify-between">
          {items.map((b) => (
            <span
              key={b}
              className="font-display text-[18px] font-bold text-paper/95 sm:text-[22px]"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureProduct({ product }: { product: Product | null }) {
  if (!product) return null;
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-24">
      <div className="grid gap-10 rounded-3xl bg-ink p-8 text-paper md:grid-cols-[1fr_1.2fr] md:gap-14 md:p-14">
        <div className="relative flex items-center justify-center rounded-2xl bg-yellow p-10">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-72 w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] md:h-96"
            />
          ) : (
            <div className="font-display text-[80px] font-bold text-ink">
              {product.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-yellow">
            ★ Hero product
          </div>
          {product.brand ? (
            <div className="mt-3 text-[14px] font-bold uppercase tracking-[0.14em] text-paper/70">
              {product.brand}
            </div>
          ) : null}
          <h2 className="mt-3 font-display text-[44px] font-bold leading-[0.95] tracking-tight text-paper md:text-[60px]">
            {product.name}
          </h2>
          {product.description ? (
            <p className="mt-6 max-w-lg text-[15px] leading-[1.7] text-paper/75">
              {product.description}
            </p>
          ) : null}
          <div className="mt-8 flex items-baseline gap-3">
            <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-paper/60">
              from
            </span>
            <span className="font-display text-[40px] font-bold text-yellow md:text-[48px]">
              £{(product.price_pence / 100).toFixed(2)}
            </span>
          </div>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex h-13 items-center gap-2 rounded-full bg-yellow px-7 text-[14px] font-bold text-ink transition-transform hover:-translate-y-0.5"
            >
              Buy now <span aria-hidden>→</span>
            </Link>
            <Link
              href="/shop"
              className="inline-flex h-13 items-center rounded-full border-2 border-paper/30 px-7 text-[14px] font-bold text-paper transition-colors hover:border-paper"
            >
              All products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const SHELVES: { name: string; slug: string; blurb: string }[] = [
  { name: "Cream chargers", slug: "cream-chargers", blurb: "Premium 8g, 8.2g & 666g cylinders. Food-grade, ID required." },
  { name: "Smartwhip tanks", slug: "smartwhip-tanks", blurb: "580g–666g — equivalent to 70+ chargers per tank." },
  { name: "MAXXI tanks", slug: "maxxi-tanks", blurb: "2KG & 4KG disposables — 250 chargers per tank." },
  { name: "Whippers", slug: "whippers", blurb: "Quarter and half-litre dispensers — pro-grade." },
  { name: "CO₂ cartridges", slug: "co2-cartridges", blurb: "Pro Fizz, Liss, Mosa, ISI — for soda siphons." },
  { name: "Soda siphons", slug: "soda-siphons", blurb: "ISI 1L — the bar-standard sparkling water maker." },
  { name: "Monin syrups", slug: "monin-syrups", blurb: "Full flavour range — strawberry, gomme, curaçao." },
  { name: "Coffee", slug: "coffee", blurb: "Lavazza, Starbucks, Costa, Nescafé — beans & instant." },
];

function Shelves() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <Eyebrow>Browse the catalogue</Eyebrow>
          <h2 className="mt-5 font-display text-[44px] font-bold leading-[1] tracking-tight text-ink md:text-[60px]">
            Shop by <span className="text-brand">category</span>
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-muted">
            Stock kept ten minutes from the city centre. Mix brands in one
            order, no minimum.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-[13px] font-bold text-paper transition-transform hover:-translate-y-0.5"
        >
          Full catalogue →
        </Link>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHELVES.map((c, i) => (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className="group relative overflow-hidden rounded-2xl bg-paper p-7 ring-2 ring-ink/10 transition-all hover:ring-brand"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
              № {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="mt-6 font-display text-[22px] font-bold leading-tight text-ink transition-colors group-hover:text-brand">
              {c.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink-muted">
              {c.blurb}
            </p>
            <div className="mt-7 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60 transition-colors group-hover:text-brand">
              <span>Browse shelf</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-yellow opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Verify once", d: "Upload ID at sign-up — passport, driving licence or residency card. Approved in minutes, never asked again." },
    { n: "02", t: "Add to bag", d: "Shop chargers, tanks, syrups, packaging. Stock levels shown live. Mix brands in one order." },
    { n: "03", t: "Pick a window", d: "Standard (20 min), Priority (+£5, 10 min) or Super-priority for true emergencies." },
    { n: "04", t: "We're at the door", d: "Watch the driver on the map. SMS & WhatsApp updates at every stage. Pay card, cash, Klarna." },
  ];
  return (
    <section className="bg-brand text-paper">
      <div className="mx-auto max-w-[1280px] px-6 py-24 md:py-28">
        <div className="grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
              How it works
            </div>
            <h2 className="mt-6 max-w-2xl font-display text-[44px] font-bold leading-[1] tracking-tight md:text-[64px]">
              Faster than your usual supplier.
            </h2>
          </div>
          <p className="max-w-sm text-[14px] leading-relaxed text-paper/75">
            We carry stock close to the city so your kitchen doesn&rsquo;t stop
            when it runs out. Order by 03:00, Tuesday to Sunday.
          </p>
        </div>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-paper/15 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="bg-brand p-7">
              <div className="font-display text-[44px] font-bold leading-none text-yellow">
                {s.n}
              </div>
              <h3 className="mt-7 font-display text-[20px] font-bold text-paper">{s.t}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-paper/75">{s.d}</p>
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
      <div className="grid gap-10 rounded-3xl bg-yellow p-10 md:grid-cols-[1.1fr_1fr] md:gap-14 md:p-14">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-paper">
            Strictly trade · 18+
          </div>
          <h2 className="mt-6 font-display text-[36px] font-bold leading-tight tracking-tight text-ink md:text-[48px]">
            Sold for catering and culinary use only.
          </h2>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-ink/85">
            Nitrous oxide is a Class C substance under the Misuse of Drugs Act 2023.
            Supply for food preparation is legal — and we take that seriously. Every
            customer is ID-checked and every order carries a signed statement of use.
          </p>
          <div className="mt-7 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
            <span className="rounded-full border-2 border-ink bg-paper px-3 py-1.5">Passport</span>
            <span className="rounded-full border-2 border-ink bg-paper px-3 py-1.5">Driving licence</span>
            <span className="rounded-full border-2 border-ink bg-paper px-3 py-1.5">Residency card</span>
            <span className="rounded-full border-2 border-ink bg-paper px-3 py-1.5">Citizen card</span>
            <span className="rounded-full border-2 border-ink bg-paper px-3 py-1.5">Military ID</span>
          </div>
        </div>

        <div className="rounded-2xl bg-ink p-8 text-paper">
          <div className="flex items-center justify-between border-b border-paper/20 pb-4 text-[11px] font-bold uppercase tracking-[0.16em]">
            <span className="text-paper/60">Order readiness</span>
            <span className="text-yellow">3 of 3</span>
          </div>
          <ul className="mt-5 space-y-4 text-[13px] text-paper/85">
            <Check>Account created &amp; email verified</Check>
            <Check>ID uploaded once — valid for 2 years</Check>
            <Check>Statement of use signed at checkout</Check>
          </ul>
          <Link
            href="/register"
            className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-full bg-yellow px-5 text-[13px] font-bold text-ink transition-transform hover:-translate-y-0.5"
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
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow text-[10px] font-bold text-ink">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

function ClosingCta() {
  return (
    <section className="bg-ink py-24 text-center text-paper">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-yellow">
          Dialawhip · Newcastle
        </div>
        <p className="mx-auto mt-7 max-w-3xl font-display text-[48px] font-bold leading-[1.02] tracking-tight md:text-[80px]">
          Out of stock?{" "}
          <span className="text-yellow">Not for long.</span>
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex h-13 items-center rounded-full bg-yellow px-8 text-[14px] font-bold text-ink transition-transform hover:-translate-y-0.5"
          >
            Start your order
          </Link>
          <Link
            href="/trade"
            className="inline-flex h-13 items-center rounded-full border-2 border-paper/30 px-8 text-[14px] font-bold text-paper transition-colors hover:border-paper"
          >
            Open a trade account
          </Link>
        </div>
      </div>
    </section>
  );
}

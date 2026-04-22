import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/shop/product-card";
import { Eyebrow } from "@/components/shop/eyebrow";

export default async function HomePage() {
  const [cats, prods] = await Promise.all([
    apiServer<{ data: Category[] }>("/api/v1/categories", { auth: false, cache: "no-store" }).catch(() => ({ data: [] })),
    apiServer<{ data: Product[] }>("/api/v1/products", { auth: false, query: { limit: 6 }, cache: "no-store" }).catch(() => ({ data: [] })),
  ]);

  return (
    <>
      <Hero featured={prods.data[0]} />
      <Ethos />
      <Categories categories={cats.data} />
      <Popular products={prods.data} />
      <Process />
      <ClosingCta />
    </>
  );
}

function Hero({ featured }: { featured?: Product }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-cream-deep/40 via-cream to-cream" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 pt-16 pb-24 md:grid-cols-[1.2fr_1fr] md:gap-8 md:pt-24 md:pb-32">
        <div className="flex flex-col justify-center">
          <Eyebrow>Tyneside · Est. 2019</Eyebrow>
          <h1 className="mt-6 font-display text-[56px] leading-[0.95] tracking-[-0.02em] text-ink md:text-[84px]">
            Catering,
            <br />
            <span className="italic font-light text-forest">made with care</span>
            <span className="text-clay">.</span>
          </h1>
          <p className="mt-8 max-w-md text-[17px] leading-relaxed text-ink-soft">
            Hand-prepared platters, warm family spreads, and corporate lunches —
            cooked fresh each morning in our Newcastle kitchen and delivered across Tyneside.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="inline-flex h-13 items-center rounded-full bg-forest px-7 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep"
            >
              Browse the menu
              <span className="ml-2">→</span>
            </Link>
            <Link
              href="/service-area"
              className="inline-flex h-13 items-center rounded-full border hairline bg-paper px-7 text-[14px] font-medium text-ink transition-colors hover:border-ink/30 hover:bg-cream-deep"
            >
              Check delivery
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6 border-t hairline pt-8 text-[13px]">
            <Stat k="24h" v="Order lead time" />
            <Stat k="NE1–NE8" v="Delivery zones" />
            <Stat k="£20" v="Minimum order" />
          </div>
        </div>

        <div className="relative">
          <HeroCard featured={featured} />
        </div>
      </div>
    </section>
  );
}

function HeroCard({ featured }: { featured?: Product }) {
  return (
    <div className="relative mx-auto w-full max-w-sm md:ml-auto">
      <div className="absolute -top-5 -left-5 h-full w-full rotate-[-3deg] rounded-[22px] bg-clay/15" aria-hidden />
      <div className="relative overflow-hidden rounded-[22px] border hairline bg-paper shadow-[0_30px_60px_-30px_rgba(27,20,14,0.25)]">
        <div className="relative h-80 overflow-hidden bg-forest paper-grain">
          <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest-deep to-[#0C1811]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-butter/80">Today's special</span>
            <p className="mt-4 font-display text-[40px] italic font-light leading-tight text-cream">
              {featured?.name ?? "Stottie & Pease"}
            </p>
            <div className="mt-6 h-px w-12 bg-butter/50" />
            <p className="mt-4 max-w-[220px] text-[13px] leading-relaxed text-cream/70">
              A plate of the North East, served with warmth.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between bg-cream-deep px-6 py-5">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">From</div>
            <div className="font-display text-[24px] leading-none text-ink">£14.50</div>
          </div>
          <Link
            href={featured ? `/products/${featured.slug}` : "/menu"}
            className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-[12px] font-medium tracking-wide text-cream transition-colors hover:bg-ink-soft"
          >
            Order today
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-display text-[24px] leading-tight text-forest">{k}</div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">{v}</div>
    </div>
  );
}

function Ethos() {
  const items = [
    {
      n: "01",
      title: "Sourced locally",
      body: "From Northumbrian farms, coastal fisheries and Tyneside bakers — we pay for quality, and it shows.",
    },
    {
      n: "02",
      title: "Cooked same day",
      body: "Nothing reheated, nothing shortcut. Our kitchen opens before sunrise so your lunch doesn't taste like yesterday.",
    },
    {
      n: "03",
      title: "Delivered with care",
      body: "Temperature-controlled vans, timed windows, and drivers who place the tray where it belongs.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-10 md:grid-cols-3">
        {items.map((i) => (
          <div key={i.n} className="relative pt-8">
            <div className="absolute top-0 left-0 font-display text-[14px] italic text-clay">№ {i.n}</div>
            <h3 className="font-display text-[26px] leading-tight text-ink">{i.title}</h3>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{i.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Categories({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="border-y hairline bg-cream-deep/50">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <Eyebrow>The menu</Eyebrow>
            <h2 className="mt-5 font-display text-[40px] leading-[1] text-ink md:text-[52px]">
              Something for <span className="italic text-forest">every table</span>
            </h2>
          </div>
          <Link href="/menu" className="hidden text-[13px] font-medium text-ink-muted transition-colors hover:text-forest sm:inline-flex">
            Full menu →
          </Link>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border hairline bg-line sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((c, i) => (
            <Link
              key={c.id}
              href={`/menu?category=${c.slug}`}
              className="group relative block bg-paper p-8 transition-colors hover:bg-cream-deep"
            >
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-clay">№ {String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-6 font-display text-[26px] leading-tight text-ink transition-colors group-hover:text-forest">
                {c.name}
              </h3>
              {c.description ? (
                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">{c.description}</p>
              ) : null}
              <div className="mt-8 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-forest">
                <span>Browse</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Popular({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="flex items-end justify-between gap-6">
        <div>
          <Eyebrow>Kitchen favourites</Eyebrow>
          <h2 className="mt-5 font-display text-[40px] leading-[1] text-ink md:text-[52px]">
            What people <span className="italic text-clay">keep ordering</span>
          </h2>
        </div>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { n: "1", t: "Choose your spread", d: "Mix and match from our full menu. No minimum dish — just a £20 order total." },
    { n: "2", t: "Pick a slot", d: "Order at least 24 hours ahead. We'll confirm your window by email and text." },
    { n: "3", t: "We arrive", d: "A driver turns up within a 30-minute window, trays laid out, ready to serve." },
  ];
  return (
    <section className="border-y hairline bg-forest text-cream">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 md:grid-cols-[1fr_1.3fr] md:gap-24">
        <div>
          <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-butter">
            <span className="h-px w-8 bg-butter/60" />
            <span>How it works</span>
          </div>
          <h2 className="mt-6 font-display text-[40px] leading-[1] text-cream md:text-[56px]">
            Simple,
            <br />
            <span className="italic font-light text-butter">from tray to table</span>
          </h2>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-cream/70">
            Whether it's a ten-person boardroom lunch or a hundred-person wedding
            breakfast, the process is the same — straightforward, and on time.
          </p>
        </div>

        <ol className="space-y-px overflow-hidden rounded-lg bg-cream/10">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-8 bg-forest p-8">
              <div className="font-display text-[56px] italic font-light leading-none text-butter/80">
                {s.n}
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-display text-[24px] leading-tight text-cream">{s.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-cream/70">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28 text-center">
      <Eyebrow className="justify-center">Made on Tyneside</Eyebrow>
      <p className="mx-auto mt-8 max-w-3xl font-display text-[44px] leading-[1.05] text-ink md:text-[68px]">
        <span className="italic font-light text-forest">Proper</span> food,
        delivered <span className="italic font-light text-clay">properly</span>.
      </p>
      <div className="mt-10 flex justify-center gap-3">
        <Link
          href="/menu"
          className="inline-flex h-13 items-center rounded-full bg-forest px-8 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          Start your order
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-13 items-center rounded-full border hairline bg-paper px-8 text-[14px] font-medium text-ink transition-colors hover:border-ink/30"
        >
          Talk to our team
        </Link>
      </div>
    </section>
  );
}

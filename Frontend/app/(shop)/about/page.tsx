import Link from "next/link";
import { Eyebrow } from "@/components/shop/eyebrow";

export const metadata = { title: "About Dialawhip · Newcastle catering supplies" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1080px] px-6 py-20">
      <Eyebrow>About Dialawhip</Eyebrow>
      <h1 className="mt-6 font-display text-[56px] leading-[1] text-ink md:text-[88px]">
        Built in <span className="italic font-light text-forest">Newcastle</span>
        <br />
        for working kitchens.
      </h1>

      <div className="mt-14 grid gap-14 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6 text-[16px] leading-[1.8] text-ink-soft">
          <p>
            Dialawhip was started by a pastry chef and a logistics engineer
            who kept running out of chargers at 2am. The suppliers were
            closed. The big chains wouldn't ship until Thursday. So we
            built the thing we wished existed.
          </p>
          <p>
            We hold real stock in a unit off the Quayside — chargers, tanks,
            syrups, coffee, packaging — and we dispatch by motorbike and
            electric van across Tyneside. Eighteen minutes from bag to door
            is the median. Thirty is the worst we've done.
          </p>
          <p>
            We supply bars, cafés, restaurants, wedding caterers, film-set
            kitchens, and the occasional very-ambitious home cook.
            Everything we sell for culinary use is sold under a clear
            statement of use — because the law says so, and because that's
            how you stay open.
          </p>
        </div>

        <aside className="space-y-8">
          <Stat k="18 min" v="Median delivery time" />
          <Stat k="20 mi" v="Radius from NE1 5QQ" />
          <Stat k="100+" v="Catering accounts served" />
          <Stat k="24/7" v="Phone support line" />
        </aside>
      </div>

      <section className="mt-20 rounded-2xl border hairline bg-cream-deep/50 p-10 md:p-14">
        <Eyebrow>Visit us</Eyebrow>
        <h2 className="mt-6 font-display text-[32px] leading-tight text-ink md:text-[48px]">
          Grainger Market, Stall 42.
        </h2>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Our service window is open Tuesday to Sunday, 10:00–03:00. Closed
          Mondays. Drop in, pick up in person, or place an order at the
          counter.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center rounded-full bg-forest px-7 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep"
          >
            Shop now →
          </Link>
          <Link
            href="/trade"
            className="inline-flex h-12 items-center rounded-full border hairline bg-paper px-7 text-[14px] font-medium text-ink transition-colors hover:border-ink/30"
          >
            Open a trade account
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-display text-[48px] leading-none text-forest">{k}</div>
      <div className="mt-2 text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">{v}</div>
    </div>
  );
}

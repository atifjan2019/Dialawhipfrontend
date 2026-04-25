import Link from "next/link";
import { Eyebrow } from "@/components/shop/eyebrow";

export const metadata = { title: "Trade accounts · Dialawhip" };

export default function TradePage() {
  return (
    <div className="mx-auto max-w-[1080px] px-6 py-20">
      <Eyebrow>For businesses</Eyebrow>
      <h1 className="mt-6 font-display text-[56px] leading-[1] text-ink md:text-[88px]">
        Stock up like <span className="italic font-light text-forest">a pro</span>.
      </h1>
      <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
        A Dialawhip trade account gets your kitchen or bar discounted
        pricing, 30-day invoicing, priority dispatch, and a dedicated
        account manager. Free to open.
      </p>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border hairline bg-line md:grid-cols-2">
        <Benefit
          n="01"
          title="Bulk pricing"
          body="Up to 22% off list on chargers, tanks and disposables for accounts above £500/month."
        />
        <Benefit
          n="02"
          title="Monthly invoicing"
          body="We bill once a month against your approved credit line — no card charges on every order."
        />
        <Benefit
          n="03"
          title="Priority dispatch"
          body="Your orders jump the queue — average 12-minute delivery across the city core."
        />
        <Benefit
          n="04"
          title="Dedicated support"
          body="A named account manager, WhatsApp line, and a 24h SLA on any complaint."
        />
      </div>

      <section className="mt-16 rounded-2xl bg-forest p-10 text-cream md:p-14">
        <Eyebrow className="text-butter [&>span]:bg-butter/60">Open an account</Eyebrow>
        <h2 className="mt-6 font-display text-[36px] leading-tight md:text-[52px]">
          Ready when <span className="italic font-light text-butter">you are</span>.
        </h2>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-cream/80">
          We approve most accounts inside 24 hours. Send us your trading
          name, companies house number, VAT number (if any), and the
          category of products you'll stock.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="mailto:trade@dialawhip.com?subject=Trade%20account%20application"
            className="inline-flex h-12 items-center rounded-full bg-butter px-7 text-[14px] font-medium text-forest transition-colors hover:bg-butter/90"
          >
            Apply by email →
          </a>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center rounded-full border border-cream/20 bg-transparent px-7 text-[14px] font-medium text-cream transition-colors hover:bg-cream/5"
          >
            Talk to our team
          </Link>
        </div>
      </section>
    </div>
  );
}

function Benefit({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="bg-paper p-8">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-clay">№ {n}</div>
      <h3 className="mt-5 font-display text-[22px] leading-tight text-ink">{title}</h3>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}

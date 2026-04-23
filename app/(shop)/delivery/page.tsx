import Link from "next/link";
import { Eyebrow } from "@/components/shop/eyebrow";
import { PostcodeChecker } from "@/components/shop/postcode-checker";

export const metadata = { title: "Delivery · Dialawhip" };

const TIERS = [
  {
    name: "Standard",
    price: "Included",
    eta: "18–35 min",
    blurb: "Our default service across Tyneside. First-come-first-served dispatch.",
  },
  {
    name: "Priority",
    price: "+£5",
    eta: "10–20 min",
    blurb: "Jumps the dispatch queue. Recommended if service is mid-rush.",
  },
  {
    name: "Super-priority",
    price: "+£15",
    eta: "8–15 min",
    blurb: "Dedicated rider dispatched immediately. Genuine emergencies only.",
  },
];

const ZONES = [
  { prefix: "NE1–NE4", name: "City core, Shieldfield, Jesmond", eta: "18 min" },
  { prefix: "NE5–NE8", name: "West End, Walker, Gateshead", eta: "22 min" },
  { prefix: "NE9–NE13", name: "Low Fell, Team Valley, Longbenton", eta: "28 min" },
  { prefix: "NE15, NE20", name: "Denton, Ponteland", eta: "30 min" },
  { prefix: "NE25–NE30", name: "Whitley Bay, North Shields, Tynemouth", eta: "35 min" },
];

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-20">
      <div className="grid gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div>
          <Eyebrow>Delivery &amp; coverage</Eyebrow>
          <h1 className="mt-6 font-display text-[56px] leading-[1] text-ink md:text-[88px]">
            Fast, <span className="italic font-light text-forest">always</span>.
          </h1>
          <p className="mt-8 max-w-md text-[17px] leading-relaxed text-ink-soft">
            We hold stock in Newcastle and dispatch by motorbike and
            electric van. Median time bag-to-door: <strong>18 minutes</strong>.
          </p>
        </div>
        <div className="flex items-center">
          <div className="w-full"><PostcodeChecker /></div>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="font-display text-[32px] leading-tight text-ink md:text-[40px]">
          Three tiers, <span className="italic text-forest">every postcode</span>.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {TIERS.map((t) => (
            <div key={t.name} className="rounded-2xl border hairline bg-paper p-7">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-[22px] text-ink">{t.name}</h3>
                <span className="font-display text-[18px] text-clay">{t.price}</span>
              </div>
              <div className="mt-4 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                ETA · {t.eta}
              </div>
              <p className="mt-5 text-[14px] leading-relaxed text-ink-soft">{t.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-2xl border hairline bg-cream-deep/50 p-8 md:p-12">
        <h2 className="font-display text-[28px] leading-tight text-ink md:text-[36px]">
          Zones &amp; typical ETAs
        </h2>
        <div className="mt-8 overflow-hidden rounded-xl border hairline bg-paper">
          <table className="w-full text-[14px]">
            <thead className="bg-cream-deep text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              <tr>
                <th className="px-6 py-4 text-left">Postcode</th>
                <th className="px-6 py-4 text-left">Covering</th>
                <th className="px-6 py-4 text-right">Standard ETA</th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map((z) => (
                <tr key={z.prefix} className="border-t hairline">
                  <td className="px-6 py-4 font-display text-[15px] text-ink">{z.prefix}</td>
                  <td className="px-6 py-4 text-ink-soft">{z.name}</td>
                  <td className="px-6 py-4 text-right font-medium text-forest">{z.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-[13px] text-ink-muted">
          Outside our zone? We can courier next-day across the UK —
          <Link href="/contact" className="ml-1 text-forest underline underline-offset-4">get in touch</Link>.
        </p>
      </section>
    </div>
  );
}

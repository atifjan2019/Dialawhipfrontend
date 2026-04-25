import Link from "next/link";
import { Eyebrow } from "@/components/shop/eyebrow";

export default function NotFound() {
  return (
    <main className="relative isolate min-h-[85vh] overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(1200px 700px at 85% -10%, rgba(255, 218, 26, 0.15), transparent 60%), radial-gradient(900px 500px at -10% 110%, rgba(11, 29, 58, 0.08), transparent 60%)",
        }}
      />

      <div className="mx-auto grid min-h-[85vh] max-w-[1280px] grid-cols-1 items-center gap-16 px-6 py-20 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Eyebrow>Error 404</Eyebrow>
          <h1 className="mt-6 font-display text-[96px] leading-[0.9] tracking-[-0.02em] text-ink md:text-[168px]">
            This page
            <br />
            <span className="italic font-light text-forest">could not</span>
            <br />
            be found<span className="text-clay">.</span>
          </h1>
          <p className="mt-10 max-w-md text-[16px] leading-relaxed text-ink-soft">
            You might have followed a broken link, or the page you're after
            has moved. Either way — try one of these.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-13 items-center rounded-full bg-forest px-7 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep"
            >
              Home
              <span className="ml-2">→</span>
            </Link>
            <Link
              href="/shop"
              className="inline-flex h-13 items-center rounded-full border hairline bg-paper px-7 text-[14px] font-medium text-ink transition-colors hover:border-ink/30 hover:bg-cream-deep"
            >
              Browse the shop
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-13 items-center rounded-full border hairline bg-paper px-7 text-[14px] font-medium text-ink transition-colors hover:border-ink/30 hover:bg-cream-deep"
            >
              Get in touch
            </Link>
          </div>

          <div className="mt-14 grid max-w-md grid-cols-2 gap-6 border-t hairline pt-8 text-[13px]">
            <PopularLink href="/shop/cream-chargers">Cream chargers</PopularLink>
            <PopularLink href="/shop/smartwhip-tanks">Smartwhip tanks</PopularLink>
            <PopularLink href="/shop/monin-syrups">Monin syrups</PopularLink>
            <PopularLink href="/delivery">Delivery &amp; coverage</PopularLink>
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-sm md:block">
          <div className="absolute -top-5 -left-5 h-full w-full rotate-[-3deg] rounded-[22px] bg-clay/15" aria-hidden />
          <div className="relative overflow-hidden rounded-[22px] border hairline bg-paper shadow-[0_30px_60px_-30px_rgba(10,22,40,0.25)]">
            <div className="relative h-96 overflow-hidden bg-forest paper-grain">
              <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest-deep to-[#04101F]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-butter/80">Lost &amp; found</span>
                <p className="mt-6 font-display text-[140px] italic font-light leading-none text-butter">
                  404
                </p>
                <div className="mt-6 h-px w-12 bg-butter/50" />
                <p className="mt-4 max-w-[220px] text-[13px] leading-relaxed text-cream/70">
                  The tank may have already been delivered.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-cream-deep px-6 py-5">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">Status</div>
                <div className="font-display text-[18px] leading-none text-ink">Not found</div>
              </div>
              <Link
                href="/"
                className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-[12px] font-medium tracking-wide text-cream transition-colors hover:bg-ink-soft"
              >
                Take me home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function PopularLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between text-ink-muted transition-colors hover:text-forest"
    >
      <span>{children}</span>
      <span className="text-clay transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );
}

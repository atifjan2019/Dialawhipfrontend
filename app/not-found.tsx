import Link from "next/link";
import { Eyebrow } from "@/components/shop/eyebrow";

export default function NotFound() {
  return (
    <main className="relative isolate min-h-[85vh] overflow-hidden bg-paper">
      <div className="mx-auto grid min-h-[85vh] max-w-[1280px] grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-[1.2fr_1fr] md:gap-16">
        <div>
          <Eyebrow>Error 404</Eyebrow>
          <h1 className="mt-6 font-display text-[88px] font-bold leading-[0.92] tracking-[-0.02em] text-ink md:text-[156px]">
            Page not
            <br />
            <span className="text-brand">found.</span>
          </h1>
          <p className="mt-8 max-w-md text-[16px] font-medium leading-relaxed text-ink/80">
            You might have followed a broken link, or the page you&rsquo;re after has moved. Try one of these.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-13 items-center rounded-full bg-ink px-7 text-[14px] font-bold text-yellow transition-transform hover:-translate-y-0.5"
            >
              Home <span className="ml-2" aria-hidden>→</span>
            </Link>
            <Link
              href="/shop"
              className="inline-flex h-13 items-center rounded-full border-2 border-ink bg-paper px-7 text-[14px] font-bold text-ink transition-colors hover:bg-yellow"
            >
              Browse the shop
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-13 items-center rounded-full border-2 border-ink bg-paper px-7 text-[14px] font-bold text-ink transition-colors hover:bg-yellow"
            >
              Get in touch
            </Link>
          </div>

          <div className="mt-14 grid max-w-md grid-cols-2 gap-4 border-t-2 border-ink/10 pt-8 text-[13px]">
            <PopularLink href="/shop/cream-chargers">Cream chargers</PopularLink>
            <PopularLink href="/shop/smartwhip-tanks">Smartwhip tanks</PopularLink>
            <PopularLink href="/shop/monin-syrups">Monin syrups</PopularLink>
            <PopularLink href="/delivery">Delivery &amp; coverage</PopularLink>
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-sm md:block">
          <div className="overflow-hidden rounded-3xl bg-yellow ring-2 ring-ink">
            <div className="relative h-96 bg-ink p-8 text-paper">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-yellow">
                Lost &amp; found
              </div>
              <p className="mt-10 font-display text-[140px] font-bold leading-none text-yellow">
                404
              </p>
              <div className="mt-6 h-1 w-12 bg-yellow" />
              <p className="mt-5 max-w-[220px] text-[13px] font-medium leading-relaxed text-paper/75">
                The tank may have already been delivered.
              </p>
            </div>
            <div className="flex items-center justify-between bg-yellow px-6 py-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">Status</div>
                <div className="font-display text-[18px] font-bold leading-none text-ink">Not found</div>
              </div>
              <Link
                href="/"
                className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-[12px] font-bold text-yellow transition-colors hover:bg-brand hover:text-paper"
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
      className="group flex items-center justify-between font-medium text-ink-muted transition-colors hover:text-brand"
    >
      <span>{children}</span>
      <span className="text-brand transition-transform group-hover:translate-x-1" aria-hidden>→</span>
    </Link>
  );
}

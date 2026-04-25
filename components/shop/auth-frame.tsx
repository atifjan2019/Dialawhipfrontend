import Link from "next/link";

export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1280px] gap-12 px-6 py-16 md:grid-cols-[1fr_1fr] md:gap-20 md:py-24">
      <div className="flex items-center">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <div className="hidden md:block">
        <div className="relative h-full min-h-[560px] overflow-hidden rounded-3xl bg-yellow ring-2 ring-ink">
          {/* Diagonal black band */}
          <div
            className="absolute inset-x-0 bottom-0 h-3/5 bg-ink text-paper"
            style={{ clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)" }}
            aria-hidden
          />

          <div className="relative flex h-full flex-col justify-between p-10">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-display text-[26px] font-bold leading-none text-ink"
              >
                Dialawhip
              </Link>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink">
                Newcastle catering
              </div>
            </div>

            <div className="relative z-10 text-paper">
              <p className="font-display text-[40px] font-bold leading-[1.02] tracking-tight md:text-[44px]">
                Out of gas?
                <br />
                <span className="text-yellow">Not for long.</span>
              </p>
              <p className="mt-7 text-[12px] font-bold uppercase tracking-[0.22em] text-paper/60">
                Order before 03:00 · 20-min delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

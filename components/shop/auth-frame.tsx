export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1280px] gap-12 px-6 py-16 md:grid-cols-[1fr_1fr] md:gap-20 md:py-24">
      <div className="flex items-center">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <div className="hidden md:block">
        <div className="relative h-full min-h-[520px] overflow-hidden rounded-[22px] bg-forest paper-grain">
          <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest-deep to-[#0C1811]" />
          <div className="relative flex h-full flex-col justify-between p-10 text-cream">
            <div>
              <div className="font-display text-[28px] leading-none">Dialawhip</div>
              <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.22em] text-butter/80">
                Newcastle catering
              </div>
            </div>
            <div>
              <p className="font-display text-[42px] italic font-light leading-[1.1] text-cream">
                &ldquo;Proper food,
                <br />
                delivered
                <br />
                properly.&rdquo;
              </p>
              <p className="mt-8 text-[12px] font-medium uppercase tracking-[0.18em] text-butter/70">
                — Our kitchen, since 2019
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

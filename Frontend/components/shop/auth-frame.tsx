import { Logo } from "@/components/shop/logo";

export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1280px] gap-12 px-6 py-16 md:grid-cols-[1fr_1fr] md:gap-20 md:py-24">
      <div className="flex items-center">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <div className="hidden md:block">
        <div
          className="relative h-full min-h-[520px] overflow-hidden rounded-[22px] text-paper"
          style={{
            background:
              "radial-gradient(700px 400px at 90% 0%, #0a2a6b 0%, transparent 60%), linear-gradient(180deg, #04122e 0%, #061a3e 100%)",
          }}
        >
          <div className="relative flex h-full flex-col justify-between p-10">
            <div>
              <Logo tone="light" />
              <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-yellow">
                Newcastle catering
              </div>
            </div>
            <div>
              <p className="text-[36px] font-extrabold leading-[1.05] tracking-tight text-paper">
                &ldquo;Proper food,
                <br />
                delivered
                <br />
                <span className="text-yellow">properly.</span>&rdquo;
              </p>
              <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.18em] text-paper/55">
                — Our kitchen, since 2019
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

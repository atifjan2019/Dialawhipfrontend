import { Eyebrow } from "@/components/shop/eyebrow";

export function StaticShell({
  eyebrow,
  title,
  lead,
  updated,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[900px] px-6 py-20">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-6 font-display text-[48px] leading-[1.02] text-ink md:text-[72px]">{title}</h1>
      {lead ? (
        <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-soft">{lead}</p>
      ) : null}
      {updated ? (
        <p className="mt-4 text-[12px] uppercase tracking-[0.18em] text-ink-muted">
          Last updated: {updated}
        </p>
      ) : null}

      <div className="prose-dialawhip mt-12 space-y-8 text-[15px] leading-[1.75] text-ink-soft">
        {children}
      </div>
    </div>
  );
}

export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-display text-[26px] leading-tight text-ink">{children}</h2>
  );
}

export function Sub({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 font-display text-[18px] leading-tight text-ink">{children}</h3>
  );
}

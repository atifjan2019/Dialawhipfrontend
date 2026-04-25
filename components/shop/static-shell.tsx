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
    <div className="mx-auto max-w-[900px] px-6 py-16">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-3 text-[40px] font-extrabold tracking-tight text-ink sm:text-[56px]">{title}</h1>
      {lead ? (
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-soft">{lead}</p>
      ) : null}
      {updated ? (
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
          Last updated: {updated}
        </p>
      ) : null}

      <div className="prose-dialawhip mt-10 space-y-6 text-[15px] leading-[1.7] text-ink-soft">
        {children}
      </div>
    </div>
  );
}

export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 text-[22px] font-bold leading-tight text-ink">{children}</h2>
  );
}

export function Sub({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 text-[16px] font-bold leading-tight text-ink">{children}</h3>
  );
}

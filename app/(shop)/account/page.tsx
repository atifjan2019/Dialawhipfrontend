import Link from "next/link";
import { getCurrentUser } from "@/lib/api-server";
import { redirect } from "next/navigation";
import { Eyebrow } from "@/components/shop/eyebrow";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const firstName = user.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <Eyebrow>Your account</Eyebrow>
      <h1 className="mt-5 font-display text-[48px] leading-[1] text-ink md:text-[64px]">
        Welcome back, <span className="italic font-light text-forest">{firstName}</span>.
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        Track orders, manage your addresses, and reorder favourites — all here.
      </p>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        <Card href="/account/orders" label="01" title="My orders" body="See what's in motion and reorder the ones that got away." />
        <Card href="/account/addresses" label="02" title="Addresses" body="Save delivery addresses for a quicker checkout next time." />
        <Card href="/menu" label="03" title="Keep shopping" body="Browse the full menu and try something new this week." tone="forest" />
      </div>

      <div className="mt-12 rounded-lg border hairline bg-paper p-7">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Profile</div>
            <div className="mt-3 font-display text-[22px] leading-tight text-ink">{user.name}</div>
            <div className="mt-1 text-[14px] text-ink-muted">{user.email}</div>
            {user.phone ? <div className="text-[14px] text-ink-muted">{user.phone}</div> : null}
          </div>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest font-display text-[22px] text-cream">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ href, label, title, body, tone }: { href: string; label: string; title: string; body: string; tone?: "forest" }) {
  return (
    <Link
      href={href}
      className={
        tone === "forest"
          ? "group block rounded-lg bg-forest p-7 text-cream transition-colors hover:bg-forest-deep"
          : "group block rounded-lg border hairline bg-paper p-7 transition-all hover:border-ink/25 hover:-translate-y-0.5"
      }
    >
      <div className={tone === "forest" ? "font-display text-[13px] italic text-butter" : "font-display text-[13px] italic text-clay"}>
        № {label}
      </div>
      <h2 className="mt-4 font-display text-[24px] leading-tight">{title}</h2>
      <p className={tone === "forest" ? "mt-2 text-[13px] leading-relaxed text-cream/75" : "mt-2 text-[13px] leading-relaxed text-ink-muted"}>
        {body}
      </p>
      <div className={tone === "forest" ? "mt-6 text-[11px] font-medium uppercase tracking-[0.16em] text-butter" : "mt-6 text-[11px] font-medium uppercase tracking-[0.16em] text-forest"}>
        <span>Open</span>
        <span className="ml-1.5 inline-block transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}

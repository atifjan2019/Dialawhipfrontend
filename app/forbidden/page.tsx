import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="rounded-3xl bg-yellow p-12 ring-2 ring-ink">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand">403 · Forbidden</div>
        <h1 className="mt-5 font-display text-[44px] font-bold leading-[1] tracking-tight text-ink sm:text-[64px]">
          Access denied.
        </h1>
        <p className="mt-5 text-[15px] font-medium leading-relaxed text-ink/80">
          Your account does not have permission to view this page.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-13 items-center rounded-full bg-ink px-8 text-[14px] font-bold text-yellow transition-transform hover:-translate-y-0.5"
        >
          Return home →
        </Link>
      </div>
    </main>
  );
}

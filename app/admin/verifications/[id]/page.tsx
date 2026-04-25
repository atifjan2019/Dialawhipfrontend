import Link from "next/link";
import { notFound } from "next/navigation";
import { apiServer, ApiRequestError } from "@/lib/api-server";
import type { IdVerification } from "@/lib/types";
import { VerificationDecision } from "@/components/admin/verification-decision";

type Params = Promise<{ id: string }>;

export default async function AdminVerificationDetail({ params }: { params: Params }) {
  const { id } = await params;

  let data: IdVerification;
  try {
    const r = await apiServer<{ data: IdVerification }>(`/api/v1/admin/verifications/${id}`);
    data = r.data;
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 404) return notFound();
    throw e;
  }

  const downloadUrl = `/api/v1/admin/verifications/${data.id}/download`;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
      <Link
        href="/admin/verifications"
        className="text-[12px] font-bold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-brand"
      >
        ← All verifications
      </Link>

      <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
            Review ID submission
          </div>
          <h1 className="mt-3 font-display text-[36px] font-bold leading-tight tracking-tight text-ink sm:text-[48px]">
            {data.user?.name}
          </h1>
          <div className="mt-2 text-[13px] font-medium text-ink-muted">
            {data.user?.email}
            {data.user?.phone ? ` · ${data.user.phone}` : null}
          </div>
        </div>
        <StatusChip status={data.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl bg-paper p-6 ring-2 ring-ink/10">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[22px] font-bold text-ink">Document</h2>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand capitalize">
              {data.doc_type.replace(/_/g, " ")}
            </span>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl bg-yellow ring-2 ring-ink/15">
            <iframe
              src={downloadUrl}
              className="h-[380px] w-full sm:h-[480px] md:h-[560px]"
              title="ID document"
            />
          </div>

          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex h-11 items-center rounded-full border-2 border-ink bg-paper px-5 text-[12px] font-bold text-ink transition-colors hover:bg-yellow"
          >
            Open in new tab ↗
          </a>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl bg-paper p-6 ring-2 ring-ink/10 text-[13px]">
            <h3 className="font-display text-[18px] font-bold text-ink">Submission details</h3>
            <dl className="mt-4 space-y-3">
              <KV label="Submitted">{new Date(data.created_at).toLocaleString("en-GB")}</KV>
              <KV label="Document"><span className="capitalize">{data.doc_type.replace(/_/g, " ")}</span></KV>
              <KV label="Status"><span className="capitalize">{data.status}</span></KV>
              {data.reviewed_at ? (
                <KV label="Reviewed">{new Date(data.reviewed_at).toLocaleString("en-GB")}</KV>
              ) : null}
              {data.reviewer ? <KV label="Reviewer">{data.reviewer.name}</KV> : null}
              {data.expires_at ? (
                <KV label="Expires">{new Date(data.expires_at).toLocaleDateString("en-GB")}</KV>
              ) : null}
              {data.rejection_reason ? (
                <KV label="Reason"><span className="text-danger">{data.rejection_reason}</span></KV>
              ) : null}
            </dl>
          </div>

          <VerificationDecision
            id={data.id}
            status={data.status}
            currentExpiry={data.expires_at ?? null}
          />
        </aside>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: "pending" | "approved" | "rejected" | "expired" }) {
  const map = {
    pending: "bg-yellow text-ink ring-2 ring-ink",
    approved: "bg-ink text-yellow",
    rejected: "bg-danger text-paper",
    expired: "bg-stone-soft text-ink-muted ring-2 ring-ink/20",
  } as const;
  return (
    <span
      className={`inline-flex h-9 items-center rounded-full px-4 text-[11px] font-bold uppercase tracking-[0.16em] ${map[status]}`}
    >
      {status}
    </span>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">{label}</dt>
      <dd className="text-right font-bold text-ink">{children}</dd>
    </div>
  );
}

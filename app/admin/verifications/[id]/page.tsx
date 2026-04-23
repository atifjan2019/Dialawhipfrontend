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

  const downloadUrl = `/api/proxy/v1/admin/verifications/${data.id}/download`;
  const isPending = data.status === "pending";

  return (
    <div className="px-10 py-10">
      <nav className="text-[12px] text-ink-muted">
        <Link href="/admin/verifications" className="transition-colors hover:text-forest">
          ← All verifications
        </Link>
      </nav>

      <div className="mt-6 flex items-start justify-between gap-6">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Review ID submission
          </div>
          <h1 className="mt-2 font-display text-[36px] leading-tight text-ink">
            {data.user?.name}
          </h1>
          <div className="mt-1 text-[13px] text-ink-muted">
            {data.user?.email}
            {data.user?.phone ? ` · ${data.user.phone}` : null}
          </div>
        </div>
        <StatusChip status={data.status} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border hairline bg-paper p-6">
          <h2 className="font-display text-[20px] text-ink">Document</h2>
          <div className="mt-2 text-[12px] uppercase tracking-[0.14em] text-ink-muted">
            {data.doc_type.replace(/_/g, " ")}
          </div>

          <div className="mt-5 overflow-hidden rounded-lg border hairline bg-cream-deep/40">
            <iframe
              src={downloadUrl}
              className="h-[560px] w-full"
              title="ID document"
            />
          </div>

          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex h-10 items-center rounded-full border hairline bg-paper px-5 text-[12px] font-medium text-ink-soft transition-colors hover:border-forest hover:text-forest"
          >
            Open in new tab ↗
          </a>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border hairline bg-paper p-6 text-[13px]">
            <h3 className="font-display text-[18px] text-ink">Submission details</h3>
            <dl className="mt-4 space-y-2.5">
              <KV label="Submitted">{new Date(data.created_at).toLocaleString("en-GB")}</KV>
              <KV label="Document">{data.doc_type.replace(/_/g, " ")}</KV>
              <KV label="Status">{data.status}</KV>
              {data.reviewed_at ? (
                <KV label="Reviewed">{new Date(data.reviewed_at).toLocaleString("en-GB")}</KV>
              ) : null}
              {data.reviewer ? <KV label="Reviewer">{data.reviewer.name}</KV> : null}
              {data.expires_at ? <KV label="Expires">{new Date(data.expires_at).toLocaleDateString("en-GB")}</KV> : null}
              {data.rejection_reason ? <KV label="Reason">{data.rejection_reason}</KV> : null}
            </dl>
          </div>

          {isPending ? (
            <VerificationDecision id={data.id} />
          ) : (
            <div className="rounded-xl border hairline bg-cream-deep/40 p-6 text-[13px] text-ink-muted">
              This submission has already been {data.status}.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: "pending" | "approved" | "rejected" }) {
  const map = {
    pending: "bg-butter text-forest",
    approved: "bg-forest text-butter",
    rejected: "bg-[#8B2A1D] text-cream",
  } as const;
  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${map[status]}`}>
      {status}
    </span>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right text-ink capitalize">{children}</dd>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/shop/eyebrow";
import { Label } from "@/components/ui/input";
import type { IdVerification, VerificationStatus, DocType } from "@/lib/types";

type ApiIndex = {
  data: IdVerification[];
  user_status: VerificationStatus;
  verified_at: string | null;
};

const DOC_OPTIONS: { value: DocType; label: string }[] = [
  { value: "driving_licence", label: "Driving licence" },
  { value: "passport", label: "Passport" },
  { value: "residency_card", label: "Biometric residency card" },
  { value: "citizen_card", label: "CitizenCard" },
  { value: "military_id", label: "Military ID" },
];

export default function VerificationPage() {
  const [data, setData] = useState<ApiIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState<DocType>("driving_licence");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/v1/me/verifications", { credentials: "same-origin" });
      if (res.status === 401) {
        window.location.href = "/login?next=/account/verification";
        return;
      }
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("doc_type", docType);
      fd.append("file", file);
      const res = await fetch("/api/v1/me/verifications", {
        method: "POST",
        body: fd,
        credentials: "same-origin",
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(b.message || `Upload failed (${res.status}).`);
        return;
      }
      setFile(null);
      await load();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-[900px] px-6 py-20 text-center text-ink-muted">Loading…</div>;
  }

  const status = data?.user_status ?? "unverified";

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-14">
      <nav className="flex items-center gap-3 text-[12px] text-ink-muted">
        <Link href="/account" className="transition-colors hover:text-forest">Account</Link>
        <span className="opacity-50">/</span>
        <span className="text-ink">ID &amp; verification</span>
      </nav>

      <Eyebrow className="mt-8">Compliance · 18+</Eyebrow>
      <h1 className="mt-6 font-display text-[48px] leading-[1] text-ink md:text-[72px]">
        ID <span className="italic font-light text-forest">verification</span>.
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        Upload one government-issued photo ID. We verify once and never ask again
        (unless your document expires). Usually approved inside ten minutes during
        operating hours.
      </p>

      <StatusBanner status={status} verifiedAt={data?.verified_at ?? null} />

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        {status !== "verified" && status !== "pending" ? (
          <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border hairline bg-paper p-8">
            <div>
              <h2 className="font-display text-[24px] text-ink">Upload your ID</h2>
              <p className="mt-2 text-[13px] text-ink-muted">
                Clear photo or scan. All four corners must be visible. No glare.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Document type</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {DOC_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-[13px] transition-all ${
                      docType === opt.value
                        ? "border-forest bg-cream-deep/50 text-ink"
                        : "hairline bg-paper text-ink-soft hover:border-ink/25"
                    }`}
                  >
                    <input
                      type="radio"
                      name="doc_type"
                      value={opt.value}
                      checked={docType === opt.value}
                      onChange={() => setDocType(opt.value)}
                      className="accent-forest"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id-file">File (JPG, PNG, WebP or PDF · max 8MB)</Label>
              <div className="relative rounded-lg border border-dashed hairline bg-cream-deep/30 p-6 text-center">
                <input
                  id="id-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                {file ? (
                  <div>
                    <p className="font-display text-[17px] text-ink">{file.name}</p>
                    <p className="mt-1 text-[11px] text-ink-muted">{(file.size / 1024).toFixed(0)} KB · click to change</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-display text-[17px] text-ink">Click to choose a file</p>
                    <p className="mt-1 text-[11px] text-ink-muted">or drag and drop</p>
                  </div>
                )}
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-[#C87863]/40 bg-[#F3D4CC]/60 p-4 text-[13px] text-[#8B2A1D]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!file || uploading}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-forest px-6 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Submit for review →"}
            </button>
            <p className="text-[11px] text-ink-muted">
              Your document is encrypted at rest and accessible only to our compliance team.
            </p>
          </form>
        ) : (
          <div className="space-y-5 rounded-2xl border hairline bg-paper p-8">
            <h2 className="font-display text-[24px] text-ink">
              {status === "verified" ? "All set." : "Under review."}
            </h2>
            <p className="text-[14px] leading-relaxed text-ink-soft">
              {status === "verified"
                ? "Your ID has been verified. You can order age-restricted items without further checks."
                : "Thanks — a compliance reviewer is looking at your document. Usually inside ten minutes during operating hours."}
            </p>
            <Link
              href="/shop"
              className="inline-flex h-12 items-center rounded-full bg-forest px-7 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep"
            >
              Continue shopping →
            </Link>
          </div>
        )}

        <aside className="space-y-6">
          <div className="rounded-2xl border hairline bg-cream-deep/50 p-7">
            <h3 className="font-display text-[17px] text-ink">How it works</h3>
            <ol className="mt-4 space-y-3 text-[13px] text-ink-soft">
              <Step n="1">Pick a government-issued ID you own.</Step>
              <Step n="2">Upload a clear photo or scan.</Step>
              <Step n="3">Our team reviews inside ten minutes during operating hours.</Step>
              <Step n="4">Once approved, order age-restricted items with no further checks.</Step>
            </ol>
          </div>

          <div className="rounded-2xl border hairline bg-paper p-7">
            <h3 className="font-display text-[17px] text-ink">Your history</h3>
            {data && data.data.length > 0 ? (
              <ul className="mt-4 space-y-3 text-[13px]">
                {data.data.map((v) => (
                  <li key={v.id} className="flex items-baseline justify-between gap-4 border-b hairline pb-3 last:border-0 last:pb-0">
                    <div>
                      <div className="font-display text-[14px] text-ink">{v.doc_type.replace(/_/g, " ")}</div>
                      <div className="text-[11px] text-ink-muted">{new Date(v.created_at).toLocaleString("en-GB")}</div>
                      {v.rejection_reason ? (
                        <div className="mt-1 text-[11px] text-[#8B2A1D]">Reason: {v.rejection_reason}</div>
                      ) : null}
                    </div>
                    <StatusPill status={v.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[13px] text-ink-muted">No uploads yet.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatusBanner({ status, verifiedAt }: { status: VerificationStatus; verifiedAt: string | null }) {
  if (status === "verified") {
    return (
      <div className="mt-8 flex items-center gap-4 rounded-xl bg-forest px-5 py-4 text-cream">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-butter font-display text-[14px] font-semibold text-forest">✓</span>
        <div>
          <div className="text-[14px] font-medium">Account verified</div>
          <div className="text-[12px] text-butter">
            Approved {verifiedAt ? new Date(verifiedAt).toLocaleDateString("en-GB") : "—"} · valid for 2 years
          </div>
        </div>
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className="mt-8 rounded-xl border border-clay/40 bg-butter/20 px-5 py-4">
        <div className="text-[14px] font-medium text-ink">Under review</div>
        <div className="mt-1 text-[12px] text-ink-muted">Our compliance team is reviewing your upload. Usually ready in ten minutes.</div>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="mt-8 rounded-xl border border-[#C87863]/40 bg-[#F3D4CC]/40 px-5 py-4">
        <div className="text-[14px] font-medium text-[#8B2A1D]">Last upload was rejected</div>
        <div className="mt-1 text-[12px] text-ink-muted">See reason below and try again with a clearer image.</div>
      </div>
    );
  }
  return (
    <div className="mt-8 rounded-xl border hairline bg-cream-deep/40 px-5 py-4">
      <div className="text-[14px] font-medium text-ink">Not yet verified</div>
      <div className="mt-1 text-[12px] text-ink-muted">Upload an ID below to unlock age-restricted products.</div>
    </div>
  );
}

function StatusPill({ status }: { status: "pending" | "approved" | "rejected" }) {
  const map = {
    pending: "bg-butter/80 text-forest",
    approved: "bg-forest text-butter",
    rejected: "bg-[#8B2A1D]/10 text-[#8B2A1D]",
  } as const;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${map[status]}`}>
      {status}
    </span>
  );
}

function Step({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest font-display text-[11px] text-butter">{n}</span>
      <span>{children}</span>
    </li>
  );
}

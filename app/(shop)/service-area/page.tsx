"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { apiClient, ApiRequestError } from "@/lib/api-client";
import { Eyebrow } from "@/components/shop/eyebrow";

interface CheckResult {
  in_area: boolean;
  postcode_prefix?: string;
  delivery_fee_pence?: number;
  lead_time_hours?: number;
}

const ZONES = ["NE1", "NE2", "NE3", "NE4", "NE5", "NE6", "NE7", "NE8"];

export default function ServiceAreaPage() {
  const [postcode, setPostcode] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiClient<{ data: CheckResult }>("/api/v1/service-areas/check", {
        query: { postcode },
      });
      setResult(res.data);
    } catch (e: unknown) {
      if (e instanceof ApiRequestError) setError(e.body.message);
      else setError("Unable to check.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-14 md:grid-cols-[1fr_1fr] md:items-start">
        <div>
          <Eyebrow>Delivery</Eyebrow>
          <h1 className="mt-5 font-display text-[48px] leading-[1] text-ink md:text-[64px]">
            Do we reach
            <br />
            <span className="italic font-light text-forest">your street?</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">
            We cover most of Newcastle upon Tyne — from the Quayside and Jesmond to Heaton,
            Gosforth, and out to the west. Pop in your postcode to check.
          </p>

          <form onSubmit={check} className="mt-10 flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="sr-only">Postcode</Label>
              <Input placeholder="NE1 4AB" value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())} required />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 items-center rounded-full bg-forest px-7 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
            >
              {pending ? "Checking…" : "Check"}
            </button>
          </form>

          {result ? (
            result.in_area ? (
              <div className="mt-8 rounded-lg border border-forest/30 bg-[#DCE6DB] p-6">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-forest">Yes — we're on our way</div>
                <div className="mt-3 font-display text-[26px] text-forest-deep">
                  Delivering to <span className="italic">{result.postcode_prefix}</span>
                </div>
                <div className="mt-4 flex gap-8 text-[13px] text-ink-soft">
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">Fee</div>
                    <div className="mt-1 font-display text-[17px] text-ink">
                      <Money pence={result.delivery_fee_pence ?? 0} />
                    </div>
                  </div>
                  {result.lead_time_hours ? (
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">Lead time</div>
                      <div className="mt-1 font-display text-[17px] text-ink">{result.lead_time_hours} hours</div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-lg border border-[#C87863]/40 bg-[#F3D4CC]/60 p-6">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8B2A1D]">Not quite yet</div>
                <div className="mt-3 font-display text-[24px] text-[#6B2A1D]">
                  Sorry — that postcode's outside our patch.
                </div>
                <p className="mt-3 text-[13px] text-ink-soft">
                  Drop us a line at{" "}
                  <a href="mailto:hello@dialawhip.test" className="font-medium text-forest underline underline-offset-4">
                    hello@dialawhip.test
                  </a>{" "}
                  and we'll let you know when we expand.
                </p>
              </div>
            )
          ) : null}
          {error ? <p className="mt-6 text-[13px] text-[#8B2A1D]">{error}</p> : null}
        </div>

        <div className="relative hidden md:block">
          <div className="rounded-[22px] border hairline bg-forest p-10 text-cream paper-grain">
            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-butter/80">
              Zones we cover
            </div>
            <div className="mt-8 grid grid-cols-4 gap-3">
              {ZONES.map((z) => (
                <div
                  key={z}
                  className="flex h-16 items-center justify-center rounded-md bg-cream/10 font-display text-[17px] text-cream"
                >
                  {z}
                </div>
              ))}
            </div>
            <div className="mt-10 border-t border-cream/10 pt-6 text-[13px] leading-relaxed text-cream/70">
              Outside these zones? We take bookings for special events further afield —
              ask us about corporate, weddings, and private parties.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

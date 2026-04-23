"use client";

import { useState } from "react";

type Result =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "covered"; eta: string; postcode: string }
  | { state: "outside"; postcode: string }
  | { state: "invalid" };

const COVERED_PREFIXES = ["NE1", "NE2", "NE3", "NE4", "NE5", "NE6", "NE7", "NE8", "NE9", "NE10", "NE11", "NE12", "NE13", "NE15", "NE16", "NE20", "NE25", "NE26", "NE27", "NE28", "NE29", "NE30"];

const UK_POSTCODE = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;

export function PostcodeChecker() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Result>({ state: "idle" });

  function onCheck(e: React.FormEvent) {
    e.preventDefault();
    const normalised = value.trim().toUpperCase().replace(/\s+/g, "");
    if (!UK_POSTCODE.test(normalised)) {
      setResult({ state: "invalid" });
      return;
    }
    const formatted = `${normalised.slice(0, -3)} ${normalised.slice(-3)}`;
    setResult({ state: "checking" });
    setTimeout(() => {
      const prefix = normalised.match(/^[A-Z]{1,2}\d{1,2}/)?.[0] ?? "";
      if (COVERED_PREFIXES.includes(prefix)) {
        const eta = prefix === "NE1" || prefix === "NE2" || prefix === "NE4" ? "18 min" : prefix.startsWith("NE2") ? "32 min" : "24 min";
        setResult({ state: "covered", eta, postcode: formatted });
      } else {
        setResult({ state: "outside", postcode: formatted });
      }
    }, 400);
  }

  return (
    <div className="rounded-2xl border hairline bg-paper p-5 shadow-[0_20px_50px_-30px_rgba(10,22,40,0.25)]">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-clay">
        <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-clay" />
        <span>Live delivery check</span>
      </div>
      <h2 className="mt-3 font-display text-[24px] leading-tight text-ink">
        Can we reach you in <span className="italic text-forest">20 minutes?</span>
      </h2>
      <form onSubmit={onCheck} className="mt-5 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. NE1 5QQ"
          aria-label="Postcode"
          className="h-12 flex-1 rounded-full border hairline bg-cream px-5 text-[14px] text-ink placeholder:text-ink-muted/60 focus:border-forest focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex h-12 items-center rounded-full bg-forest px-6 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          Check →
        </button>
      </form>

      <div className="mt-4 min-h-[56px]">
        {result.state === "idle" && (
          <p className="text-[12px] text-ink-muted">
            Covering Newcastle, Gateshead, North & South Tyneside. Enter your postcode for a live ETA.
          </p>
        )}
        {result.state === "checking" && (
          <p className="text-[12px] text-ink-muted">Checking coverage…</p>
        )}
        {result.state === "invalid" && (
          <p className="text-[12px] text-red-700">That doesn't look like a UK postcode. Try "NE1 5QQ".</p>
        )}
        {result.state === "covered" && (
          <div className="flex items-center gap-3 rounded-xl bg-forest px-4 py-3 text-cream">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-butter font-display text-[13px] font-semibold text-forest">✓</span>
            <div className="flex-1">
              <div className="text-[13px] font-medium">{result.postcode} — in zone</div>
              <div className="text-[11px] text-butter">Average delivery: <strong className="text-cream">{result.eta}</strong></div>
            </div>
          </div>
        )}
        {result.state === "outside" && (
          <div className="rounded-xl bg-cream-deep px-4 py-3">
            <div className="text-[13px] font-medium text-ink">{result.postcode} is outside our zone</div>
            <div className="mt-1 text-[11px] text-ink-muted">Leave your number and we'll call when we expand — or order online for next-day courier.</div>
          </div>
        )}
      </div>
    </div>
  );
}

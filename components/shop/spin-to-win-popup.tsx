"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

const HIDE_UNTIL_KEY = "dw_spin_popup_hide_until";
const HIDE_FOR_MS = 24 * 60 * 60 * 1000;

const PRIZES = [
  "10% Off",
  "15% Off",
  "Free Shipping",
  "10% Off",
  "15% Off",
  "Free Shipping",
] as const;

function getHideUntil() {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(HIDE_UNTIL_KEY);
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

function setHideUntil(timestamp: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HIDE_UNTIL_KEY, String(timestamp));
}

export function SpinToWinPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const segment = useMemo(() => 360 / PRIZES.length, []);

  useEffect(() => {
    const hideUntil = getHideUntil();
    if (hideUntil > Date.now()) return;

    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  function closePopup() {
    setOpen(false);
    setHideUntil(Date.now() + HIDE_FOR_MS);
  }

  function onSpin() {
    setError(null);
    setResult(null);

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    if (spinning) return;

    const winnerIndex = Math.floor(Math.random() * PRIZES.length);
    const target = 360 - (winnerIndex * segment + segment / 2);
    const travel = 360 * 6 + target;

    setSpinning(true);
    setAngle((prev) => prev + travel);

    window.setTimeout(() => {
      setSpinning(false);
      setResult(PRIZES[winnerIndex]);
      setHideUntil(Date.now() + HIDE_FOR_MS);
    }, 4200);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-ink/60 p-3 backdrop-blur-[2px] sm:p-4">
      <div className="relative w-[min(92vw,560px)] max-h-[92vh] overflow-y-auto rounded-[10px] border-2 border-ink bg-paper p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-5">
        <button
          type="button"
          onClick={closePopup}
          className="absolute right-2.5 top-2.5 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-brand text-paper shadow-md transition-colors hover:bg-forest-deep sm:right-3 sm:top-3 sm:h-10 sm:w-10"
          aria-label="Close spin to win popup"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <div className="mx-auto mt-1 w-full">
          <div className="relative mx-auto aspect-square w-full max-w-[min(82vw,420px)]">
            <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
              <div className="h-0 w-0 border-l-[11px] border-r-[11px] border-t-[19px] border-l-transparent border-r-transparent border-t-ink sm:border-l-[14px] sm:border-r-[14px] sm:border-t-[24px]" />
            </div>

            <div
              className="relative h-full w-full rounded-full border-[10px] border-ink bg-yellow shadow-inner transition-transform duration-[4200ms] ease-[cubic-bezier(0.15,0.9,0.2,1)] sm:border-[12px]"
              style={{
                transform: `rotate(${angle}deg)`,
                backgroundImage:
                  "conic-gradient(#004fb0 0deg 60deg, #f5eb12 60deg 120deg, #004fb0 120deg 180deg, #f5eb12 180deg 240deg, #004fb0 240deg 300deg, #f5eb12 300deg 360deg)",
              }}
            >
              {PRIZES.map((prize, i) => {
                const a = i * segment + segment / 2;
                return (
                  <div
                    key={`${prize}-${i}`}
                    className="pointer-events-none absolute left-1/2 top-1/2"
                    style={{ transform: `translate(-50%, -50%) rotate(${a}deg) translateY(clamp(-132px, -24vw, -94px))` }}
                  >
                    <span
                      className="block whitespace-nowrap text-[11px] font-extrabold drop-shadow-[0_1px_0_rgba(0,0,0,0.25)] sm:text-[14px]"
                      style={{
                        transform: `rotate(${-a}deg)`,
                        color: i % 2 === 0 ? "#FFFFFF" : "#000000",
                      }}
                    >
                      {prize}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="absolute left-1/2 top-1/2 z-20 h-[50px] w-[50px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-paper shadow-[0_8px_20px_rgba(0,0,0,0.25)] sm:h-[66px] sm:w-[66px]" />
          </div>

          <div className="mx-auto mt-4 max-w-[600px] text-center">
            <h2 className="text-[34px] font-extrabold leading-none text-brand sm:text-[42px]">Spin to win!</h2>
            <p className="mx-auto mt-3 max-w-[560px] text-[16px] font-medium leading-[1.35] text-ink-soft sm:text-[18px]">
              Enter your email for a chance to win discounts, freebies, and more!
            </p>

            <div className="mx-auto mt-4 grid max-w-[600px] gap-2.5 sm:gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-12 rounded-[10px] border-2 border-ink/40 bg-paper px-4 text-[16px] font-medium text-ink-soft outline-none placeholder:text-ink-muted/70 focus:border-brand sm:h-14 sm:px-5 sm:text-[18px]"
              />
              <button
                type="button"
                onClick={onSpin}
                disabled={spinning}
                className="h-12 rounded-[10px] border-2 border-ink bg-brand px-4 text-[18px] font-bold text-paper transition-colors hover:bg-forest-deep disabled:opacity-60 sm:h-14 sm:text-[21px]"
              >
                {spinning ? "Spinning..." : "Spin the wheel!"}
              </button>
            </div>

            {error ? <p className="mt-3 text-[16px] font-semibold text-danger">{error}</p> : null}
            {result ? (
              <p className="mt-3 text-[20px] font-bold text-brand">
                You won: {result}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

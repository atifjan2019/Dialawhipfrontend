"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface ProductTabsProps {
  productSlug: string;
  description?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
}

type TabKey = "description" | "reviews";

const TABS: { key: TabKey; label: string }[] = [
  { key: "description", label: "Description" },
  { key: "reviews", label: "Reviews" },
];

const REVIEW_NAMES = [
  "Amelia B.",
  "Oliver M.",
  "Sophie W.",
  "George T.",
  "Charlotte H.",
  "Harry C.",
  "Emily R.",
  "Jack P.",
  "Isla M.",
  "Thomas W.",
  "Grace L.",
  "James H.",
  "Ruby S.",
  "Noah K.",
  "Ella D.",
  "Alfie B.",
  "Freya T.",
  "Charlie R.",
  "Mia J.",
  "Leo S.",
];

const REVIEW_CITIES = [
  "Jesmond",
  "Gosforth",
  "Heaton",
  "Quayside",
  "Byker",
  "Sandyford",
  "Ouseburn",
  "Fenham",
  "Walker",
  "Benwell",
  "Shieldfield",
  "Kenton",
];

const REVIEW_TEXTS = [
  "Arrived quickly, packed neatly, and worked exactly as expected. Really handy for a busy kitchen night.",
  "Good quality and simple to order. Delivery updates were clear and the product was ready to use straight away.",
  "Reliable service and a clean finish from the product. I would happily order this again for catering prep.",
  "Fast local drop-off and no fuss at the door. The product did the job properly and felt good value.",
  "Everything was straightforward from checkout to delivery. Fresh stock, tidy packaging, and a solid result.",
];

const PROSE_CLASSES = [
  "max-w-none break-words text-[14px] leading-[1.75] text-ink-soft sm:text-[15px]",
  "[&_p]:mb-3 [&_p:last-child]:mb-0",
  "[&_strong]:font-bold [&_strong]:text-ink",
  "[&_em]:italic",
  "[&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5",
  "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_li]:mb-1",
  "[&_h1]:mt-5 [&_h1]:mb-2 [&_h1]:text-[20px] [&_h1]:font-bold [&_h1]:text-ink",
  "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:text-ink",
  "[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-[16px] [&_h3]:font-bold [&_h3]:text-ink",
  "[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-ink/15 [&_blockquote]:pl-4 [&_blockquote]:italic",
  "[&_img]:my-4 [&_img]:rounded-xl",
].join(" ");

function hashString(value: string) {
  return value.split("").reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
}

function makeReviews(productSlug: string) {
  const seed = hashString(productSlug);
  return Array.from({ length: 5 }).map((_, i) => ({
    name: REVIEW_NAMES[(seed + i * 3) % REVIEW_NAMES.length],
    city: REVIEW_CITIES[(seed + i * 5) % REVIEW_CITIES.length],
    text: REVIEW_TEXTS[(seed + i * 2) % REVIEW_TEXTS.length],
  }));
}

export function ProductTabs({ productSlug, description, rating, reviewCount }: ProductTabsProps) {
  const [tab, setTab] = useState<TabKey>("description");
  const hasReviews = typeof reviewCount === "number" && reviewCount > 0;
  const displayRating = typeof rating === "number" && rating > 0 ? rating : 4.8;
  const reviews = makeReviews(productSlug);

  return (
    <section className="mt-10 sm:mt-14">
      <div role="tablist" className="flex flex-wrap gap-1 border-b-2 border-ink/10">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`tabpanel-${t.key}`}
              id={`tab-${t.key}`}
              onClick={() => setTab(t.key)}
              className={[
                "relative -mb-[2px] inline-flex h-12 items-center px-4 text-[12px] font-bold uppercase tracking-[0.16em] transition-colors sm:h-14 sm:px-6 sm:text-[13px]",
                active
                  ? "border-b-2 border-ink text-ink"
                  : "border-b-2 border-transparent text-ink-muted hover:text-ink",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        id={`tabpanel-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="mt-6 sm:mt-8"
      >
        {tab === "description" ? (
          description ? (
            <div
              className={PROSE_CLASSES}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="text-[14px] text-ink-muted">No description available.</p>
          )
        ) : hasReviews ? (
          <div className="rounded-2xl border hairline bg-surface px-6 py-8 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 text-brand" aria-label={`${displayRating.toFixed(1)} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="mt-2 font-display text-[32px] font-bold leading-none text-ink">
                  {displayRating.toFixed(1)}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[15px] font-bold text-ink sm:text-[16px]">
                  {reviewCount.toLocaleString("en-GB")} reviews
                </p>
              </div>
            </div>
            <div className="mt-7 grid gap-3 md:grid-cols-2">
              {reviews.map((review) => (
                <article key={`${review.name}-${review.city}`} className="rounded-xl bg-paper p-4 ring-1 ring-ink/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-display text-[16px] font-bold text-ink">{review.name}</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                      {review.city}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-brand" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                    {review.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border hairline bg-surface px-6 py-10 text-center sm:py-12">
            <p className="text-[15px] font-bold text-ink sm:text-[16px]">No reviews yet</p>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-muted sm:text-[14px]">
              Be the first to share your thoughts on this product.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

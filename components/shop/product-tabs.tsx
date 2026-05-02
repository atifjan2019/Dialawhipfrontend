"use client";

import { useState } from "react";

interface ProductTabsProps {
  description?: string | null;
}

type TabKey = "description" | "reviews";

const TABS: { key: TabKey; label: string }[] = [
  { key: "description", label: "Description" },
  { key: "reviews", label: "Reviews" },
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

export function ProductTabs({ description }: ProductTabsProps) {
  const [tab, setTab] = useState<TabKey>("description");

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

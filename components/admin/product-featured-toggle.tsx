"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export function ProductFeaturedToggle({
  productId,
  isFeatured,
}: {
  productId: string;
  isFeatured: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggleFeatured() {
    setPending(true);
    try {
      await apiClient(`/api/v1/admin/products/${productId}/featured`, {
        method: "PATCH",
        json: { is_featured: !isFeatured },
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFeatured}
      disabled={pending}
      aria-pressed={isFeatured}
      className={
        isFeatured
          ? "inline-flex h-7 items-center gap-1.5 rounded-full bg-brand px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-paper transition-colors hover:bg-brand-deep disabled:opacity-50"
          : "inline-flex h-7 items-center gap-1.5 rounded-full bg-stone-soft px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted transition-colors hover:bg-yellow hover:text-ink disabled:opacity-50"
      }
    >
      <Star className={isFeatured ? "h-3 w-3 fill-current" : "h-3 w-3"} />
      {pending ? "Saving" : isFeatured ? "Featured" : "Set hero"}
    </button>
  );
}

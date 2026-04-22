"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiClient, ApiRequestError, randomIdempotencyKey } from "@/lib/api-client";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import type { Category, Product } from "@/lib/types";

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category_id: product?.category_id ?? categories[0]?.id ?? "",
    description: product?.description ?? "",
    price_pence: product ? String(product.price_pence) : "",
    is_active: product?.is_active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setPending(true);
    try {
      const body = { ...form, price_pence: Number(form.price_pence) };
      if (product) {
        await apiClient(`/api/v1/admin/products/${product.id}`, {
          method: "PATCH",
          json: body,
          idempotencyKey: randomIdempotencyKey(),
        });
      } else {
        await apiClient("/api/v1/admin/products", {
          method: "POST",
          json: body,
          idempotencyKey: randomIdempotencyKey(),
        });
      }
      router.push("/admin/products");
      router.refresh();
    } catch (e: unknown) {
      if (e instanceof ApiRequestError) setErrors(e.body.errors ?? { name: [e.body.message] });
    } finally {
      setPending(false);
    }
  }

  async function onDelete() {
    if (!product || !confirm("Delete this product?")) return;
    await apiClient(`/api/v1/admin/products/${product.id}`, { method: "DELETE" });
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <FieldError>{errors.name?.[0]}</FieldError>
        </div>
        <div className="space-y-1.5">
          <Label>Slug</Label>
          <Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <FieldError>{errors.slug?.[0]}</FieldError>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="h-11 w-full rounded-md border border-ink/15 bg-paper px-3.5 text-[13px] text-ink focus:border-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20"
          >
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Price (pence)</Label>
          <Input type="number" min="0" step="1" required value={form.price_pence} onChange={(e) => setForm({ ...form, price_pence: e.target.value })} />
          <FieldError>{errors.price_pence?.[0]}</FieldError>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <label className="flex items-center gap-2.5 text-[13px] text-ink-soft">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          className="h-4 w-4 accent-forest"
        />
        Visible to customers
      </label>

      <div className="flex items-center justify-between border-t hairline pt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full bg-forest px-6 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
        >
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
        {product ? (
          <button type="button" onClick={onDelete} className="text-[12px] font-medium text-[#8B2A1D] transition-colors hover:text-[#731F13]">
            Delete product
          </button>
        ) : null}
      </div>
    </form>
  );
}

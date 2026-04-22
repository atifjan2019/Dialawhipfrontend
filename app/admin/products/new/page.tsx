import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { Category } from "@/lib/types";
import { ProductForm } from "@/components/admin/product-form";
import { Eyebrow } from "@/components/shop/eyebrow";

export default async function NewProductPage() {
  const cats = await apiServer<{ data: Category[] }>("/api/v1/categories", { auth: false });
  return (
    <div className="mx-auto max-w-4xl px-10 py-10">
      <Link href="/admin/products" className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-forest">
        ← Products
      </Link>
      <Eyebrow className="mt-8">Add</Eyebrow>
      <h1 className="mt-5 font-display text-[44px] leading-[1] text-ink">New product</h1>
      <div className="mt-10 rounded-lg border hairline bg-paper p-7">
        <ProductForm categories={cats.data} />
      </div>
    </div>
  );
}

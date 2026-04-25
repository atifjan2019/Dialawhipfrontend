import Link from "next/link";
import { notFound } from "next/navigation";
import { apiServer, ApiRequestError } from "@/lib/api-server";
import type { Category, Product } from "@/lib/types";
import { ProductForm } from "@/components/admin/product-form";
import { Eyebrow } from "@/components/shop/eyebrow";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  let product: Product;
  try {
    product = (await apiServer<{ data: Product }>(`/api/v1/admin/products/${id}`)).data;
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 404) return notFound();
    throw e;
  }
  const cats = await apiServer<{ data: Category[] }>("/api/v1/categories", { auth: false });

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
      <Link href="/admin/products" className="text-[12px] font-bold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-brand">
        ← Products
      </Link>
      <Eyebrow className="mt-8">Edit</Eyebrow>
      <h1 className="mt-5 font-display text-[44px] leading-[1] text-ink">{product.name}</h1>
      <div className="mt-10 rounded-lg border hairline bg-paper p-7">
        <ProductForm product={product} categories={cats.data} />
      </div>
    </div>
  );
}

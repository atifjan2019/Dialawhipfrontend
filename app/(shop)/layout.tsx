import { ShopHeader } from "@/components/shop/header";
import { ShopFooter } from "@/components/shop/footer";
import { getCurrentUser } from "@/lib/api-server";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser().catch(() => null);
  return (
    <>
      <ShopHeader user={user} />
      <main className="flex-1">{children}</main>
      <ShopFooter />
    </>
  );
}

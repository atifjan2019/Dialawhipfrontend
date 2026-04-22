import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api-server";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin" && user.role !== "staff") redirect("/forbidden");

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar name={user.name} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api-server";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin" && user.role !== "staff") redirect("/forbidden");

  return (
    <div className="flex min-h-screen flex-col bg-cream md:flex-row">
      <AdminSidebar name={user.name} />
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}

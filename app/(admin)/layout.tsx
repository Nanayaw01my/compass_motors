import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/login");
  }


  return (
    <div className="flex h-screen bg-[#f7f7f8] overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}

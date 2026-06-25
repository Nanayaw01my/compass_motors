import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CustomerNav } from "@/components/customer/CustomerNav";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/login");
  if ((session.user as any)?.role !== "customer") redirect("/admin/dashboard");


  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <main>{children}</main>
      <CustomerNav />
    </div>
  );
}

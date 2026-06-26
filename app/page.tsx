import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let session: any = null;
  try {
    session = await auth();
  } catch {
    redirect("/login");
  }

  if (!session) redirect("/login");

  const role = (session.user as any)?.role;
  if (role === "admin") redirect("/admin/dashboard");
  if (role === "customer") redirect("/customer/dashboard");

  redirect("/login");
}

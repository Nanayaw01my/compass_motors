import React from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { connectDB } from "@/lib/db/connect";
import Admin from "@/lib/db/models/Admin";
import { auth } from "@/lib/auth";

async function getAdminInfo() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  await connectDB();
  const admin = await Admin.findOne({ email }).select("-password");
  return admin ? JSON.parse(JSON.stringify(admin)) : null;
}

export default async function SettingsPage() {
  const admin = await getAdminInfo();

  return (
    <>
      <AdminHeader title="Settings" subtitle="Manage your account and system settings" />
      <div className="p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Business Information</CardTitle></CardHeader>
          <CardContent className="p-0">
            {[
              { label: "Business Name", value: "Compass Motors" },
              { label: "Phone", value: "0593920144" },
              { label: "Email", value: "cmsspass@gmail.com" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-400">{r.label}</span>
                <span className="text-sm font-medium">{r.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {admin && <AdminSettingsForm admin={admin} />}
      </div>
    </>
  );
}

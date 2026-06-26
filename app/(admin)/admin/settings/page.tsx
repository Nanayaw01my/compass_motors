import React from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { ClearDataButton } from "@/components/admin/ClearDataButton";
import { connectDB } from "@/lib/db/connect";
import Admin from "@/lib/db/models/Admin";
import { auth } from "@/lib/auth";

async function getSettingsData() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { admin: null, allAdmins: [], currentAdminId: "" };

  await connectDB();
  const [admin, allAdmins] = await Promise.all([
    Admin.findOne({ email }).select("-password").lean(),
    Admin.find().select("-password").sort({ createdAt: 1 }).lean(),
  ]);

  return {
    admin: admin ? JSON.parse(JSON.stringify(admin)) : null,
    allAdmins: JSON.parse(JSON.stringify(allAdmins)),
    currentAdminId: admin ? (admin as any)._id.toString() : "",
  };
}

export default async function SettingsPage() {
  const { admin, allAdmins, currentAdminId } = await getSettingsData();

  return (
    <>
      <AdminHeader title="Settings" subtitle="Manage accounts and system settings" />
      <div className="p-6 space-y-6 max-w-2xl">

        {/* Business Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
          <CardContent className="p-0">
            {[
              { label: "Business Name", value: "Compass Motors" },
              { label: "Phone", value: "0593920144" },
              { label: "Email", value: "cmsspass@gmail.com" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-400">{r.label}</span>
                <span className="text-sm font-bold text-gray-900">{r.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* My Profile */}
        {admin && <AdminSettingsForm admin={admin} />}

        {/* Admin Users */}
        <AdminUsersPanel admins={allAdmins} currentAdminId={currentAdminId} />

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 text-base">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Permanently delete all customers, contracts, payments, and motorcycles. Admin accounts will be preserved.
            </p>
            <ClearDataButton />
          </CardContent>
        </Card>

      </div>
    </>
  );
}

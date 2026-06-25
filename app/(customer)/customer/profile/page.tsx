import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerProfileActions } from "@/components/customer/CustomerProfileActions";
import { formatDate } from "@/lib/utils";
import { User, Phone, MapPin, CreditCard, LogOut } from "lucide-react";

async function getCustomer(userId: string) {
  await connectDB();
  const customer = await Customer.findById(userId).select("-password");
  return customer ? JSON.parse(JSON.stringify(customer)) : null;
}

export default async function CustomerProfilePage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const customer = await getCustomer(userId);
  if (!customer) redirect("/login");

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 pt-4">My Profile</h1>

      <Card>
        <CardContent className="p-6 text-center">
          {customer.passportPhoto ? (
            <img src={customer.passportPhoto} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl font-bold text-red-600">{customer.fullName.charAt(0)}</span>
            </div>
          )}
          <h2 className="font-bold text-xl text-gray-900">{customer.fullName}</h2>
          <p className="text-gray-500 text-sm">{customer.customerId}</p>
          <Badge variant={customer.status === "active" ? "success" : "warning"} className="mt-2">
            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-red-600" /> Personal Details</CardTitle></CardHeader>
        <CardContent className="p-0">
          {[
            { label: "Phone", value: customer.phone },
            { label: "Alt. Phone", value: customer.altPhone },
            { label: "Email", value: customer.email },
            { label: "Gender", value: customer.gender },
            { label: "Occupation", value: customer.occupation },
            { label: "Date of Birth", value: customer.dateOfBirth ? formatDate(customer.dateOfBirth) : null },
          ].filter((r) => r.value).map((row) => (
            <div key={row.label} className="flex justify-between px-5 py-3 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-400">{row.label}</span>
              <span className="text-sm font-medium text-gray-900">{row.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {customer.residentialAddress && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-red-600" /> Address</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-700">{customer.residentialAddress}</p>
            {customer.gpsAddress && <p className="text-xs text-gray-400 mt-1">GPS: {customer.gpsAddress}</p>}
          </CardContent>
        </Card>
      )}

      <CustomerProfileActions />
    </div>
  );
}

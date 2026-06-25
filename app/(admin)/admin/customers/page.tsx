import React from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import { formatDate } from "@/lib/utils";
import { Plus, Search, Users } from "lucide-react";
import { CustomerSearch } from "@/components/admin/CustomerSearch";

async function getCustomers(search?: string) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { customerId: { $regex: search, $options: "i" } },
    ];
  }
  const customers = await Customer.find(query).sort({ createdAt: -1 }).limit(100);
  return JSON.parse(JSON.stringify(customers));
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const customers = await getCustomers(params.search);

  const statusVariant = (status: string): "success" | "warning" | "default" => {
    if (status === "active") return "success";
    if (status === "suspended") return "warning";
    return "default";
  };

  return (
    <>
      <AdminHeader title="Customers" subtitle={`${customers.length} customers registered`} />
      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <CustomerSearch />
          <Link href="/admin/customers/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Register Customer
            </Button>
          </Link>
        </div>

        {customers.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No customers found</p>
              <p className="text-gray-400 text-sm mt-1">Register your first customer to get started</p>
              <Link href="/admin/customers/new" className="mt-4 inline-block">
                <Button size="sm">Register Customer</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customers.map((customer: any) => (
                        <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {customer.passportPhoto ? (
                                <img src={customer.passportPhoto} alt="" className="w-9 h-9 rounded-full object-cover" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-sm">
                                  {customer.fullName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{customer.fullName}</p>
                                <p className="text-xs text-gray-500">{customer.email || "No email"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-700">{customer.customerId}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{customer.phone}</td>
                          <td className="px-6 py-4">
                            <Badge variant={statusVariant(customer.status)}>
                              {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(customer.createdAt)}</td>
                          <td className="px-6 py-4">
                            <Link href={`/admin/customers/${customer._id}`}>
                              <Button size="sm" variant="outline">View</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {customers.map((customer: any) => (
                <Card key={customer._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {customer.passportPhoto ? (
                        <img src={customer.passportPhoto} alt="" className="w-11 h-11 rounded-full object-cover" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold">
                          {customer.fullName.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{customer.fullName}</p>
                        <p className="text-sm text-gray-500">{customer.customerId}</p>
                      </div>
                      <Badge variant={statusVariant(customer.status)}>
                        {customer.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div><span className="text-gray-400">Phone: </span><span className="font-medium">{customer.phone}</span></div>
                      <div><span className="text-gray-400">Joined: </span><span>{formatDate(customer.createdAt)}</span></div>
                    </div>
                    <Link href={`/admin/customers/${customer._id}`}>
                      <Button size="sm" variant="outline" className="w-full">View Details</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

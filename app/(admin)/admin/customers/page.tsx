import React from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import { formatDate } from "@/lib/utils";
import { Plus, Users } from "lucide-react";
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

const statusStyle: Record<string, { dot: string; text: string }> = {
  active:    { dot: "bg-emerald-500", text: "text-emerald-700" },
  suspended: { dot: "bg-amber-500",   text: "text-amber-700" },
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const customers = await getCustomers(params.search);
  const activeCount = customers.filter((c: any) => c.status === "active").length;

  return (
    <>
      <AdminHeader title="Customers" subtitle={`${customers.length} registered`} />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />{activeCount} active</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-300" />{customers.length - activeCount} other</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <CustomerSearch />
            <Link href="/admin/customers/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shrink-0">
              <Plus className="w-4 h-4" /><span className="hidden sm:inline">Register</span><span className="sm:hidden">New</span>
            </Link>
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">No customers found</p>
            <p className="text-gray-400 text-sm mb-5">Register your first customer to get started</p>
            <Link href="/admin/customers/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">
              <Plus className="w-4 h-4" /> Register Customer
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Customer", "ID", "Phone", "Status", "Joined", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((c: any) => {
                    const s = statusStyle[c.status] || { dot: "bg-gray-400", text: "text-gray-600" };
                    return (
                      <tr key={c._id} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {c.passportPhoto ? (
                              <img src={c.passportPhoto} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0">
                                {c.fullName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{c.fullName}</p>
                              <p className="text-xs text-gray-400">{c.email || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{c.customerId}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-700">{c.phone}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${s.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-400">{formatDate(c.createdAt)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <Link href={`/admin/customers/${c._id}`} className="text-xs font-semibold text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden space-y-2">
              {customers.map((c: any) => {
                const s = statusStyle[c.status] || { dot: "bg-gray-400", text: "text-gray-500" };
                return (
                  <Link key={c._id} href={`/admin/customers/${c._id}`}>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm active:bg-gray-50">
                      {c.passportPhoto ? (
                        <img src={c.passportPhoto} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0">
                          {c.fullName.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{c.fullName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{c.phone} · <span className="font-mono">{c.customerId}</span></p>
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-medium ${s.text} shrink-0`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{c.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

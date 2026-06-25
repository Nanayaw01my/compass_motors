import React from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { connectDB } from "@/lib/db/connect";
import Payment from "@/lib/db/models/Payment";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { CreditCard } from "lucide-react";

async function getPayments() {
  await connectDB();
  const payments = await Payment.find()
    .populate("customer", "fullName customerId")
    .populate("contract", "contractNumber")
    .sort({ createdAt: -1 })
    .limit(200);
  return JSON.parse(JSON.stringify(payments));
}

const methodConfig: Record<string, { label: string; color: string }> = {
  paystack:        { label: "Paystack",      color: "bg-blue-100 text-blue-700" },
  cash:            { label: "Cash",          color: "bg-emerald-100 text-emerald-700" },
  "mobile-money":  { label: "Mobile Money",  color: "bg-purple-100 text-purple-700" },
  "bank-transfer": { label: "Bank Transfer", color: "bg-indigo-100 text-indigo-700" },
};

export default async function PaymentsPage() {
  const payments = await getPayments();
  const totalCollected = payments.filter((p: any) => p.status === "successful").reduce((s: number, p: any) => s + p.amount, 0);

  return (
    <>
      <AdminHeader title="Payments" subtitle={`${payments.length} transactions`} />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Total Collected</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalCollected)}</p>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Transactions</p>
            <p className="text-xl font-bold text-gray-900">{payments.filter((p: any) => p.status === "successful").length}</p>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 hidden sm:block">
            <p className="text-xs text-gray-400 mb-1">Pending</p>
            <p className="text-xl font-bold text-amber-600">{payments.filter((p: any) => p.status === "pending").length}</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900">No payments recorded yet</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Receipt", "Customer", "Amount", "Method", "Bal. After", "Date & Time", "Status"].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((p: any) => {
                    const method = methodConfig[p.paymentMethod] || { label: p.paymentMethod, color: "bg-gray-100 text-gray-600" };
                    return (
                      <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{p.receiptNumber}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-sm text-gray-900">{p.customer?.fullName}</p>
                          <p className="text-xs font-mono text-gray-400">{p.contract?.contractNumber}</p>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-emerald-600 text-sm">{formatCurrency(p.amount)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${method.color}`}>{method.label}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-red-500">{formatCurrency(p.balanceAfter)}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-400">{formatDateTime(p.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            p.status === "successful" ? "text-emerald-600" : p.status === "pending" ? "text-amber-600" : "text-red-600"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              p.status === "successful" ? "bg-emerald-500" : p.status === "pending" ? "bg-amber-500" : "bg-red-500"
                            }`} />
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-2">
              {payments.map((p: any) => {
                const method = methodConfig[p.paymentMethod] || { label: p.paymentMethod, color: "bg-gray-100 text-gray-600" };
                return (
                  <div key={p._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{p.customer?.fullName}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{p.receiptNumber}</p>
                      </div>
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(p.amount)}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${method.color}`}>{method.label}</span>
                      <span>Bal: {formatCurrency(p.balanceAfter)}</span>
                      <span>{formatDateTime(p.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

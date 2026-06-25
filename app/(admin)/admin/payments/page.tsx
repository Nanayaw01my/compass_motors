import React from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const methodLabel: Record<string, string> = {
  paystack: "Paystack",
  cash: "Cash",
  "mobile-money": "Mobile Money",
  "bank-transfer": "Bank Transfer",
};

export default async function PaymentsPage() {
  const payments = await getPayments();

  return (
    <>
      <AdminHeader title="Payments" subtitle={`${payments.length} recent payments`} />
      <div className="p-6">
        {payments.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No payments recorded yet</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Receipt</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Method</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Balance After</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payments.map((p: any) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-xs font-mono text-gray-600">{p.receiptNumber}</td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-sm text-gray-900">{p.customer?.fullName}</p>
                            <p className="text-xs text-gray-400">{p.contract?.contractNumber}</p>
                          </td>
                          <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(p.amount)}</td>
                          <td className="px-6 py-4 text-sm">{methodLabel[p.paymentMethod] || p.paymentMethod}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-red-600">{formatCurrency(p.balanceAfter)}</td>
                          <td className="px-6 py-4 text-xs text-gray-500">{formatDateTime(p.createdAt)}</td>
                          <td className="px-6 py-4">
                            <Badge variant={p.status === "successful" ? "success" : p.status === "pending" ? "warning" : "destructive"}>
                              {p.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {payments.map((p: any) => (
                <Card key={p._id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{p.customer?.fullName}</p>
                        <p className="text-xs font-mono text-gray-400">{p.receiptNumber}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(p.amount)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <span>{methodLabel[p.paymentMethod]}</span>
                      <span>Bal: {formatCurrency(p.balanceAfter)}</span>
                      <span>{formatDateTime(p.createdAt)}</span>
                      <Badge variant={p.status === "successful" ? "success" : "warning"} className="w-fit">{p.status}</Badge>
                    </div>
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

import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import Payment from "@/lib/db/models/Payment";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { CheckCircle, Clock } from "lucide-react";

async function getPaymentHistory(userId: string) {
  await connectDB();
  const payments = await Payment.find({ customer: userId, status: "successful" }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(payments));
}

const methodLabel: Record<string, string> = {
  paystack:        "Paystack",
  cash:            "Cash",
  "mobile-money":  "Mobile Money",
  "bank-transfer": "Bank Transfer",
};

const methodColor: Record<string, string> = {
  paystack:        "bg-blue-100 text-blue-700",
  cash:            "bg-emerald-100 text-emerald-700",
  "mobile-money":  "bg-purple-100 text-purple-700",
  "bank-transfer": "bg-indigo-100 text-indigo-700",
};

export default async function PaymentHistoryPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const payments = await getPaymentHistory(userId);
  const total = payments.reduce((s: number, p: any) => s + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden pb-14" style={{ background: "linear-gradient(145deg, #DC2626 0%, #7f1d1d 100%)" }}>
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-[0.07]" style={{ background: "white", transform: "translate(40%,-40%)" }} />
        <div className="relative px-5 pt-6 pb-2">
          <h1 className="text-white font-bold text-xl">Payment History</h1>
          {payments.length > 0 && (
            <p className="text-red-200 text-sm mt-0.5">{payments.length} payments · {formatCurrency(total)} total</p>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-50 rounded-t-[2rem]" />
      </div>

      <div className="px-4 -mt-6 pb-28 space-y-3">
        {payments.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">No payments yet</p>
            <p className="text-gray-400 text-sm">Your payment history will appear here</p>
          </div>
        ) : (
          payments.map((p: any, i: number) => {
            const showDate = i === 0 || formatDate(p.createdAt) !== formatDate(payments[i - 1].createdAt);
            return (
              <React.Fragment key={p._id}>
                {showDate && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2 px-1">{formatDate(p.createdAt)}</p>
                )}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${methodColor[p.paymentMethod] || "bg-gray-100 text-gray-600"}`}>
                          {methodLabel[p.paymentMethod] || p.paymentMethod}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400">{formatDateTime(p.createdAt)}</p>
                        <p className="text-xs font-mono text-gray-300">{p.receiptNumber}</p>
                      </div>
                      {p.balanceAfter !== undefined && (
                        <p className="text-xs text-gray-400 mt-1">Balance after: <span className="font-semibold text-red-500">{formatCurrency(p.balanceAfter)}</span></p>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}

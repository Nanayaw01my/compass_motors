import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import { formatCurrency, formatDate, calculateProgress } from "@/lib/utils";
import { Bike, Phone, MapPin, CheckCircle } from "lucide-react";

async function getData(userId: string) {
  await connectDB();
  const contract = await Contract.findOne({ customer: userId, status: { $in: ["active", "overdue"] } })
    .populate("motorcycle").sort({ createdAt: -1 });
  const lastPayment = await Payment.findOne({ customer: userId, status: "successful" }).sort({ createdAt: -1 });
  return {
    contract: contract ? JSON.parse(JSON.stringify(contract)) : null,
    lastPayment: lastPayment ? JSON.parse(JSON.stringify(lastPayment)) : null,
  };
}

export default async function CustomerPaymentsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const { contract, lastPayment } = await getData(userId);
  const moto = contract?.motorcycle;
  const progress = contract ? calculateProgress(contract.totalPaid, contract.sellingPrice) : 0;
  const isOverdue = contract?.status === "overdue";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden pb-14" style={{ background: "linear-gradient(145deg, #DC2626 0%, #7f1d1d 100%)" }}>
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-[0.07]" style={{ background: "white", transform: "translate(40%,-40%)" }} />
        <div className="relative px-5 pt-6 pb-2">
          <h1 className="text-white font-bold text-xl">Payments</h1>
          <p className="text-red-200 text-sm mt-0.5">Your installment details</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-50 rounded-t-[2rem]" />
      </div>

      <div className="px-4 -mt-6 pb-28 space-y-4">
        {!contract ? (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Bike className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">No active contract</p>
            <p className="text-gray-400 text-sm">Contact Compass Motors to get started</p>
            <a href="tel:0593920144" className="inline-block mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">
              Call 0593920144
            </a>
          </div>
        ) : (
          <>
            {/* Contract card */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between ${isOverdue ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? "bg-red-500" : "bg-emerald-500"}`} />
                  {isOverdue ? "Payment Overdue — Please visit the office" : "Contract Active"}
                </span>
                <span className="font-mono opacity-60">{contract.contractNumber}</span>
              </div>

              <div className="p-5">
                {/* Bike */}
                <div className="flex items-center gap-3 mb-5">
                  {moto?.images?.[0] ? (
                    <img src={moto.images[0]} alt="" className="w-16 h-12 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <Bike className="w-6 h-6 text-red-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{moto?.brand} {moto?.model}</p>
                    <p className="text-sm text-gray-400">{moto?.year}</p>
                  </div>
                </div>

                {/* Balance spotlight */}
                <div className={`rounded-xl p-4 text-center mb-4 ${isOverdue ? "bg-red-50 border border-red-100" : "bg-gray-50"}`}>
                  <p className="text-xs text-gray-400 font-medium mb-1">Outstanding Balance</p>
                  <p className={`text-3xl font-bold ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                    {formatCurrency(contract.remainingBalance)}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Total Price</p>
                    <p className="font-bold text-gray-900">{formatCurrency(contract.sellingPrice)}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Amount Paid</p>
                    <p className="font-bold text-emerald-600">{formatCurrency(contract.totalPaid)}</p>
                  </div>
                </div>

                {/* Installment info */}
                {(contract.weeklyInstallment || contract.monthlyInstallment) && (
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5 mb-4">
                    <p className="text-xs text-blue-500 font-medium">
                      {contract.weeklyInstallment ? "Weekly Installment" : "Monthly Installment"}
                    </p>
                    <p className="text-xl font-bold text-blue-700 mt-0.5">
                      {formatCurrency(contract.weeklyInstallment || contract.monthlyInstallment)}
                    </p>
                  </div>
                )}

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs text-gray-500">
                    <span>Payment progress</span>
                    <span className="font-bold text-gray-700">{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isOverdue ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Last payment */}
            {lastPayment && (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Last payment</p>
                  <p className="font-bold text-gray-900">{formatCurrency(lastPayment.amount)}</p>
                  <p className="text-xs text-gray-400">{formatDate(lastPayment.createdAt)}</p>
                </div>
                <p className="text-xs font-mono text-gray-300">{lastPayment.receiptNumber}</p>
              </div>
            )}

            {/* How to pay */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-50">
                <h3 className="font-semibold text-gray-900 text-sm">How to Make a Payment</h3>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-500 leading-relaxed">
                  All payments are recorded by Compass Motors staff. Visit our office or call us to make your installment payment.
                </p>
                <div className="space-y-3">
                  <a href="tel:0593920144" className="flex items-center gap-3 p-3.5 rounded-xl bg-red-600 hover:bg-red-700 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Call to Pay</p>
                      <p className="text-red-200 text-xs">0593920144</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50">
                    <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">Visit Our Office</p>
                      <p className="text-gray-400 text-xs">Payments accepted during business hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

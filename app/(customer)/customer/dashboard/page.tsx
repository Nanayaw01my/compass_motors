import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import { formatCurrency, formatDate, calculateProgress } from "@/lib/utils";
import { Bike, CreditCard, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

async function getCustomerData(userId: string) {
  await connectDB();
  const customer = await Customer.findById(userId).select("-password");
  if (!customer) return null;
  const contract = await Contract.findOne({ customer: userId, status: { $in: ["active", "overdue"] } })
    .populate("motorcycle").sort({ createdAt: -1 });
  const recentPayments = await Payment.find({ customer: userId, status: "successful" })
    .sort({ createdAt: -1 }).limit(4);
  return {
    customer: JSON.parse(JSON.stringify(customer)),
    contract: contract ? JSON.parse(JSON.stringify(contract)) : null,
    recentPayments: JSON.parse(JSON.stringify(recentPayments)),
  };
}

export default async function CustomerDashboard() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");
  const data = await getCustomerData(userId);
  if (!data) redirect("/login");

  const { customer, contract, recentPayments } = data;
  const progress = contract ? calculateProgress(contract.totalPaid, contract.sellingPrice) : 0;
  const moto = contract?.motorcycle;
  const isOverdue = contract?.status === "overdue";

  const initials = customer.fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden pb-16" style={{ background: "linear-gradient(145deg, #DC2626 0%, #7f1d1d 100%)" }}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.08]" style={{ background: "white", transform: "translate(40%, -40%)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-[0.06]" style={{ background: "white", transform: "translate(-30%, 30%)" }} />

        <div className="relative px-5 pt-6">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-red-300 text-xs font-medium uppercase tracking-wider">Compass Motors</p>
              <p className="text-white/60 text-xs mt-0.5">{customer.customerId}</p>
            </div>
            <Link href="/customer/profile">
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm backdrop-blur-sm">
                {initials}
              </div>
            </Link>
          </div>

          {/* Greeting */}
          <div>
            <p className="text-red-200 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-bold text-white mt-0.5 leading-tight">
              {customer.fullName.split(" ")[0]}
            </h1>
          </div>
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-50 rounded-t-[2rem]" />
      </div>

      <div className="px-4 -mt-8 space-y-4 pb-28">

        {/* ── No Contract State ── */}
        {!contract && (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Bike className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No Active Contract</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              You don&apos;t have an active installment plan. Contact Compass Motors to get started.
            </p>
            <a
              href="tel:0593920144"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Call 0593920144
            </a>
          </div>
        )}

        {/* ── Contract Card ── */}
        {contract && (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            {/* Status banner */}
            <div className={`px-5 py-2.5 flex items-center justify-between text-xs font-semibold ${isOverdue ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
              <div className="flex items-center gap-1.5">
                {isOverdue ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                <span>{isOverdue ? "Payment Overdue" : "Contract Active"}</span>
              </div>
              <span className="font-mono text-xs opacity-70">{contract.contractNumber}</span>
            </div>

            {/* Motorcycle info */}
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5">
                {moto?.images?.[0] ? (
                  <img src={moto.images[0]} alt={moto.model} className="w-20 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-20 h-16 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Bike className="w-8 h-8 text-red-400" />
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-gray-900 text-base leading-tight">
                    {moto?.brand} {moto?.model}
                  </h2>
                  <p className="text-gray-400 text-sm">{moto?.year} &middot; {moto?.color}</p>
                  <p className="text-gray-400 text-xs mt-1 capitalize">{contract.contractType} plan</p>
                </div>
              </div>

              {/* Progress section */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">Payment Progress</span>
                  <span className="text-xs font-bold text-gray-900">{progress}%</span>
                </div>
                {/* Custom progress bar */}
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isOverdue ? "bg-red-500" : "bg-emerald-500"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{formatCurrency(contract.totalPaid)} paid</span>
                  <span className="text-xs text-gray-400">{formatCurrency(contract.sellingPrice)} total</span>
                </div>
              </div>

              {/* Financial breakdown */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl bg-gray-50 p-3.5">
                  <p className="text-xs text-gray-400 mb-1">Amount Paid</p>
                  <p className="font-bold text-emerald-600 text-base">{formatCurrency(contract.totalPaid)}</p>
                </div>
                <div className="rounded-xl bg-red-50 p-3.5">
                  <p className="text-xs text-gray-400 mb-1">Balance Left</p>
                  <p className="font-bold text-red-600 text-base">{formatCurrency(contract.remainingBalance)}</p>
                </div>
              </div>

              {/* Installment info */}
              {(contract.weeklyInstallment || contract.monthlyInstallment) && (
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5 mb-5">
                  <p className="text-xs text-blue-600 font-medium mb-0.5">
                    {contract.weeklyInstallment ? "Weekly Installment" : "Monthly Installment"}
                  </p>
                  <p className="font-bold text-blue-700 text-lg">
                    {formatCurrency(contract.weeklyInstallment || contract.monthlyInstallment)}
                  </p>
                </div>
              )}

              {/* CTA */}
              <Link
                href="/customer/payments"
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Make a Payment
              </Link>
            </div>
          </div>
        )}

        {/* ── Recent Payments ── */}
        {recentPayments.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h3 className="font-semibold text-gray-900 text-sm">Recent Payments</h3>
              <Link href="/customer/history" className="text-xs font-medium text-red-600">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentPayments.map((p: any, i: number) => (
                <div key={p._id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                  </div>
                  <span className="text-xs font-mono text-gray-300">{p.receiptNumber}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Help ── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Need Assistance?</p>
            <p className="text-xs text-gray-400 mt-0.5">Our team is ready to help you</p>
          </div>
          <a
            href="tel:0593920144"
            className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Call Us
          </a>
        </div>

      </div>
    </div>
  );
}

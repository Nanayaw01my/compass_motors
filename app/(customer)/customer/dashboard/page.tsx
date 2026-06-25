import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import { formatCurrency, formatDate, calculateProgress } from "@/lib/utils";
import { Bike, CreditCard, Clock, CheckCircle, Phone, ChevronRight } from "lucide-react";
import Link from "next/link";

async function getCustomerData(userId: string) {
  await connectDB();
  const customer = await Customer.findById(userId).select("-password");
  if (!customer) return null;
  const contract = await Contract.findOne({ customer: userId, status: { $in: ["active", "overdue"] } })
    .populate("motorcycle").sort({ createdAt: -1 });
  const recentPayments = await Payment.find({ customer: userId, status: "successful" })
    .sort({ createdAt: -1 }).limit(3);
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
  const firstName = customer.fullName.split(" ")[0];
  const initials = customer.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "#f4f4f0" }}>

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #b91c1c 0%, #7f1d1d 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.04)", transform: "translate(35%,-35%)" }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none" style={{ background: "rgba(0,0,0,0.12)", transform: "translate(-30%,40%)" }} />

        <div className="relative px-5 pt-6 pb-20">
          {/* Top row */}
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-red-300 text-[11px] font-semibold uppercase tracking-widest">Compass Motors</p>
              <p className="text-white/40 text-xs mt-0.5 font-mono">{customer.customerId}</p>
            </div>
            <Link href="/customer/profile">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2"
                style={{ background: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.25)" }}
              >
                {initials}
              </div>
            </Link>
          </div>

          {/* Greeting + balance */}
          <div>
            <p className="text-red-200/70 text-sm mb-1">Good day, {firstName}</p>
            {contract ? (
              <>
                <p className="text-red-200/60 text-xs font-medium uppercase tracking-wider mb-1">Outstanding Balance</p>
                <h1
                  className="font-bold text-white leading-none tracking-tight"
                  style={{ fontSize: "2.6rem" }}
                >
                  {formatCurrency(contract.remainingBalance)}
                </h1>
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: isOverdue ? "rgba(254,202,202,0.2)" : "rgba(167,243,208,0.2)",
                      color: isOverdue ? "#fca5a5" : "#6ee7b7",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: isOverdue ? "#fca5a5" : "#6ee7b7" }} />
                    {isOverdue ? "Payment Overdue" : "Contract Active"}
                  </span>
                  <span className="text-white/30 text-xs font-mono">{contract.contractNumber}</span>
                </div>
              </>
            ) : (
              <h1 className="text-2xl font-bold text-white mt-1">No Active Contract</h1>
            )}
          </div>
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-10 rounded-t-[2rem]" style={{ background: "#f4f4f0" }} />
      </div>

      <div className="px-4 -mt-4 pb-28 space-y-4">

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: "/customer/payments", icon: CreditCard, label: "Payments", color: "#b91c1c", bg: "#fef2f2" },
            { href: "/customer/history", icon: Clock, label: "History", color: "#1d4ed8", bg: "#eff6ff" },
            { href: "tel:0593920144", icon: Phone, label: "Call Us", color: "#065f46", bg: "#ecfdf5" },
          ].map(({ href, icon: Icon, label, color, bg }) => (
            <a
              key={label}
              href={href}
              className="rounded-2xl p-4 flex flex-col items-center gap-2.5 bg-white border border-black/[0.05] shadow-sm active:scale-[0.97] transition-transform"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-xs font-semibold text-gray-700">{label}</span>
            </a>
          ))}
        </div>

        {/* ── No Contract ── */}
        {!contract && (
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#fef2f2" }}>
              <Bike className="w-8 h-8" style={{ color: "#b91c1c" }} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">No Active Contract</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Contact Compass Motors to start an installment plan.
            </p>
            <a
              href="tel:0593920144"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-colors"
              style={{ background: "#b91c1c" }}
            >
              <Phone className="w-4 h-4" />
              Call 0593920144
            </a>
          </div>
        )}

        {/* ── Contract Card ── */}
        {contract && (
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm overflow-hidden">
            {/* Motorcycle header */}
            <div className="p-5 flex items-center gap-4 border-b border-gray-50">
              {moto?.images?.[0] ? (
                <img src={moto.images[0]} alt={moto.model} className="w-20 h-14 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-20 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#fef2f2" }}>
                  <Bike className="w-7 h-7" style={{ color: "#b91c1c" }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 text-base leading-tight truncate">
                  {moto?.brand} {moto?.model}
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">{moto?.year}{moto?.color ? ` · ${moto.color}` : ""}</p>
                <p className="text-gray-400 text-xs capitalize mt-0.5">{contract.contractType} plan</p>
              </div>
            </div>

            {/* Progress */}
            <div className="px-5 py-4 border-b border-gray-50">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-gray-500">Payment Progress</span>
                <span className="text-xs font-bold" style={{ color: isOverdue ? "#b91c1c" : "#059669" }}>{progress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "#f1f1ef" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progress}%`, background: isOverdue ? "#dc2626" : "#10b981" }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-gray-400">{formatCurrency(contract.totalPaid)} paid</span>
                <span className="text-[11px] text-gray-400">{formatCurrency(contract.sellingPrice)} total</span>
              </div>
            </div>

            {/* Financials */}
            <div className="grid grid-cols-2 divide-x divide-gray-50">
              <div className="p-4">
                <p className="text-[11px] text-gray-400 font-medium mb-1">Amount Paid</p>
                <p className="font-bold text-lg" style={{ color: "#059669" }}>{formatCurrency(contract.totalPaid)}</p>
              </div>
              <div className="p-4">
                <p className="text-[11px] text-gray-400 font-medium mb-1">Balance Left</p>
                <p className="font-bold text-lg" style={{ color: isOverdue ? "#b91c1c" : "#111827" }}>
                  {formatCurrency(contract.remainingBalance)}
                </p>
              </div>
            </div>

            {/* Installment */}
            {(contract.weeklyInstallment || contract.monthlyInstallment) && (
              <div
                className="mx-4 mb-4 rounded-xl p-3.5 flex items-center justify-between border"
                style={{ background: "#eff6ff", borderColor: "#dbeafe" }}
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#3b82f6" }}>
                    {contract.weeklyInstallment ? "Weekly Installment" : "Monthly Installment"}
                  </p>
                  <p className="font-bold text-xl mt-0.5" style={{ color: "#1d4ed8" }}>
                    {formatCurrency(contract.weeklyInstallment || contract.monthlyInstallment)}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(59,130,246,0.12)" }}
                >
                  <CreditCard className="w-5 h-5" style={{ color: "#3b82f6" }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Recent Payments ── */}
        {recentPayments.length > 0 && (
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900 text-sm">Recent Payments</h3>
              <Link
                href="/customer/history"
                className="flex items-center gap-0.5 text-xs font-semibold transition-colors"
                style={{ color: "#b91c1c" }}
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentPayments.map((p: any) => (
                <div key={p._id} className="flex items-center gap-3.5 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#ecfdf5" }}>
                    <CheckCircle className="w-4 h-4" style={{ color: "#10b981" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                  </div>
                  <span className="text-[11px] font-mono text-gray-300 truncate max-w-[90px]">{p.receiptNumber}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Help Banner ── */}
        <div
          className="rounded-2xl p-5 flex items-center justify-between border"
          style={{ background: "#1a0505", borderColor: "rgba(255,255,255,0.04)" }}
        >
          <div>
            <p className="text-white font-bold text-sm">Need Assistance?</p>
            <p className="text-gray-500 text-xs mt-0.5">Our team is here to help you</p>
          </div>
          <a
            href="tel:0593920144"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-colors"
            style={{ background: "#b91c1c" }}
          >
            <Phone className="w-3.5 h-3.5" />
            Call Us
          </a>
        </div>

      </div>
    </div>
  );
}

import React from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Motorcycle from "@/lib/db/models/Motorcycle";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, Bike, FileText, CreditCard, TrendingUp, AlertCircle, CheckCircle, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { AdminDashboardChart } from "@/components/admin/AdminDashboardChart";
import { BulkActions } from "@/components/admin/BulkActions";
import { ExportButton } from "@/components/admin/ExportButton";

async function getDashboardStats() {
  await connectDB();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());

  const [
    totalCustomers, activeCustomers,
    totalMotorcycles, availableMotorcycles, soldMotorcycles,
    activeContracts, completedContracts, overdueContracts,
    recentPayments, monthlyPayments, weeklyPayments, outstandingBalance, totalRevenue,
  ] = await Promise.all([
    Customer.countDocuments(),
    Customer.countDocuments({ status: "active" }),
    Motorcycle.countDocuments(),
    Motorcycle.countDocuments({ status: "available" }),
    Motorcycle.countDocuments({ status: "sold" }),
    Contract.countDocuments({ status: "active" }),
    Contract.countDocuments({ status: "completed" }),
    Contract.countDocuments({ status: "overdue" }),
    Payment.find({ status: "successful" }).sort({ createdAt: -1 }).limit(6)
      .populate("customer", "fullName customerId")
      .populate("contract", "contractNumber"),
    Payment.aggregate([{ $match: { status: "successful", createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Payment.aggregate([{ $match: { status: "successful", createdAt: { $gte: startOfWeek } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Contract.aggregate([{ $match: { status: { $in: ["active", "overdue"] } } }, { $group: { _id: null, total: { $sum: "$remainingBalance" } } }]),
    Payment.aggregate([{ $match: { status: "successful" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);

  const totalExpected = (await Contract.aggregate([
    { $match: {} },
    { $group: { _id: null, total: { $sum: "$sellingPrice" } } },
  ]))[0]?.total || 0;

  const rev = totalRevenue[0]?.total || 0;
  const collectionRate = totalExpected > 0 ? Math.round((rev / totalExpected) * 100) : 0;

  return {
    totalCustomers, activeCustomers,
    totalMotorcycles, availableMotorcycles, soldMotorcycles,
    activeContracts, completedContracts, overdueContracts,
    recentPayments: JSON.parse(JSON.stringify(recentPayments)),
    monthlyCollection: monthlyPayments[0]?.total || 0,
    weeklyCollection: weeklyPayments[0]?.total || 0,
    totalRevenue: rev,
    outstandingBalance: outstandingBalance[0]?.total || 0,
    collectionRate,
  };
}

async function getMonthlyChartData() {
  await connectDB();
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const result = await Payment.aggregate([
      { $match: { status: "successful", createdAt: { $gte: d, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    months.push({ month: d.toLocaleDateString("en-GH", { month: "short" }), revenue: result[0]?.total || 0 });
  }
  return months;
}

export default async function AdminDashboard() {
  const [stats, chartData] = await Promise.all([getDashboardStats(), getMonthlyChartData()]);
  const today = new Date().toLocaleDateString("en-GH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <AdminHeader title="Dashboard" subtitle={today} />

      <div className="p-4 sm:p-6 space-y-5">

        {/* ── Hero Banner ── */}
        <div className="relative rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #DC2626 0%, #7f1d1d 100%)" }}>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute top-4 right-32 w-16 h-16 rounded-full bg-white/10" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              {/* Revenue */}
              <div>
                <p className="text-red-200 text-xs font-bold uppercase tracking-widest mb-2">Total Revenue Collected</p>
                <p className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tight">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="bg-white/15 rounded-2xl px-4 py-2.5">
                    <p className="text-red-100 text-xs font-semibold">This Month</p>
                    <p className="text-white text-lg font-black">{formatCurrency(stats.monthlyCollection)}</p>
                  </div>
                  <div className="bg-white/15 rounded-2xl px-4 py-2.5">
                    <p className="text-red-100 text-xs font-semibold">This Week</p>
                    <p className="text-white text-lg font-black">{formatCurrency(stats.weeklyCollection)}</p>
                  </div>
                </div>
              </div>

              {/* Collection Rate */}
              <div className="sm:text-right">
                <p className="text-red-200 text-xs font-bold uppercase tracking-widest mb-1">Collection Rate</p>
                <p className="text-5xl sm:text-6xl font-black text-white leading-none">{stats.collectionRate}<span className="text-2xl text-red-300">%</span></p>
                <div className="mt-3 h-2.5 w-full sm:w-48 bg-white/20 rounded-full overflow-hidden ml-auto">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${stats.collectionRate}%` }}
                  />
                </div>
                <p className="text-red-200 text-xs mt-1.5 font-medium">of total contract value</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Key Stats Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Active Contracts", value: stats.activeContracts, icon: FileText, accent: "#3b82f6", bg: "#eff6ff", href: "/admin/contracts" },
            { label: "Overdue", value: stats.overdueContracts, icon: AlertCircle, accent: "#dc2626", bg: "#fef2f2", href: "/admin/contracts?status=overdue" },
            { label: "Completed", value: stats.completedContracts, icon: CheckCircle, accent: "#16a34a", bg: "#f0fdf4", href: "/admin/contracts?status=completed" },
            { label: "Total Customers", value: stats.totalCustomers, icon: Users, accent: "#7c3aed", bg: "#f5f3ff", href: "/admin/customers" },
          ].map(({ label, value, icon: Icon, accent, bg, href }) => (
            <Link key={label} href={href}
              className="group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 sm:p-5 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.07] translate-x-6 -translate-y-6 transition-transform group-hover:scale-125"
                style={{ background: accent }} />
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color: accent }} />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-gray-900 leading-none">{value}</p>
              <p className="text-xs font-bold text-gray-400 mt-1.5 uppercase tracking-wide">{label}</p>
              <div className="flex items-center gap-1 mt-3 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }}>
                View all <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>

        {/* ── Outstanding Balance ── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Outstanding Balance</p>
              <p className="text-3xl font-black text-gray-900 leading-tight">{formatCurrency(stats.outstandingBalance)}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Across all active &amp; overdue contracts</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <BulkActions />
            <ExportButton href="/api/export/payments" label="Export Payments" />
            <ExportButton href="/api/export/customers" label="Export Customers" />
          </div>
        </div>

        {/* ── Motorcycles ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Fleet", value: stats.totalMotorcycles, sub: "motorcycles", dot: "bg-gray-400" },
            { label: "Available", value: stats.availableMotorcycles, sub: "ready to sell", dot: "bg-emerald-500" },
            { label: "On Contract", value: stats.soldMotorcycles, sub: "deployed", dot: "bg-red-500" },
          ].map(({ label, value, sub, dot }) => (
            <Link key={label} href="/admin/motorcycles"
              className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 text-center group"
            >
              <div className={`w-2 h-2 rounded-full ${dot} mx-auto mb-2`} />
              <p className="text-3xl sm:text-4xl font-black text-gray-900">{value}</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </Link>
          ))}
        </div>

        {/* ── Chart + Recent Payments ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
            <div className="mb-4">
              <h3 className="font-black text-gray-900 text-base">Revenue Overview</h3>
              <p className="text-xs font-medium text-gray-400 mt-0.5">Last 6 months collections</p>
            </div>
            <AdminDashboardChart data={chartData} />
          </div>

          <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <h3 className="font-black text-gray-900 text-base">Recent Payments</h3>
                <p className="text-xs font-medium text-gray-400 mt-0.5">Latest transactions</p>
              </div>
              <Link href="/admin/payments" className="text-xs font-black text-red-600 hover:text-red-700 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stats.recentPayments.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm font-medium">No payments yet</div>
              ) : (
                stats.recentPayments.map((p: any) => (
                  <div key={p._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                      <span className="text-white font-black text-sm">
                        {p.customer?.fullName?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{p.customer?.fullName}</p>
                      <p className="text-xs text-gray-400 font-medium">{formatDate(p.createdAt)}</p>
                    </div>
                    <p className="text-sm font-black text-emerald-600 shrink-0">{formatCurrency(p.amount)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="font-black text-gray-900 text-base mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/admin/customers/new", icon: Users, label: "New Customer", desc: "Register customer" },
              { href: "/admin/motorcycles/new", icon: Bike, label: "Add Motorcycle", desc: "Add to inventory" },
              { href: "/admin/contracts/new", icon: FileText, label: "New Contract", desc: "Create agreement" },
              { href: "/admin/payments", icon: CreditCard, label: "Record Payment", desc: "Log a payment" },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href}
                className="group relative rounded-2xl border-2 border-gray-100 hover:border-red-200 bg-white hover:bg-red-50 transition-all p-4 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-red-600/5 translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform" />
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-black text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

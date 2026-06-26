import React from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Motorcycle from "@/lib/db/models/Motorcycle";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, Bike, FileText, CreditCard, TrendingUp, AlertCircle, CheckCircle, ArrowUpRight } from "lucide-react";
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

        {/* ── Primary KPIs ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Revenue */}
          <div className="sm:col-span-1 rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #DC2626 0%, #991b1b 100%)" }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
            <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-10" style={{ background: "white", transform: "translate(-30%, 30%)" }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-red-200 text-xs font-medium uppercase tracking-wider">Total Revenue</p>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold leading-none mb-1">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-red-200 text-xs">All time collections</p>
            </div>
          </div>

          {/* Monthly Collection */}
          <div className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">This Month</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{formatCurrency(stats.monthlyCollection)}</p>
            <p className="text-gray-400 text-xs">Week: {formatCurrency(stats.weeklyCollection)}</p>
          </div>

          {/* Outstanding */}
          <div className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Outstanding</p>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{formatCurrency(stats.outstandingBalance)}</p>
            <p className="text-gray-400 text-xs">Across all active contracts</p>
          </div>
        </div>

        {/* ── Collection Rate + Bulk Actions ── */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-center gap-5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">Collection Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900">{stats.collectionRate}%</span>
                <span className="text-xs text-gray-400">of total contract value collected</span>
              </div>
              <div className="mt-2 h-2 w-48 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${stats.collectionRate}%`,
                    background: stats.collectionRate >= 80 ? "#16a34a" : stats.collectionRate >= 50 ? "#f59e0b" : "#dc2626",
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <BulkActions />
            <ExportButton href="/api/export/payments" label="Export Payments" />
            <ExportButton href="/api/export/customers" label="Export Customers" />
          </div>
        </div>

        {/* ── Operational Stats ── single card with 4 segments ── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {[
              { label: "Active Contracts", value: stats.activeContracts, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/contracts" },
              { label: "Overdue", value: stats.overdueContracts, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", href: "/admin/contracts" },
              { label: "Completed", value: stats.completedContracts, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/contracts" },
              { label: "Customers", value: stats.totalCustomers, icon: Users, color: "text-purple-600", bg: "bg-purple-50", href: "/admin/customers" },
            ].map(({ label, value, icon: Icon, color, bg, href }) => (
              <Link key={label} href={href} className="flex items-center gap-3 p-4 sm:p-5 hover:bg-gray-50 transition-colors group">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Motorcycles row ── hidden on mobile, visible on desktop ── */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4">
          {[
            { label: "Total Bikes", value: stats.totalMotorcycles, sub: "in fleet", color: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" },
            { label: "Available", value: stats.availableMotorcycles, sub: "ready for sale", color: "bg-green-50", border: "border-green-200", text: "text-green-700" },
            { label: "Sold", value: stats.soldMotorcycles, sub: "on contract", color: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
          ].map(({ label, value, sub, color, border, text }) => (
            <Link key={label} href="/admin/motorcycles" className={`rounded-2xl p-4 ${color} border ${border} flex items-center justify-between hover:shadow-sm transition-shadow`}>
              <div>
                <p className={`text-2xl font-bold ${text}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <Bike className={`w-8 h-8 ${text} opacity-30`} />
            </Link>
          ))}
        </div>

        {/* ── Chart + Recent Payments ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Chart */}
          <div className="lg:col-span-3 rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Revenue Overview</h3>
                <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
              </div>
            </div>
            <AdminDashboardChart data={chartData} />
          </div>

          {/* Recent Payments */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Recent Payments</h3>
                <p className="text-xs text-gray-400 mt-0.5">Latest transactions</p>
              </div>
              <Link href="/admin/payments" className="text-xs font-medium text-red-600 hover:text-red-700">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stats.recentPayments.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">No payments yet</div>
              ) : (
                stats.recentPayments.map((p: any) => (
                  <div key={p._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-emerald-700 font-bold text-xs">
                        {p.customer?.fullName?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.customer?.fullName}</p>
                      <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-600 shrink-0">{formatCurrency(p.amount)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/admin/customers/new", icon: Users, label: "New Customer", color: "bg-blue-600" },
              { href: "/admin/motorcycles/new", icon: Bike, label: "Add Motorcycle", color: "bg-purple-600" },
              { href: "/admin/contracts/new", icon: FileText, label: "New Contract", color: "bg-orange-600" },
              { href: "/admin/payments", icon: CreditCard, label: "Record Payment", color: "bg-emerald-600" },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

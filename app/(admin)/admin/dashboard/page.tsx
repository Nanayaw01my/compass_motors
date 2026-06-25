import React from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Motorcycle from "@/lib/db/models/Motorcycle";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users, Bike, FileText, CreditCard, TrendingUp,
  AlertCircle, CheckCircle, Clock
} from "lucide-react";
import Link from "next/link";
import { AdminDashboardChart } from "@/components/admin/AdminDashboardChart";

async function getDashboardStats() {
  await connectDB();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalCustomers, activeCustomers,
    totalMotorcycles, availableMotorcycles, soldMotorcycles,
    activeContracts, completedContracts, overdueContracts,
    recentPayments, dailyPayments, weeklyPayments, monthlyPayments,
    outstandingBalance,
  ] = await Promise.all([
    Customer.countDocuments(),
    Customer.countDocuments({ status: "active" }),
    Motorcycle.countDocuments(),
    Motorcycle.countDocuments({ status: "available" }),
    Motorcycle.countDocuments({ status: "sold" }),
    Contract.countDocuments({ status: "active" }),
    Contract.countDocuments({ status: "completed" }),
    Contract.countDocuments({ status: "overdue" }),
    Payment.find({ status: "successful" }).sort({ createdAt: -1 }).limit(5)
      .populate("customer", "fullName customerId")
      .populate("contract", "contractNumber"),
    Payment.aggregate([
      { $match: { status: "successful", createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "successful", createdAt: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "successful", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Contract.aggregate([
      { $match: { status: { $in: ["active", "overdue"] } } },
      { $group: { _id: null, total: { $sum: "$remainingBalance" } } },
    ]),
  ]);

  const totalRevenue = await Payment.aggregate([
    { $match: { status: "successful" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return {
    totalCustomers, activeCustomers,
    totalMotorcycles, availableMotorcycles, soldMotorcycles,
    activeContracts, completedContracts, overdueContracts,
    recentPayments: JSON.parse(JSON.stringify(recentPayments)),
    dailyCollection: dailyPayments[0]?.total || 0,
    weeklyCollection: weeklyPayments[0]?.total || 0,
    monthlyCollection: monthlyPayments[0]?.total || 0,
    totalRevenue: totalRevenue[0]?.total || 0,
    outstandingBalance: outstandingBalance[0]?.total || 0,
  };
}

async function getMonthlyChartData() {
  await connectDB();
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const result = await Payment.aggregate([
      { $match: { status: "successful", createdAt: { $gte: d, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    months.push({
      month: d.toLocaleDateString("en-GH", { month: "short" }),
      revenue: result[0]?.total || 0,
    });
  }
  return months;
}

export default async function AdminDashboard() {
  const [stats, chartData] = await Promise.all([getDashboardStats(), getMonthlyChartData()]);

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: "success" | "warning" | "default"; label: string }> = {
      successful: { variant: "success", label: "Successful" },
      pending: { variant: "warning", label: "Pending" },
      failed: { variant: "default", label: "Failed" },
    };
    const s = map[status] || { variant: "default", label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <>
      <AdminHeader title="Dashboard" subtitle={`Welcome back! Here's your business overview`} />
      <div className="p-6 space-y-6">
        {/* Stats Row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} iconClassName="bg-blue-500" />
          <StatCard title="Active Customers" value={stats.activeCustomers} icon={Users} iconClassName="bg-green-500" />
          <StatCard title="Total Motorcycles" value={stats.totalMotorcycles} icon={Bike} iconClassName="bg-purple-500" />
          <StatCard title="Available" value={stats.availableMotorcycles} icon={Bike} iconClassName="bg-indigo-500" />
        </div>

        {/* Stats Row 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Contracts" value={stats.activeContracts} icon={FileText} iconClassName="bg-orange-500" />
          <StatCard title="Completed" value={stats.completedContracts} icon={CheckCircle} iconClassName="bg-green-600" />
          <StatCard title="Overdue" value={stats.overdueContracts} icon={AlertCircle} iconClassName="bg-red-600" />
          <StatCard title="Sold Motorcycles" value={stats.soldMotorcycles} icon={Bike} iconClassName="bg-gray-600" />
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={TrendingUp} iconClassName="bg-emerald-600" />
          <StatCard title="Monthly Collection" value={formatCurrency(stats.monthlyCollection)} icon={CreditCard} iconClassName="bg-teal-500" />
          <StatCard title="Weekly Collection" value={formatCurrency(stats.weeklyCollection)} icon={CreditCard} iconClassName="bg-cyan-500" />
          <StatCard title="Outstanding Balance" value={formatCurrency(stats.outstandingBalance)} icon={AlertCircle} iconClassName="bg-red-500" />
        </div>

        {/* Chart + Recent Payments */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminDashboardChart data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Payments</CardTitle>
                <Link href="/admin/payments" className="text-xs text-red-600 hover:underline">View all</Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {stats.recentPayments.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-400 text-sm">No payments yet</div>
                )}
                {stats.recentPayments.map((p: any) => (
                  <div key={p._id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900 truncate max-w-[120px]">
                        {p.customer?.fullName}
                      </span>
                      {statusBadge(p.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{formatDate(p.createdAt)}</span>
                      <span className="text-sm font-bold text-green-600">{formatCurrency(p.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: "/admin/customers/new", icon: Users, label: "New Customer", color: "bg-blue-50 text-blue-700" },
                { href: "/admin/motorcycles/new", icon: Bike, label: "Add Motorcycle", color: "bg-purple-50 text-purple-700" },
                { href: "/admin/contracts/new", icon: FileText, label: "New Contract", color: "bg-orange-50 text-orange-700" },
                { href: "/admin/payments", icon: CreditCard, label: "View Payments", color: "bg-green-50 text-green-700" },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${color} hover:opacity-80 transition-opacity`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium text-center">{label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

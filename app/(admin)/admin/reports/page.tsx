import React from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/db/connect";
import Payment from "@/lib/db/models/Payment";
import Contract from "@/lib/db/models/Contract";
import Customer from "@/lib/db/models/Customer";
import { formatCurrency } from "@/lib/utils";
import { FileBarChart, TrendingUp, Users, AlertCircle } from "lucide-react";

async function getReportData() {
  await connectDB();

  const now = new Date();
  const months = [];

  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const label = start.toLocaleDateString("en-GH", { month: "short", year: "numeric" });

    const [collected, customers, contracts] = await Promise.all([
      Payment.aggregate([
        { $match: { status: "successful", createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Customer.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Contract.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    ]);

    months.push({
      label,
      collected: collected[0]?.total || 0,
      payments: collected[0]?.count || 0,
      customers,
      contracts,
    });
  }

  const [totalRevenue, outstanding, defaulters] = await Promise.all([
    Payment.aggregate([{ $match: { status: "successful" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Contract.aggregate([{ $match: { status: { $in: ["active", "overdue"] } } }, { $group: { _id: null, total: { $sum: "$remainingBalance" } } }]),
    Contract.countDocuments({ status: "overdue" }),
  ]);

  return {
    months,
    totalRevenue: totalRevenue[0]?.total || 0,
    outstanding: outstanding[0]?.total || 0,
    defaulters,
  };
}

export default async function ReportsPage() {
  const { months, totalRevenue, outstanding, defaulters } = await getReportData();

  return (
    <>
      <AdminHeader title="Reports" subtitle="Financial and operational reports" />
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
            { label: "Outstanding", value: formatCurrency(outstanding), icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Overdue Accounts", value: defaulters, icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Months Tracked", value: "12", icon: FileBarChart, color: "text-blue-600", bg: "bg-blue-50" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monthly Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Collection Report (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Month</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Collected</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Payments</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">New Customers</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">New Contracts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {months.reverse().map((m) => (
                    <tr key={m.label} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{m.label}</td>
                      <td className="px-6 py-3 text-sm font-bold text-green-600 text-right">{formatCurrency(m.collected)}</td>
                      <td className="px-6 py-3 text-sm text-gray-700 text-right">{m.payments}</td>
                      <td className="px-6 py-3 text-sm text-gray-700 text-right">{m.customers}</td>
                      <td className="px-6 py-3 text-sm text-gray-700 text-right">{m.contracts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

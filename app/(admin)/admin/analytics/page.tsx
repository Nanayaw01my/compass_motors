import React from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/db/connect";
import Payment from "@/lib/db/models/Payment";
import Contract from "@/lib/db/models/Contract";
import Customer from "@/lib/db/models/Customer";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

async function getAnalyticsData() {
  await connectDB();
  const now = new Date();
  const monthlyData = [];

  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const label = start.toLocaleDateString("en-GH", { month: "short" });

    const [revenue, customers, contracts] = await Promise.all([
      Payment.aggregate([
        { $match: { status: "successful", createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Customer.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Contract.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    ]);

    monthlyData.push({ label, revenue: revenue[0]?.total || 0, customers, contracts });
  }

  const contractStatus = await Contract.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return {
    monthlyData,
    contractStatus: contractStatus.map((s) => ({ name: s._id, value: s.count })),
  };
}

export default async function AnalyticsPage() {
  const { monthlyData, contractStatus } = await getAnalyticsData();

  return (
    <>
      <AdminHeader title="Analytics" subtitle="Business performance insights" />
      <div className="p-6 space-y-6">
        <AnalyticsCharts monthlyData={monthlyData} contractStatus={contractStatus} />
      </div>
    </>
  );
}

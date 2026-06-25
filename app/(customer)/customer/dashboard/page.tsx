import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import { formatCurrency, formatDate, calculateProgress } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/Logo";
import { signOut } from "@/lib/auth";
import { CustomerDashboardHeader } from "@/components/customer/CustomerDashboardHeader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bike, CreditCard, Calendar, TrendingDown } from "lucide-react";

async function getCustomerData(userId: string) {
  await connectDB();

  const customer = await Customer.findById(userId).select("-password");
  if (!customer) return null;

  const contract = await Contract.findOne({ customer: userId, status: { $in: ["active", "overdue"] } })
    .populate("motorcycle")
    .sort({ createdAt: -1 });

  const recentPayments = await Payment.find({ customer: userId, status: "successful" })
    .sort({ createdAt: -1 })
    .limit(5);

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

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 pb-10">
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" white />
          <Link href="/customer/profile">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
              {customer.fullName.charAt(0)}
            </div>
          </Link>
        </div>
        <div>
          <p className="text-red-200 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold text-white">{customer.fullName}</h1>
          <p className="text-red-200 text-sm mt-1">Customer ID: {customer.customerId}</p>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4 pb-4">
        {/* Contract Card */}
        {contract ? (
          <Card className="shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-4">
                {moto?.images?.[0] ? (
                  <img src={moto.images[0]} alt={moto.model} className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-red-50 flex items-center justify-center">
                    <Bike className="w-8 h-8 text-red-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{moto?.brand} {moto?.model}</h3>
                  <p className="text-sm text-gray-500">{moto?.year}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={contract.status === "active" ? "success" : "warning"}>
                      {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-gray-400 font-mono">{contract.contractNumber}</span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Total Price</p>
                  <p className="font-bold text-gray-900">{formatCurrency(contract.sellingPrice)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Amount Paid</p>
                  <p className="font-bold text-green-600">{formatCurrency(contract.totalPaid)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Balance</p>
                  <p className="font-bold text-red-600">{formatCurrency(contract.remainingBalance)}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Progress</p>
                  <p className="font-bold text-blue-600">{progress}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Payment Progress</span>
                  <span>{progress}% complete</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              <Link href="/customer/payments">
                <Button className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Make Payment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <Bike className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No active contract</p>
              <p className="text-gray-400 text-sm">Contact Compass Motors at 0593920144</p>
            </CardContent>
          </Card>
        )}

        {/* Recent Payments */}
        {recentPayments.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Payments</CardTitle>
                <Link href="/customer/history" className="text-xs text-red-600 hover:underline">View all</Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentPayments.map((p: any) => (
                <div key={p._id} className="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-400">{p.receiptNumber}</p>
                    <Badge variant="success" className="text-xs">Paid</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Contact Card */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Need Help?</p>
            <a href="tel:0593920144" className="flex items-center gap-2 text-red-600 font-semibold hover:underline">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              0593920144
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

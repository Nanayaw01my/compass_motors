import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import Contract from "@/lib/db/models/Contract";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MakePaymentForm } from "@/components/customer/MakePaymentForm";
import { Bike } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { calculateProgress } from "@/lib/utils";

async function getActiveContract(userId: string) {
  await connectDB();
  const contract = await Contract.findOne({ customer: userId, status: { $in: ["active", "overdue"] } })
    .populate("motorcycle")
    .sort({ createdAt: -1 });
  return contract ? JSON.parse(JSON.stringify(contract)) : null;
}

export default async function CustomerPaymentsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const contract = await getActiveContract(userId);
  const moto = contract?.motorcycle;
  const progress = contract ? calculateProgress(contract.totalPaid, contract.sellingPrice) : 0;

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 pt-4">Make Payment</h1>

      {!contract ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bike className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No active contract found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                {moto?.images?.[0] ? (
                  <img src={moto.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center">
                    <Bike className="w-7 h-7 text-red-600" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900">{moto?.brand} {moto?.model}</p>
                  <p className="text-sm text-gray-500">{contract.contractNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="font-bold text-sm">{formatCurrency(contract.sellingPrice)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Paid</p>
                  <p className="font-bold text-sm text-green-600">{formatCurrency(contract.totalPaid)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Balance</p>
                  <p className="font-bold text-sm text-red-600">{formatCurrency(contract.remainingBalance)}</p>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-400 mt-1 text-center">{progress}% paid</p>
            </CardContent>
          </Card>

          <MakePaymentForm
            contractId={contract._id}
            remainingBalance={contract.remainingBalance}
            customerEmail={(session?.user as any)?.email || "customer@compassmotors.com"}
            customerId={(session?.user as any)?.id}
            suggestedAmount={contract.monthlyInstallment || contract.weeklyInstallment}
          />
        </>
      )}
    </div>
  );
}

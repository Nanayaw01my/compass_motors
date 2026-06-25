import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import Contract from "@/lib/db/models/Contract";
import { formatCurrency, calculateProgress } from "@/lib/utils";
import { MakePaymentForm } from "@/components/customer/MakePaymentForm";
import { Bike } from "lucide-react";

async function getActiveContract(userId: string) {
  await connectDB();
  const contract = await Contract.findOne({ customer: userId, status: { $in: ["active", "overdue"] } })
    .populate("motorcycle").sort({ createdAt: -1 });
  return contract ? JSON.parse(JSON.stringify(contract)) : null;
}

export default async function CustomerPaymentsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const contract = await getActiveContract(userId);
  const moto = contract?.motorcycle;
  const progress = contract ? calculateProgress(contract.totalPaid, contract.sellingPrice) : 0;
  const isOverdue = contract?.status === "overdue";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden pb-14" style={{ background: "linear-gradient(145deg, #DC2626 0%, #7f1d1d 100%)" }}>
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-[0.07]" style={{ background: "white", transform: "translate(40%,-40%)" }} />
        <div className="relative px-5 pt-6 pb-2">
          <h1 className="text-white font-bold text-xl">Make Payment</h1>
          <p className="text-red-200 text-sm mt-0.5">Pay towards your motorcycle installment</p>
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
            {/* Contract summary */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between ${isOverdue ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                <span>{isOverdue ? "Payment Overdue" : "Contract Active"}</span>
                <span className="font-mono opacity-60">{contract.contractNumber}</span>
              </div>
              <div className="p-5">
                {/* Bike info */}
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
                <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-center mb-4">
                  <p className="text-xs text-red-500 font-medium mb-1">Outstanding Balance</p>
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(contract.remainingBalance)}</p>
                </div>

                {/* Stats row */}
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

                {/* Progress */}
                <div className="mb-1">
                  <div className="flex items-center justify-between mb-1.5 text-xs text-gray-500">
                    <span>Payment progress</span><span className="font-bold text-gray-700">{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isOverdue ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment form */}
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
    </div>
  );
}

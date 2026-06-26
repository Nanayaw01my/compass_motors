import React from "react";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { connectDB } from "@/lib/db/connect";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import { formatCurrency, formatDate, formatDateTime, calculateProgress } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { RecordPaymentForm } from "@/components/admin/RecordPaymentForm";
import { SendReminderButton } from "@/components/admin/SendReminderButton";
import Link from "next/link";
import { Users, Bike, CreditCard } from "lucide-react";

async function getContractDetails(id: string) {
  await connectDB();
  const contract = await Contract.findById(id)
    .populate("customer", "fullName customerId phone email")
    .populate("motorcycle", "brand model year images sellingPrice installmentPrice");
  if (!contract) return null;

  const payments = await Payment.find({ contract: id, status: "successful" }).sort({ createdAt: -1 });

  return {
    contract: JSON.parse(JSON.stringify(contract)),
    payments: JSON.parse(JSON.stringify(payments)),
  };
}

const statusConfig: Record<string, { variant: "success" | "warning" | "default" | "secondary" | "destructive" }> = {
  active: { variant: "success" },
  completed: { variant: "secondary" },
  overdue: { variant: "destructive" },
  suspended: { variant: "warning" },
  cancelled: { variant: "default" },
};

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getContractDetails(id);
  if (!data) notFound();

  const { contract, payments } = data;
  const moto = contract.motorcycle;
  const customer = contract.customer;
  const progress = calculateProgress(contract.totalPaid, contract.sellingPrice);
  const sc = statusConfig[contract.status] || { variant: "default" };

  return (
    <>
      <AdminHeader title={contract.contractNumber} subtitle={`${customer?.fullName} · ${moto?.brand} ${moto?.model}`} />
      <div className="p-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contract Overview */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  {moto?.images?.[0] ? (
                    <img src={moto.images[0]} alt="" className="w-20 h-20 rounded-xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-red-50 flex items-center justify-center">
                      <Bike className="w-10 h-10 text-red-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono font-bold text-red-600">{contract.contractNumber}</span>
                      <Badge variant={sc.variant}>{contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}</Badge>
                      <Badge variant="outline">{contract.contractType === "work-and-pay" ? "Work & Pay" : "Installment"}</Badge>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">{moto?.brand} {moto?.model} ({moto?.year})</p>
                    <Link href={`/admin/customers/${customer?._id}`} className="text-sm text-red-600 hover:underline">
                      {customer?.fullName} · {customer?.customerId}
                    </Link>
                    <p className="text-sm text-gray-500">{customer?.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Contract Price</p>
                    <p className="font-bold text-gray-900">{formatCurrency(contract.sellingPrice)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Down Payment</p>
                    <p className="font-bold text-blue-600">{formatCurrency(contract.downPayment)}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Total Paid</p>
                    <p className="font-bold text-green-600">{formatCurrency(contract.totalPaid)}</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Balance</p>
                    <p className="font-bold text-red-600">{formatCurrency(contract.remainingBalance)}</p>
                  </div>
                </div>

                {contract.weeklyInstallment && (
                  <p className="text-sm text-gray-500 mb-1">Weekly installment: <strong>{formatCurrency(contract.weeklyInstallment)}</strong></p>
                )}
                {contract.monthlyInstallment && (
                  <p className="text-sm text-gray-500 mb-3">Monthly installment: <strong>{formatCurrency(contract.monthlyInstallment)}</strong></p>
                )}

                <div className="flex items-center gap-3">
                  <Progress value={progress} className="flex-1" />
                  <span className="text-sm font-bold text-gray-700">{progress}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Started: {formatDate(contract.startDate)}</span>
                  <span>Progress: {formatCurrency(contract.totalPaid)} / {formatCurrency(contract.sellingPrice)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4 text-red-600" /> Payment History ({payments.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                {payments.length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">No payments recorded yet</div>
                ) : (
                  payments.map((p: any) => (
                    <div key={p._id} className="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-bold text-green-600">{formatCurrency(p.amount)}</p>
                        <p className="text-xs text-gray-400">{formatDateTime(p.createdAt)}</p>
                        <p className="text-xs text-gray-400">{p.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-gray-400">{p.receiptNumber}</p>
                        <p className="text-xs text-red-500">Bal: {formatCurrency(p.balanceAfter)}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column: Record Payment + Reminders */}
          <div className="space-y-4">
            {contract.status === "active" && (
              <RecordPaymentForm
                contractId={contract._id}
                remainingBalance={contract.remainingBalance}
                weeklyAmount={contract.weeklyInstallment}
                monthlyAmount={contract.monthlyInstallment}
              />
            )}

            {/* SMS Reminders — available for active and overdue contracts */}
            {["active", "overdue"].includes(contract.status) && customer?.phone && (
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  SMS Reminders
                </p>
                <p className="text-xs text-gray-400 mb-3">{customer.phone}</p>
                <SendReminderButton
                  phone={customer.phone}
                  name={customer.fullName}
                  installmentAmount={contract.weeklyInstallment || contract.monthlyInstallment}
                  remainingBalance={contract.remainingBalance}
                  contractStatus={contract.status}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

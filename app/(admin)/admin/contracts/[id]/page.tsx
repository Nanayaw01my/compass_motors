import React from "react";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { connectDB } from "@/lib/db/connect";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import { formatCurrency, formatDate, formatDateTime, calculateProgress } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { RecordPaymentForm } from "@/components/admin/RecordPaymentForm";
import { SendReminderButton } from "@/components/admin/SendReminderButton";
import { ContractActions } from "@/components/admin/ContractActions";
import Link from "next/link";
import { Users, Bike, CreditCard, Calendar, ExternalLink } from "lucide-react";

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

  const nextDue = contract.nextPaymentDate ? new Date(contract.nextPaymentDate) : null;
  const isNextDueOverdue = nextDue && nextDue < new Date();

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
                  <ContractActions
                    contractId={contract._id}
                    status={contract.status}
                    currentNotes={contract.notes}
                  />
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
                <div className="flex justify-between text-xs text-gray-400 mt-1 mb-3">
                  <span>Started: {formatDate(contract.startDate)}</span>
                  <span>Progress: {formatCurrency(contract.totalPaid)} / {formatCurrency(contract.sellingPrice)}</span>
                </div>

                {/* Next payment due */}
                {nextDue && (
                  <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 mb-3 text-sm font-semibold ${
                    isNextDueOverdue
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>
                      {isNextDueOverdue ? "Payment overdue since " : "Next payment due: "}
                      <strong>{formatDate(nextDue)}</strong>
                    </span>
                    {contract.weeklyInstallment && (
                      <span className="ml-auto text-xs font-medium opacity-70">Weekly · {formatCurrency(contract.weeklyInstallment)}</span>
                    )}
                    {contract.monthlyInstallment && (
                      <span className="ml-auto text-xs font-medium opacity-70">Monthly · {formatCurrency(contract.monthlyInstallment)}</span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {contract.notes && (
                  <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5 mb-3 text-sm text-amber-800">
                    <span className="font-semibold">Note: </span>{contract.notes}
                  </div>
                )}

                {/* SMS Reminder — always visible if customer has a phone */}
                {customer?.phone && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">
                      Send SMS to <span className="font-medium text-gray-600">{customer.phone}</span>
                    </p>
                    <SendReminderButton
                      phone={customer.phone}
                      name={customer.fullName}
                      installmentAmount={contract.weeklyInstallment || contract.monthlyInstallment}
                      remainingBalance={contract.remainingBalance}
                      contractStatus={contract.status}
                    />
                  </div>
                )}
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
                        <p className="text-xs text-gray-400 capitalize">{p.paymentMethod.replace(/-/g, " ")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-gray-400">{p.receiptNumber}</p>
                        <p className="text-xs text-red-500 mb-1">Bal: {formatCurrency(p.balanceAfter)}</p>
                        <Link
                          href={`/api/receipts/${p._id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />Receipt
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column: Record Payment */}
          {contract.status === "active" && (
            <div>
              <RecordPaymentForm
                contractId={contract._id}
                remainingBalance={contract.remainingBalance}
                weeklyAmount={contract.weeklyInstallment}
                monthlyAmount={contract.monthlyInstallment}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

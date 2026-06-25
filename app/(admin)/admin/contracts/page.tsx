import React from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { connectDB } from "@/lib/db/connect";
import Contract from "@/lib/db/models/Contract";
import { formatCurrency, formatDate, calculateProgress } from "@/lib/utils";
import { Plus, FileText } from "lucide-react";

async function getContracts() {
  await connectDB();
  const contracts = await Contract.find()
    .populate("customer", "fullName customerId phone")
    .populate("motorcycle", "brand model year images")
    .sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(contracts));
}

const statusConfig: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  active:    { dot: "bg-emerald-500", bg: "bg-emerald-50",  text: "text-emerald-700", label: "Active" },
  completed: { dot: "bg-blue-500",    bg: "bg-blue-50",     text: "text-blue-700",    label: "Completed" },
  overdue:   { dot: "bg-red-500",     bg: "bg-red-50",      text: "text-red-700",     label: "Overdue" },
  suspended: { dot: "bg-amber-500",   bg: "bg-amber-50",    text: "text-amber-700",   label: "Suspended" },
  cancelled: { dot: "bg-gray-400",    bg: "bg-gray-50",     text: "text-gray-600",    label: "Cancelled" },
};

export default async function ContractsPage() {
  const contracts = await getContracts();
  const counts = contracts.reduce((acc: any, c: any) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});

  return (
    <>
      <AdminHeader title="Contracts" subtitle={`${contracts.length} total`} />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Summary chips */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {Object.entries(counts).map(([status, count]: any) => {
              const s = statusConfig[status];
              if (!s) return null;
              return (
                <span key={status} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{count} {s.label}
                </span>
              );
            })}
          </div>
          <Link href="/admin/contracts/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shrink-0">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">New Contract</span><span className="sm:hidden">New</span>
          </Link>
        </div>

        {contracts.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">No contracts yet</p>
            <Link href="/admin/contracts/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">
              <Plus className="w-4 h-4" /> Create Contract
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map((c: any) => {
              const progress = calculateProgress(c.totalPaid, c.sellingPrice);
              const s = statusConfig[c.status] || statusConfig.cancelled;
              return (
                <div key={c._id} className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Status accent bar */}
                  <div className={`h-1 ${s.dot}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Header row */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-bold text-gray-900">{c.contractNumber}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                            {c.contractType === "work-and-pay" ? "Work & Pay" : "Installment"}
                          </span>
                        </div>

                        {/* Customer + bike */}
                        <p className="font-bold text-gray-900 text-base">{c.customer?.fullName}</p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {c.motorcycle?.brand} {c.motorcycle?.model} · {c.motorcycle?.year}
                          {c.customer?.customerId && <span className="ml-2 font-mono">{c.customer.customerId}</span>}
                        </p>

                        {/* Financials */}
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Selling Price</p>
                            <p className="font-bold text-gray-900 text-sm">{formatCurrency(c.sellingPrice)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Amount Paid</p>
                            <p className="font-bold text-emerald-600 text-sm">{formatCurrency(c.totalPaid)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Balance</p>
                            <p className="font-bold text-red-600 text-sm">{formatCurrency(c.remainingBalance)}</p>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">Progress</span>
                            <span className="text-xs font-bold text-gray-700">{progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${s.dot}`} style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/admin/contracts/${c._id}`}
                        className="shrink-0 px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

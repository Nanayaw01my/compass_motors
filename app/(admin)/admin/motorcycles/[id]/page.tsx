import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { connectDB } from "@/lib/db/connect";
import Motorcycle from "@/lib/db/models/Motorcycle";
import Contract from "@/lib/db/models/Contract";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Bike, ArrowLeft, FileText } from "lucide-react";

const statusStyles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  available: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Available" },
  reserved:  { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   label: "Reserved" },
  sold:      { bg: "bg-gray-100",   text: "text-gray-600",    dot: "bg-gray-400",    label: "Sold" },
};

const contractStatus: Record<string, { bg: string; text: string; dot: string }> = {
  active:    { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  completed: { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500" },
  overdue:   { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  suspended: { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500" },
  cancelled: { bg: "bg-gray-100",   text: "text-gray-600",    dot: "bg-gray-400" },
};

async function getData(id: string) {
  await connectDB();
  const moto = await Motorcycle.findById(id);
  if (!moto) return null;
  const contracts = await Contract.find({ motorcycle: id })
    .populate("customer", "fullName customerId phone")
    .sort({ createdAt: -1 });
  return {
    moto: JSON.parse(JSON.stringify(moto)),
    contracts: JSON.parse(JSON.stringify(contracts)),
  };
}

export default async function MotorcycleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();

  const { moto, contracts } = data;
  const s = statusStyles[moto.status] || statusStyles.sold;

  return (
    <>
      <AdminHeader
        title={`${moto.brand} ${moto.model}`}
        subtitle={`${moto.year}${moto.color ? ` · ${moto.color}` : ""}`}
      />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Back */}
        <Link
          href="/admin/motorcycles"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Motorcycles
        </Link>

        {/* Image + overview */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          {moto.images?.[0] ? (
            <img src={moto.images[0]} alt={moto.model} className="w-full h-52 object-cover" />
          ) : (
            <div className="w-full h-40 flex items-center justify-center bg-gray-50">
              <Bike className="w-16 h-16 text-gray-200" />
            </div>
          )}

          <div className="p-5">
            {/* Title + status */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-xl leading-tight">{moto.brand} {moto.model}</h2>
                <p className="text-gray-400 text-sm mt-0.5">{moto.year}{moto.color ? ` · ${moto.color}` : ""}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${s.bg} ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </span>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400 mb-1">Selling Price</p>
                <p className="font-bold text-gray-900 text-lg">{formatCurrency(moto.sellingPrice)}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-xs text-gray-400 mb-1">Installment Price</p>
                <p className="font-bold text-red-600 text-lg">{formatCurrency(moto.installmentPrice)}</p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm border-t border-gray-100 pt-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Quantity</p>
                <p className="font-semibold text-gray-900">{moto.quantity}</p>
              </div>
              {moto.engineNumber && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Engine No.</p>
                  <p className="font-semibold text-gray-900 font-mono text-xs">{moto.engineNumber}</p>
                </div>
              )}
              {moto.chassisNumber && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Chassis No.</p>
                  <p className="font-semibold text-gray-900 font-mono text-xs">{moto.chassisNumber}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Added</p>
                <p className="font-semibold text-gray-900">{formatDate(moto.createdAt)}</p>
              </div>
            </div>

            {moto.description && (
              <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100 leading-relaxed">{moto.description}</p>
            )}
          </div>
        </div>

        {/* Contracts */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <FileText className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-gray-900 text-sm">Contracts ({contracts.length})</h3>
          </div>

          {contracts.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">No contracts for this motorcycle yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {contracts.map((c: any) => {
                const cs = contractStatus[c.status] || contractStatus.cancelled;
                return (
                  <div key={c._id} className="flex items-center justify-between px-5 py-4 gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-sm font-bold text-gray-900">{c.contractNumber}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cs.bg} ${cs.text}`}>
                          <span className={`w-1 h-1 rounded-full ${cs.dot}`} />
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{c.customer?.fullName}</p>
                      <p className="text-xs text-gray-400">{formatCurrency(c.remainingBalance)} remaining</p>
                    </div>
                    <Link
                      href={`/admin/contracts/${c._id}`}
                      className="shrink-0 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

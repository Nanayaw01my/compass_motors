import React from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { connectDB } from "@/lib/db/connect";
import Contract from "@/lib/db/models/Contract";
import { formatCurrency, formatDate, calculateProgress } from "@/lib/utils";
import { Plus, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

async function getContracts() {
  await connectDB();
  const contracts = await Contract.find()
    .populate("customer", "fullName customerId phone")
    .populate("motorcycle", "brand model year images")
    .sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(contracts));
}

const statusConfig: Record<string, { variant: "success" | "warning" | "default" | "secondary" | "destructive"; label: string }> = {
  active: { variant: "success", label: "Active" },
  completed: { variant: "secondary", label: "Completed" },
  overdue: { variant: "destructive", label: "Overdue" },
  suspended: { variant: "warning", label: "Suspended" },
  cancelled: { variant: "default", label: "Cancelled" },
};

export default async function ContractsPage() {
  const contracts = await getContracts();

  return (
    <>
      <AdminHeader title="Contracts" subtitle={`${contracts.length} contracts total`} />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Link href="/admin/contracts/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Contract
            </Button>
          </Link>
        </div>

        {contracts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No contracts yet</p>
              <Link href="/admin/contracts/new" className="mt-4 inline-block">
                <Button size="sm">Create Contract</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {contracts.map((c: any) => {
              const progress = calculateProgress(c.totalPaid, c.sellingPrice);
              const s = statusConfig[c.status] || { variant: "default", label: c.status };
              return (
                <Card key={c._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-red-600">{c.contractNumber}</span>
                          <Badge variant={s.variant}>{s.label}</Badge>
                          <Badge variant="outline">{c.contractType === "work-and-pay" ? "Work & Pay" : "Installment"}</Badge>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{c.customer?.fullName}</p>
                          <p className="text-sm text-gray-500">{c.motorcycle?.brand} {c.motorcycle?.model} · {c.motorcycle?.year}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div><span className="text-gray-400">Price: </span><span className="font-semibold">{formatCurrency(c.sellingPrice)}</span></div>
                          <div><span className="text-gray-400">Paid: </span><span className="font-semibold text-green-600">{formatCurrency(c.totalPaid)}</span></div>
                          <div><span className="text-gray-400">Balance: </span><span className="font-semibold text-red-600">{formatCurrency(c.remainingBalance)}</span></div>
                          <div><span className="text-gray-400">Started: </span><span>{formatDate(c.startDate)}</span></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="flex-1 h-2" />
                          <span className="text-xs font-semibold text-gray-600">{progress}%</span>
                        </div>
                      </div>
                      <Link href={`/admin/contracts/${c._id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

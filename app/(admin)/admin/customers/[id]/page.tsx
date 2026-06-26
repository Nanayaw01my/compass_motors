import React from "react";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import { formatCurrency, formatDate, formatDateTime, calculateProgress } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { CustomerActions } from "@/components/admin/CustomerActions";
import Link from "next/link";
import { User, Phone, MapPin, Shield, AlertCircle, FileText, CreditCard } from "lucide-react";

async function getCustomerDetails(id: string) {
  await connectDB();
  const customer = await Customer.findById(id).select("-password");
  if (!customer) return null;

  const contracts = await Contract.find({ customer: id })
    .populate("motorcycle", "brand model year images")
    .sort({ createdAt: -1 });

  const payments = await Payment.find({ customer: id, status: "successful" })
    .sort({ createdAt: -1 })
    .limit(20);

  return {
    customer: JSON.parse(JSON.stringify(customer)),
    contracts: JSON.parse(JSON.stringify(contracts)),
    payments: JSON.parse(JSON.stringify(payments)),
  };
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCustomerDetails(id);
  if (!data) notFound();

  const { customer, contracts, payments } = data;
  const activeContract = contracts.find((c: any) => c.status === "active");
  const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

  return (
    <>
      <AdminHeader title={customer.fullName} subtitle={`${customer.customerId} · ${customer.phone}`} />
      <div className="p-6 space-y-6">
        {/* Profile Card */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-6 text-center">
              {customer.passportPhoto ? (
                <img src={customer.passportPhoto} alt="" className="w-24 h-24 rounded-full object-cover mx-auto mb-3" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-red-600">
                    {customer.fullName.trim().split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <h2 className="font-bold text-lg text-gray-900 mb-1">{customer.fullName}</h2>
              <p className="text-gray-500 text-sm mb-2">{customer.customerId}</p>
              <Badge variant={customer.status === "active" ? "success" : customer.status === "suspended" ? "warning" : "default"}>
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </Badge>
              <div className="mt-4 text-sm text-gray-500">
                <p>Member since {formatDate(customer.createdAt)}</p>
              </div>
              <div className="mt-4 space-y-2">
                <CustomerActions customerId={id} currentStatus={customer.status} />
                <Link
                  href={`/api/statements/${id}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full h-9 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors"
                >
                  View Statement
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{contracts.length}</p>
                <p className="text-xs text-gray-500 mt-1">Contracts</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-lg font-bold text-green-600 truncate">{formatCurrency(totalPaid)}</p>
                <p className="text-xs text-gray-500 mt-1">Total Paid</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{payments.length}</p>
                <p className="text-xs text-gray-500 mt-1">Payments</p>
              </CardContent></Card>
            </div>

            {/* Personal Info */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-red-600" /> Personal Information</CardTitle></CardHeader>
              <CardContent className="p-0">
                {[
                  { label: "Phone", value: customer.phone },
                  { label: "Alt. Phone", value: customer.altPhone },
                  { label: "Email", value: customer.email },
                  { label: "Gender", value: customer.gender },
                  { label: "Occupation", value: customer.occupation },
                  { label: "Date of Birth", value: customer.dateOfBirth ? formatDate(customer.dateOfBirth) : null },
                  { label: "Address", value: customer.residentialAddress },
                  { label: "GPS", value: customer.gpsAddress },
                  { label: "Ghana Card", value: customer.ghanaCardNumber },
                ].filter((r) => r.value).map((row) => (
                  <div key={row.label} className="flex justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-400">{row.label}</span>
                    <span className="text-sm font-medium text-gray-900">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ID Documents */}
        {(customer.ghanaCardFront || customer.ghanaCardBack || customer.passportPhoto) && (
          <Card>
            <CardHeader><CardTitle className="text-base">Identity Documents</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Ghana Card Front", url: customer.ghanaCardFront },
                  { label: "Ghana Card Back", url: customer.ghanaCardBack },
                  { label: "Passport Photo", url: customer.passportPhoto },
                ].filter((d) => d.url).map((doc) => (
                  <div key={doc.label}>
                    <p className="text-xs text-gray-400 mb-1">{doc.label}</p>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <img src={doc.url} alt={doc.label} className="w-full aspect-video object-cover rounded-lg border hover:opacity-90 transition-opacity" />
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact & Guarantor */}
        {customer.emergencyName && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-600" /> Emergency Contact</CardTitle></CardHeader>
              <CardContent className="p-0">
                {[
                  { label: "Name", value: customer.emergencyName },
                  { label: "Relationship", value: customer.emergencyRelationship },
                  { label: "Phone", value: customer.emergencyPhone },
                ].filter((r) => r.value).map((r) => (
                  <div key={r.label} className="flex justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-400">{r.label}</span>
                    <span className="text-sm font-medium">{r.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            {customer.guarantorName && (
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-red-600" /> Guarantor</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {[
                    { label: "Name", value: customer.guarantorName },
                    { label: "Phone", value: customer.guarantorPhone },
                    { label: "Occupation", value: customer.guarantorOccupation },
                  ].filter((r) => r.value).map((r) => (
                    <div key={r.label} className="flex justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-400">{r.label}</span>
                      <span className="text-sm font-medium">{r.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Contracts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-red-600" /> Contracts</CardTitle>
              <Link href={`/admin/contracts/new`}>
                <Button size="sm">New Contract</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {contracts.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No contracts yet</div>
            ) : (
              contracts.map((c: any) => {
                const prog = calculateProgress(c.totalPaid, c.sellingPrice);
                return (
                  <div key={c._id} className="px-5 py-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-semibold text-red-600">{c.contractNumber}</span>
                      <Badge variant={c.status === "active" ? "success" : c.status === "completed" ? "secondary" : "warning"}>
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{c.motorcycle?.brand} {c.motorcycle?.model} ({c.motorcycle?.year})</p>
                    <div className="grid grid-cols-3 gap-3 text-xs mb-2">
                      <div><span className="text-gray-400">Price: </span><span className="font-semibold">{formatCurrency(c.sellingPrice)}</span></div>
                      <div><span className="text-gray-400">Paid: </span><span className="font-semibold text-green-600">{formatCurrency(c.totalPaid)}</span></div>
                      <div><span className="text-gray-400">Bal: </span><span className="font-semibold text-red-600">{formatCurrency(c.remainingBalance)}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={prog} className="flex-1 h-1.5" />
                      <span className="text-xs text-gray-500">{prog}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4 text-red-600" /> Payment History</CardTitle></CardHeader>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No payments yet</div>
            ) : (
              payments.map((p: any) => (
                <div key={p._id} className="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-green-600">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(p.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-400">{p.receiptNumber}</p>
                    <p className="text-xs text-gray-400">Bal: {formatCurrency(p.balanceAfter)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

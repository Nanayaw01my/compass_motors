"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { FileText, AlertCircle } from "lucide-react";

interface Props {
  customers: { _id: string; fullName: string; customerId: string; phone: string }[];
  motorcycles: { _id: string; brand: string; model: string; year: number; sellingPrice: number; installmentPrice: number }[];
}

export function NewContractForm({ customers, motorcycles }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customer: "", motorcycle: "", contractType: "installment",
    sellingPrice: "", downPayment: "", weeklyInstallment: "", monthlyInstallment: "",
    startDate: new Date().toISOString().split("T")[0], notes: "",
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const selectedMoto = motorcycles.find((m) => m._id === form.motorcycle);
  const balance = Math.max(0, parseFloat(form.sellingPrice || "0") - parseFloat(form.downPayment || "0"));

  useEffect(() => {
    if (selectedMoto) {
      set("sellingPrice", selectedMoto.installmentPrice.toString());
    }
  }, [form.motorcycle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer || !form.motorcycle || !form.sellingPrice) {
      setError("Customer, motorcycle, and price are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form.customer,
          motorcycle: form.motorcycle,
          contractType: form.contractType,
          sellingPrice: parseFloat(form.sellingPrice),
          downPayment: parseFloat(form.downPayment || "0"),
          weeklyInstallment: form.weeklyInstallment ? parseFloat(form.weeklyInstallment) : undefined,
          monthlyInstallment: form.monthlyInstallment ? parseFloat(form.monthlyInstallment) : undefined,
          startDate: form.startDate,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/admin/contracts");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" /> Contract Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div>
            <Label>Customer *</Label>
            <Select value={form.customer} onValueChange={(v) => set("customer", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.fullName} · {c.customerId} · {c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Motorcycle *</Label>
            <Select value={form.motorcycle} onValueChange={(v) => set("motorcycle", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select motorcycle" /></SelectTrigger>
              <SelectContent>
                {motorcycles.map((m) => (
                  <SelectItem key={m._id} value={m._id}>
                    {m.brand} {m.model} ({m.year}) · {formatCurrency(m.installmentPrice)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Contract Type *</Label>
            <Select value={form.contractType} onValueChange={(v) => set("contractType", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="installment">Installment</SelectItem>
                <SelectItem value="work-and-pay">Work-and-Pay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Total Contract Price (GHS) *</Label>
              <Input value={form.sellingPrice} onChange={(e) => set("sellingPrice", e.target.value)} type="number" min="0" step="0.01" className="mt-1" required />
            </div>
            <div>
              <Label>Down Payment (GHS)</Label>
              <Input value={form.downPayment} onChange={(e) => set("downPayment", e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className="mt-1" />
            </div>
            <div>
              <Label>Weekly Installment (GHS)</Label>
              <Input value={form.weeklyInstallment} onChange={(e) => set("weeklyInstallment", e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className="mt-1" />
            </div>
            <div>
              <Label>Monthly Installment (GHS)</Label>
              <Input value={form.monthlyInstallment} onChange={(e) => set("monthlyInstallment", e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Contract Start Date</Label>
            <Input value={form.startDate} onChange={(e) => set("startDate", e.target.value)} type="date" className="mt-1" />
          </div>

          {/* Balance Preview */}
          {form.sellingPrice && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h4 className="font-semibold text-gray-700 text-sm">Contract Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Total Price</p>
                  <p className="font-bold text-gray-900">{formatCurrency(parseFloat(form.sellingPrice || "0"))}</p>
                </div>
                <div>
                  <p className="text-gray-400">Down Payment</p>
                  <p className="font-bold text-green-600">{formatCurrency(parseFloat(form.downPayment || "0"))}</p>
                </div>
                <div>
                  <p className="text-gray-400">Balance</p>
                  <p className="font-bold text-red-600">{formatCurrency(balance)}</p>
                </div>
              </div>
            </div>
          )}

          <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Additional notes..." className="mt-1" /></div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" loading={loading}>Create Contract</Button>
      </div>
    </form>
  );
}

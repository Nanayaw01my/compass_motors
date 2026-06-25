"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, CheckCircle } from "lucide-react";

interface Props {
  contractId: string;
  remainingBalance: number;
  weeklyAmount?: number;
  monthlyAmount?: number;
}

export function RecordPaymentForm({ contractId, remainingBalance, weeklyAmount, monthlyAmount }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount"); return; }
    if (amt > remainingBalance) { setError("Amount exceeds balance"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, amount: amt, paymentMethod: method, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data.receiptNumber);
      setAmount("");
      setNotes("");
      setTimeout(() => { setSuccess(""); router.refresh(); }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-red-600" /> Record Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="text-center py-4">
            <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
            <p className="text-green-700 font-semibold">Payment recorded!</p>
            <p className="text-xs font-mono text-gray-400 mt-1">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Outstanding Balance</p>
              <p className="font-bold text-red-600 text-xl">{formatCurrency(remainingBalance)}</p>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div>
              <Label className="text-xs">Amount (GHS)</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="1" step="0.01" placeholder="0.00" className="mt-1" required />
            </div>

            {(weeklyAmount || monthlyAmount) && (
              <div className="flex gap-2">
                {weeklyAmount && (
                  <button type="button" onClick={() => setAmount(weeklyAmount.toString())}
                    className="flex-1 text-xs py-1.5 border border-gray-200 rounded-lg hover:border-red-400 hover:text-red-600">
                    Weekly: {formatCurrency(weeklyAmount)}
                  </button>
                )}
                {monthlyAmount && (
                  <button type="button" onClick={() => setAmount(monthlyAmount.toString())}
                    className="flex-1 text-xs py-1.5 border border-gray-200 rounded-lg hover:border-red-400 hover:text-red-600">
                    Monthly: {formatCurrency(monthlyAmount)}
                  </button>
                )}
              </div>
            )}

            <div>
              <Label className="text-xs">Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobile-money">Mobile Money</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes..." className="mt-1 min-h-[60px] text-sm" />
            </div>

            <Button type="submit" loading={loading} className="w-full">Record Payment</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

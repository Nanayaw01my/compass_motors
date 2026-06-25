"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, CheckCircle } from "lucide-react";

interface Props {
  contractId: string;
  remainingBalance: number;
  customerEmail: string;
  customerId: string;
  suggestedAmount?: number;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

export function MakePaymentForm({ contractId, remainingBalance, customerEmail, customerId, suggestedAmount }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState(suggestedAmount?.toString() || "");
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ receiptNumber: string; balanceAfter: number } | null>(null);
  const [error, setError] = useState("");

  const handleCashPayment = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount"); return; }
    if (amt > remainingBalance) { setError("Amount exceeds remaining balance"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, amount: amt, paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess({ receiptNumber: data.receiptNumber, balanceAfter: data.balanceAfter });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackPayment = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount"); return; }
    if (amt > remainingBalance) { setError("Amount exceeds remaining balance"); return; }

    setError("");

    const reference = `CM-${customerId}-${Date.now()}`;
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: customerEmail,
      amount: Math.round(amt * 100),
      ref: reference,
      currency: "GHS",
      metadata: { contractId, customerId },
      callback: async (response: { reference: string }) => {
        setLoading(true);
        try {
          const verifyRes = await fetch(`/api/payments/verify?reference=${response.reference}`);
          const verifyData = await verifyRes.json();

          if (verifyData.data?.status === "success") {
            const payRes = await fetch("/api/payments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contractId,
                amount: amt,
                paymentMethod: "paystack",
                paystackReference: response.reference,
              }),
            });
            const payData = await payRes.json();
            if (!payRes.ok) throw new Error(payData.error);
            setSuccess({ receiptNumber: payData.receiptNumber, balanceAfter: payData.balanceAfter });
          } else {
            setError("Payment verification failed");
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      onClose: () => {},
    });
    handler.openIframe();
  };

  if (success) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
          <p className="text-gray-500">Your payment has been recorded.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Receipt</span>
              <span className="font-mono font-semibold">{success.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">New Balance</span>
              <span className="font-bold text-red-600">{formatCurrency(success.balanceAfter)}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/customer/history")}>
              View History
            </Button>
            <Button className="flex-1" onClick={() => { setSuccess(null); setAmount(""); }}>
              Pay Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <script src="https://js.paystack.co/v1/inline.js" async />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-5 h-5 text-red-600" /> Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paystack">Paystack (Card / Mobile Money)</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mobile-money">Mobile Money (Manual)</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Amount (GHS)</Label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="1"
              max={remainingBalance}
              step="0.01"
              placeholder="Enter amount"
              className="mt-1"
            />
            {suggestedAmount && (
              <button
                type="button"
                onClick={() => setAmount(suggestedAmount.toString())}
                className="text-xs text-red-600 mt-1 hover:underline"
              >
                Use suggested: {formatCurrency(suggestedAmount)}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {["50", "100", "200", "500"].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setAmount(quick)}
                className="flex-1 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:border-red-400 hover:text-red-600 transition-colors"
              >
                GHS {quick}
              </button>
            ))}
          </div>

          <Button
            className="w-full"
            loading={loading}
            onClick={paymentMethod === "paystack" ? handlePaystackPayment : handleCashPayment}
          >
            {paymentMethod === "paystack" ? "Pay with Paystack" : `Record Payment of ${amount ? formatCurrency(parseFloat(amount)) : "..."}`}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

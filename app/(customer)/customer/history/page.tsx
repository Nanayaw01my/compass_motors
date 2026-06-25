import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import Payment from "@/lib/db/models/Payment";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

async function getPaymentHistory(userId: string) {
  await connectDB();
  const payments = await Payment.find({ customer: userId, status: "successful" })
    .sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(payments));
}

const methodLabel: Record<string, string> = {
  paystack: "Paystack",
  cash: "Cash",
  "mobile-money": "Mobile Money",
  "bank-transfer": "Bank Transfer",
};

export default async function PaymentHistoryPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const payments = await getPaymentHistory(userId);

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 pt-4">Payment History</h1>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No payment history yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((p: any) => (
            <Card key={p._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                    <p className="text-sm text-gray-500">{methodLabel[p.paymentMethod] || p.paymentMethod}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(p.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-400">{p.receiptNumber}</p>
                    <Badge variant="success" className="mt-1">Successful</Badge>
                    <p className="text-xs text-gray-400 mt-1">Bal: {formatCurrency(p.balanceAfter)}</p>
                  </div>
                </div>
                {p.paystackReference && (
                  <p className="text-xs text-gray-300 mt-2 font-mono">Ref: {p.paystackReference}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

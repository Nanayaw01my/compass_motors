import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import Payment from "@/lib/db/models/Payment";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";

function csv(val: any): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export async function GET(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`export:payments:${ip}`, 5, 60_000)) return TOO_MANY(60);

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get("contract");
    const customerId = searchParams.get("customer");

    const query: Record<string, any> = { status: "successful" };
    if (contractId) query.contract = contractId;
    if (customerId) query.customer = customerId;

    const payments = await Payment.find(query)
      .populate("customer", "fullName customerId phone")
      .populate("contract", "contractNumber")
      .sort({ createdAt: -1 });

    const headers = [
      "Receipt No", "Date", "Customer ID", "Customer Name", "Phone",
      "Contract No", "Amount (GHS)", "Method", "Balance Before (GHS)",
      "Balance After (GHS)", "Notes",
    ];

    const rows = payments.map((p: any) =>
      [
        p.receiptNumber,
        new Date(p.createdAt).toLocaleDateString("en-GH"),
        p.customer?.customerId || "",
        p.customer?.fullName || "",
        p.customer?.phone || "",
        p.contract?.contractNumber || "",
        p.amount.toFixed(2),
        p.paymentMethod,
        p.balanceBefore.toFixed(2),
        p.balanceAfter.toFixed(2),
        p.notes || "",
      ]
        .map(csv)
        .join(",")
    );

    const body = [headers.join(","), ...rows].join("\r\n");
    const date = new Date().toISOString().split("T")[0];

    logger.info("Payments CSV exported", { adminId: (session.user as any)?.id, count: payments.length });

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="compass-payments-${date}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

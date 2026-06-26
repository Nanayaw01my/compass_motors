import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Payment from "@/lib/db/models/Payment";
import Contract from "@/lib/db/models/Contract";
import Customer from "@/lib/db/models/Customer";
import { auth } from "@/lib/auth";
import { generateReceiptNumber } from "@/lib/utils";
import { getNextSequence } from "@/lib/db/counter";
import { sendPaymentConfirmationSMS, sendContractCompletionSMS } from "@/lib/arkesel";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`payments:create:${ip}`, 30, 60_000)) return TOO_MANY();

  logger.req("POST", "/api/payments", { ip });

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      logger.warn("Unauthorized POST /api/payments", { ip });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { contractId, amount, paymentMethod, notes } = body;

    if (!contractId || !amount) {
      return NextResponse.json({ error: "Contract ID and amount are required" }, { status: 400 });
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }
    if (!["cash", "mobile-money", "bank-transfer"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    // Atomically deduct from the contract balance — prevents race conditions
    const contract = await Contract.findOneAndUpdate(
      { _id: contractId, status: { $in: ["active", "overdue"] }, remainingBalance: { $gte: amt } },
      { $inc: { totalPaid: amt, remainingBalance: -amt } },
      { new: true }
    ).populate("customer");

    if (!contract) {
      // Check if contract exists at all to give a meaningful error
      const exists = await Contract.findById(contractId);
      if (!exists) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
      if (exists.status === "completed") return NextResponse.json({ error: "Contract is already completed" }, { status: 400 });
      return NextResponse.json({ error: "Payment amount exceeds remaining balance" }, { status: 400 });
    }

    const balanceBefore = contract.remainingBalance + amt; // before the atomic update
    const balanceAfter  = contract.remainingBalance;
    const isCompleted   = balanceAfter <= 0;

    if (isCompleted) {
      await Contract.findByIdAndUpdate(contractId, { status: "completed" });
    }

    const seq = await getNextSequence("receipt");
    const receiptNumber = generateReceiptNumber(seq);
    const adminId = (session.user as any)?.id;

    const payment = await Payment.create({
      receiptNumber,
      contract:      contractId,
      customer:      (contract.customer as any)._id ?? contract.customer,
      amount:        amt,
      paymentMethod,
      balanceBefore,
      balanceAfter,
      notes,
      recordedBy:    adminId,
      status:        "successful",
    });

    logger.info("Payment recorded", { receiptNumber, amount: amt, contractId, balanceAfter, adminId });
    await audit({
      userId: adminId,
      userRole: "admin",
      action: "RECORD_PAYMENT",
      resource: "Payment",
      resourceId: payment._id.toString(),
      details: `GHS ${amt} via ${paymentMethod} — ${receiptNumber}. Balance: ${balanceBefore} → ${balanceAfter}`,
      req,
    });

    // SMS (non-blocking)
    const customer = await Customer.findById((contract.customer as any)._id ?? contract.customer);
    if (customer?.phone) {
      const motorcycle = contract.motorcycle as any;
      const fn = isCompleted
        ? sendContractCompletionSMS(customer.phone, customer.fullName, `${motorcycle?.brand ?? ""} ${motorcycle?.model ?? ""}`.trim())
        : sendPaymentConfirmationSMS(customer.phone, customer.fullName, amt, balanceAfter, receiptNumber);
      fn.catch((err) => logger.error("Payment SMS failed", { phone: customer.phone, err: String(err) }));
    }

    return NextResponse.json({
      success: true,
      payment:   JSON.parse(JSON.stringify(payment)),
      balanceAfter,
      isCompleted,
      receiptNumber,
    }, { status: 201 });
  } catch (error: any) {
    logger.error("POST /api/payments failed", { ip, err: error.message });
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`payments:list:${ip}`, 60, 60_000)) return TOO_MANY();

  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get("contract");
    const customerId = searchParams.get("customer");
    const role = (session.user as any)?.role;

    const query: Record<string, unknown> = {};
    if (contractId) query.contract = contractId;
    if (customerId && role === "admin") query.customer = customerId;
    if (role === "customer") query.customer = (session.user as any)?.id;

    const payments = await Payment.find(query)
      .populate("customer", "fullName customerId")
      .populate("contract", "contractNumber")
      .sort({ createdAt: -1 })
      .limit(200);

    return NextResponse.json(JSON.parse(JSON.stringify(payments)));
  } catch (error: any) {
    logger.error("GET /api/payments failed", { ip, err: error.message });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

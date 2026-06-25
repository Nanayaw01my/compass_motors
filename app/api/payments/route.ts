import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Payment from "@/lib/db/models/Payment";
import Contract from "@/lib/db/models/Contract";
import Customer from "@/lib/db/models/Customer";
import { auth } from "@/lib/auth";
import { generateReceiptNumber } from "@/lib/utils";
import { getNextSequence } from "@/lib/db/counter";
import { sendPaymentConfirmationSMS, sendContractCompletionSMS } from "@/lib/arkesel";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { contractId, amount, paymentMethod, paystackReference, notes } = body;

    if (!contractId || !amount) {
      return NextResponse.json({ error: "Contract ID and amount are required" }, { status: 400 });
    }

    const contract = await Contract.findById(contractId).populate("customer");
    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

    const customer = await Customer.findById(contract.customer);
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const seq = await getNextSequence("receipt");
    const receiptNumber = generateReceiptNumber(seq);
    const balanceBefore = contract.remainingBalance;
    const balanceAfter = Math.max(0, balanceBefore - amount);
    const newTotalPaid = contract.totalPaid + amount;

    const payment = await Payment.create({
      receiptNumber,
      contract: contractId,
      customer: contract.customer,
      amount,
      paymentMethod,
      paystackReference,
      balanceBefore,
      balanceAfter,
      notes,
      status: "successful",
    });

    const isCompleted = balanceAfter <= 0;
    await Contract.findByIdAndUpdate(contractId, {
      totalPaid: newTotalPaid,
      remainingBalance: balanceAfter,
      status: isCompleted ? "completed" : "active",
    });

    // SMS notification (non-blocking)
    if (customer.phone) {
      if (isCompleted) {
        const moto = contract.motorcycle as any;
        sendContractCompletionSMS(
          customer.phone,
          customer.fullName,
          `${moto?.brand || ""} ${moto?.model || ""}`.trim()
        ).catch(console.error);
      } else {
        sendPaymentConfirmationSMS(customer.phone, customer.fullName, amount, balanceAfter, receiptNumber)
          .catch(console.error);
      }
    }

    return NextResponse.json({
      success: true,
      payment: JSON.parse(JSON.stringify(payment)),
      balanceAfter,
      isCompleted,
      receiptNumber,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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
    if (customerId) query.customer = customerId;
    if (role === "customer") {
      query.customer = (session.user as any)?.id;
    }

    const payments = await Payment.find(query)
      .populate("customer", "fullName customerId")
      .populate("contract", "contractNumber")
      .sort({ createdAt: -1 })
      .limit(200);

    return NextResponse.json(JSON.parse(JSON.stringify(payments)));
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

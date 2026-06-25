import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Contract from "@/lib/db/models/Contract";
import Motorcycle from "@/lib/db/models/Motorcycle";
import { auth } from "@/lib/auth";
import { generateContractNumber } from "@/lib/utils";
import { getNextSequence } from "@/lib/db/counter";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();

    const { customer, motorcycle, sellingPrice, downPayment, contractType, weeklyInstallment, monthlyInstallment, startDate } = body;

    if (!customer || !motorcycle || !sellingPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const seq = await getNextSequence("contract");
    const contractNumber = generateContractNumber(seq);
    const balance = sellingPrice - (downPayment || 0);

    const contract = await Contract.create({
      contractNumber,
      customer,
      motorcycle,
      contractType,
      sellingPrice,
      downPayment: downPayment || 0,
      balance,
      weeklyInstallment,
      monthlyInstallment,
      totalPaid: downPayment || 0,
      remainingBalance: balance,
      startDate: startDate ? new Date(startDate) : new Date(),
      status: "active",
    });

    // Mark motorcycle as sold
    await Motorcycle.findByIdAndUpdate(motorcycle, { status: "sold" });

    return NextResponse.json(contract, { status: 201 });
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
    const status = searchParams.get("status");
    const customerId = searchParams.get("customer");
    const role = (session.user as any)?.role;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (customerId) query.customer = customerId;
    if (role === "customer") {
      query.customer = (session.user as any)?.id;
    }

    const contracts = await Contract.find(query)
      .populate("customer", "fullName customerId phone")
      .populate("motorcycle")
      .sort({ createdAt: -1 });

    return NextResponse.json(JSON.parse(JSON.stringify(contracts)));
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

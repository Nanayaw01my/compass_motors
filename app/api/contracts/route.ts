import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Contract from "@/lib/db/models/Contract";
import Motorcycle from "@/lib/db/models/Motorcycle";
import { auth } from "@/lib/auth";
import { generateContractNumber } from "@/lib/utils";
import { getNextSequence } from "@/lib/db/counter";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`contracts:create:${ip}`, 20, 60_000)) return TOO_MANY();

  logger.req("POST", "/api/contracts", { ip });

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      logger.warn("Unauthorized POST /api/contracts", { ip });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { customer, motorcycle, sellingPrice, downPayment, contractType, weeklyInstallment, monthlyInstallment, startDate } = body;

    if (!customer || !motorcycle || !sellingPrice || !contractType) {
      return NextResponse.json({ error: "Missing required fields: customer, motorcycle, sellingPrice, contractType" }, { status: 400 });
    }
    if (sellingPrice <= 0) {
      return NextResponse.json({ error: "Selling price must be greater than 0" }, { status: 400 });
    }
    const dp = Number(downPayment) || 0;
    if (dp < 0 || dp > sellingPrice) {
      return NextResponse.json({ error: "Down payment must be between 0 and selling price" }, { status: 400 });
    }

    const seq = await getNextSequence("contract");
    const contractNumber = generateContractNumber(seq);
    const balance = sellingPrice - dp;

    const contract = await Contract.create({
      contractNumber,
      customer,
      motorcycle,
      contractType,
      sellingPrice,
      downPayment: dp,
      balance,
      weeklyInstallment,
      monthlyInstallment,
      totalPaid: dp,
      remainingBalance: balance,
      startDate: startDate ? new Date(startDate) : new Date(),
      status: "active",
    });

    // Mark motorcycle as sold (best-effort — don't let this block contract creation)
    Motorcycle.findByIdAndUpdate(motorcycle, { status: "sold" }).catch((err) =>
      logger.error("Failed to mark motorcycle sold", { motorcycle, err: String(err) })
    );

    const adminId = (session.user as any)?.id;
    logger.info("Contract created", { contractNumber, customer, adminId });
    await audit({
      userId: adminId,
      userRole: "admin",
      action: "CREATE_CONTRACT",
      resource: "Contract",
      resourceId: contract._id.toString(),
      details: `${contractType} contract ${contractNumber}, price GHS ${sellingPrice}`,
      req,
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error: any) {
    logger.error("POST /api/contracts failed", { ip, err: error.message });
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`contracts:list:${ip}`, 60, 60_000)) return TOO_MANY();

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
    if (customerId && role === "admin") query.customer = customerId;
    if (role === "customer") query.customer = (session.user as any)?.id;

    const contracts = await Contract.find(query)
      .populate("customer", "fullName customerId phone")
      .populate("motorcycle")
      .sort({ createdAt: -1 })
      .limit(200);

    return NextResponse.json(JSON.parse(JSON.stringify(contracts)));
  } catch (error: any) {
    logger.error("GET /api/contracts failed", { ip, err: error.message });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

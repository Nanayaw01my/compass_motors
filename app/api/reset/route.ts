import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import Motorcycle from "@/lib/db/models/Motorcycle";
import AuditLog from "@/lib/db/models/AuditLog";
import Counter from "@/lib/db/models/Counter";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [customers, contracts, payments, motorcycles, auditLogs, counters] = await Promise.all([
      Customer.deleteMany({}),
      Contract.deleteMany({}),
      Payment.deleteMany({}),
      Motorcycle.deleteMany({}),
      AuditLog.deleteMany({}),
      Counter.deleteMany({}),
    ]);

    logger.warn("FULL DATA RESET executed", {
      adminId: (session.user as any)?.id,
      deleted: { customers: customers.deletedCount, contracts: contracts.deletedCount, payments: payments.deletedCount, motorcycles: motorcycles.deletedCount, auditLogs: auditLogs.deletedCount, counters: counters.deletedCount },
    });

    return NextResponse.json({
      success: true,
      message: "All data wiped. Admin account preserved.",
      deleted: {
        customers: customers.deletedCount,
        contracts: contracts.deletedCount,
        payments: payments.deletedCount,
        motorcycles: motorcycles.deletedCount,
        auditLogs: auditLogs.deletedCount,
        counters: counters.deletedCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

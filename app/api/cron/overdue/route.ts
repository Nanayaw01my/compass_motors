import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import Contract from "@/lib/db/models/Contract";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`cron:overdue:${ip}`, 10, 60_000)) return TOO_MANY(60);

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const now = new Date();

    const result = await Contract.updateMany(
      {
        status: "active",
        nextPaymentDate: { $lt: now, $exists: true },
      },
      { $set: { status: "overdue" } }
    );

    const adminId = (session.user as any)?.id;
    logger.warn("Overdue check executed", { adminId, marked: result.modifiedCount });
    await audit({
      userId: adminId,
      userRole: "admin",
      action: "CHECK_OVERDUE",
      resource: "Contract",
      details: `Marked ${result.modifiedCount} contracts as overdue`,
      req,
    });

    return NextResponse.json({ success: true, marked: result.modifiedCount });
  } catch (error: any) {
    logger.error("POST /api/cron/overdue failed", { err: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

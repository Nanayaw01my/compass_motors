import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import Contract from "@/lib/db/models/Contract";
import { sendOverdueSMS } from "@/lib/arkesel";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  // Very strict — bulk SMS costs money; 2 per 5 minutes
  if (!rateLimit(`sms:bulk:${ip}`, 2, 300_000)) return TOO_MANY(300);

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const overdueContracts = await Contract.find({ status: "overdue" })
      .populate("customer", "fullName phone");

    const eligible = overdueContracts.filter((c: any) => c.customer?.phone);

    if (eligible.length === 0) {
      return NextResponse.json({ success: true, sent: 0, failed: 0, total: 0, message: "No overdue contracts with phone numbers" });
    }

    const results = await Promise.allSettled(
      eligible.map((c: any) =>
        sendOverdueSMS(c.customer.phone, c.customer.fullName, c.remainingBalance)
      )
    );

    const sent = results.filter(
      (r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<any>).value.success
    ).length;
    const failed = results.length - sent;

    const adminId = (session.user as any)?.id;
    logger.warn("Bulk overdue SMS sent", { adminId, total: eligible.length, sent, failed });
    await audit({
      userId: adminId,
      userRole: "admin",
      action: "BULK_OVERDUE_SMS",
      resource: "Contract",
      details: `Bulk SMS: ${sent} sent, ${failed} failed of ${eligible.length} overdue contracts`,
      req,
    });

    return NextResponse.json({ success: true, sent, failed, total: eligible.length });
  } catch (error: any) {
    logger.error("POST /api/sms/bulk failed", { err: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

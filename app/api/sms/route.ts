import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendPaymentReminderSMS, sendOverdueSMS } from "@/lib/arkesel";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  // Strict limit — SMS costs money
  if (!rateLimit(`sms:${ip}`, 15, 60_000)) return TOO_MANY(60);

  logger.req("POST", "/api/sms", { ip });

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      logger.warn("Unauthorized POST /api/sms", { ip });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { phone, name, type, amount, dueDate } = await req.json();

    if (!phone || !name || !type) {
      return NextResponse.json({ error: "phone, name, and type are required" }, { status: 400 });
    }
    if (!["reminder", "overdue"].includes(type)) {
      return NextResponse.json({ error: "type must be 'reminder' or 'overdue'" }, { status: 400 });
    }

    let result;
    if (type === "reminder") {
      if (!amount) return NextResponse.json({ error: "amount is required for reminder" }, { status: 400 });
      result = await sendPaymentReminderSMS(phone, name, Number(amount), dueDate || "soon");
    } else {
      if (!amount) return NextResponse.json({ error: "amount is required for overdue notice" }, { status: 400 });
      result = await sendOverdueSMS(phone, name, Number(amount));
    }

    const adminId = (session.user as any)?.id;
    logger.info("SMS sent", { type, phone, adminId, success: result.success });
    await audit({
      userId: adminId,
      userRole: "admin",
      action: type === "reminder" ? "SEND_REMINDER_SMS" : "SEND_OVERDUE_SMS",
      resource: "Customer",
      details: `${type} SMS to ${phone} (${name})`,
      req,
    });

    if (!result.success) {
      return NextResponse.json({ error: "SMS delivery failed. Check Arkesel API key and balance." }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    logger.error("POST /api/sms failed", { ip, err: error.message });
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

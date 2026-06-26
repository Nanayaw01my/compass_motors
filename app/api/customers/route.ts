import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import { auth } from "@/lib/auth";
import { generateCustomerId } from "@/lib/utils";
import { getNextSequence } from "@/lib/db/counter";
import { sendWelcomeSMS } from "@/lib/arkesel";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`customers:create:${ip}`, 20, 60_000)) return TOO_MANY();

  logger.req("POST", "/api/customers", { ip });

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      logger.warn("Unauthorized POST /api/customers", { ip });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { fullName, phone, password } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ error: "Full name and phone are required" }, { status: 400 });
    }
    if (!password || password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    const existing = await Customer.findOne({ phone });
    if (existing) {
      return NextResponse.json({ error: "A customer with this phone number already exists" }, { status: 409 });
    }

    const seq = await getNextSequence("customer");
    const customerId = generateCustomerId(seq);
    const hashedPassword = await bcrypt.hash(password, 12);

    const customer = await Customer.create({
      ...body,
      customerId,
      username: phone,
      password: hashedPassword,
      status: "active",
    });

    const adminId = (session.user as any)?.id;
    logger.info("Customer created", { customerId, phone, adminId });

    await audit({
      userId: adminId,
      userRole: "admin",
      action: "CREATE_CUSTOMER",
      resource: "Customer",
      resourceId: customer._id.toString(),
      details: `Registered ${fullName} (${phone})`,
      req,
    });

    // Send SMS (non-blocking — do not expose failures to caller)
    sendWelcomeSMS(phone, fullName, phone, password).catch((err) =>
      logger.error("Welcome SMS failed", { phone, err: String(err) })
    );

    return NextResponse.json({
      success: true,
      customerId,
      username: phone,
      password,
      _id: customer._id,
    }, { status: 201 });
  } catch (error: any) {
    logger.error("POST /api/customers failed", { ip, err: error.message });
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`customers:list:${ip}`, 60, 60_000)) return TOO_MANY();

  logger.req("GET", "/api/customers", { ip });

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { customerId: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await Customer.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(customers);
  } catch (error: any) {
    logger.error("GET /api/customers failed", { ip, err: error.message });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

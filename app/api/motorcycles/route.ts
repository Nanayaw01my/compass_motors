import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Motorcycle from "@/lib/db/models/Motorcycle";
import { auth } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`motorcycles:create:${ip}`, 20, 60_000)) return TOO_MANY();

  logger.req("POST", "/api/motorcycles", { ip });

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      logger.warn("Unauthorized POST /api/motorcycles", { ip });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    if (!body.brand || !body.model || !body.year || !body.sellingPrice || !body.installmentPrice) {
      return NextResponse.json({ error: "brand, model, year, sellingPrice, installmentPrice are required" }, { status: 400 });
    }

    const motorcycle = await Motorcycle.create(body);

    const adminId = (session.user as any)?.id;
    logger.info("Motorcycle added", { brand: body.brand, model: body.model, adminId });
    await audit({
      userId: adminId,
      userRole: "admin",
      action: "CREATE_MOTORCYCLE",
      resource: "Motorcycle",
      resourceId: motorcycle._id.toString(),
      details: `${body.year} ${body.brand} ${body.model}`,
      req,
    });

    return NextResponse.json(motorcycle, { status: 201 });
  } catch (error: any) {
    logger.error("POST /api/motorcycles failed", { ip, err: error.message });
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`motorcycles:list:${ip}`, 60, 60_000)) return TOO_MANY();

  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const motorcycles = await Motorcycle.find(query).sort({ createdAt: -1 });
    return NextResponse.json(motorcycles);
  } catch (error: any) {
    logger.error("GET /api/motorcycles failed", { ip, err: error.message });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

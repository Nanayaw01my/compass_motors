import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Motorcycle from "@/lib/db/models/Motorcycle";
import { auth } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getIP(req);
  if (!rateLimit(`motorcycle:get:${ip}`, 60, 60_000)) return TOO_MANY();

  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const motorcycle = await Motorcycle.findById(id);
    if (!motorcycle) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(motorcycle);
  } catch (error: any) {
    logger.error("GET /api/motorcycles/[id] failed", { ip, err: error.message });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getIP(req);
  if (!rateLimit(`motorcycle:patch:${ip}`, 30, 60_000)) return TOO_MANY();

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      logger.warn("Unauthorized PATCH /api/motorcycles/[id]", { ip });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const motorcycle = await Motorcycle.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!motorcycle) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const adminId = (session.user as any)?.id;
    logger.info("Motorcycle updated", { id, adminId });
    await audit({
      userId: adminId,
      userRole: "admin",
      action: "UPDATE_MOTORCYCLE",
      resource: "Motorcycle",
      resourceId: id,
      details: `Updated fields: ${Object.keys(body).join(", ")}`,
      req,
    });

    return NextResponse.json(motorcycle);
  } catch (error: any) {
    logger.error("PATCH /api/motorcycles/[id] failed", { ip, err: error.message });
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getIP(req);
  if (!rateLimit(`motorcycle:delete:${ip}`, 10, 60_000)) return TOO_MANY();

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      logger.warn("Unauthorized DELETE /api/motorcycles/[id]", { ip });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const motorcycle = await Motorcycle.findByIdAndDelete(id);
    if (!motorcycle) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const adminId = (session.user as any)?.id;
    logger.warn("Motorcycle deleted", { id, adminId });
    await audit({
      userId: adminId,
      userRole: "admin",
      action: "DELETE_MOTORCYCLE",
      resource: "Motorcycle",
      resourceId: id,
      details: `${motorcycle.year} ${motorcycle.brand} ${motorcycle.model}`,
      req,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("DELETE /api/motorcycles/[id] failed", { ip, err: error.message });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

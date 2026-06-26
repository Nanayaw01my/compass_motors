import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Admin from "@/lib/db/models/Admin";
import { auth } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`admin:profile:${ip}`, 10, 60_000)) return TOO_MANY();

  logger.req("PATCH", "/api/admin/profile", { ip });

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      logger.warn("Unauthorized PATCH /api/admin/profile", { ip });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const update: Record<string, string> = {};
    if (body.name)     update.name  = body.name.trim();
    if (body.phone)    update.phone = body.phone.trim();
    if (body.password) {
      if (body.password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }
      update.password = await bcrypt.hash(body.password, 12);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await Admin.findOneAndUpdate({ email: session.user?.email }, update, { runValidators: true });

    const adminId = (session.user as any)?.id;
    logger.info("Admin profile updated", { adminId, fields: Object.keys(update).filter(k => k !== "password") });
    await audit({
      userId: adminId,
      userRole: "admin",
      action: "UPDATE_ADMIN_PROFILE",
      resource: "Admin",
      resourceId: adminId,
      details: `Updated: ${Object.keys(update).filter(k => k !== "password").join(", ")}`,
      req,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("PATCH /api/admin/profile failed", { ip, err: error.message });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

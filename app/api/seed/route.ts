import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Admin from "@/lib/db/models/Admin";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

// Seed is already called automatically on every connectDB().
// This endpoint is kept only for emergency credential reset.
// It is protected: caller must be an existing admin OR provide the SEED_SECRET env var.
export async function POST(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`seed:${ip}`, 3, 60_000)) return TOO_MANY();

  const seedSecret = process.env.SEED_SECRET;
  const authHeader = req.headers.get("x-seed-secret");

  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "admin";
  const hasSecret = seedSecret && authHeader === seedSecret;

  if (!isAdmin && !hasSecret) {
    logger.warn("Unauthorized POST /api/seed", { ip });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const password = await bcrypt.hash("ADMIN123", 12);
    await Admin.findOneAndUpdate(
      { $or: [{ username: "admin" }, { email: "cmsspass@gmail.com" }] },
      { name: "Compass Motors Admin", username: "admin", email: "cmsspass@gmail.com", password, phone: "0593920144", role: "admin" },
      { upsert: true, new: true }
    );

    logger.info("Admin seed executed", { ip, by: isAdmin ? "admin session" : "secret" });
    return NextResponse.json({ success: true, message: "Admin credentials reset" });
  } catch (error: any) {
    logger.error("POST /api/seed failed", { ip, err: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

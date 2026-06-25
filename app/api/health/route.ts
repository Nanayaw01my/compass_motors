import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";

export async function GET() {
  const checks: Record<string, string> = {
    server: "ok",
    mongodb_uri: process.env.MONGODB_URI ? "set" : "MISSING",
    nextauth_secret: process.env.NEXTAUTH_SECRET ? "set" : "MISSING",
  };

  try {
    await connectDB();
    checks.database = "connected";
  } catch (err: any) {
    checks.database = `failed: ${err.message}`;
  }

  const allOk = Object.values(checks).every((v) => v === "ok" || v === "set" || v === "connected");

  return NextResponse.json(
    { status: allOk ? "healthy" : "degraded", checks },
    { status: allOk ? 200 : 503 }
  );
}

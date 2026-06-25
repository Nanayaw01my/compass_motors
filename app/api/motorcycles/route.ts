import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Motorcycle from "@/lib/db/models/Motorcycle";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();
    const motorcycle = await Motorcycle.create(body);
    return NextResponse.json(motorcycle, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

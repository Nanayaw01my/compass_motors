import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Admin from "@/lib/db/models/Admin";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();
    const update: Record<string, string> = {};
    if (body.name) update.name = body.name;
    if (body.phone) update.phone = body.phone;
    if (body.password) update.password = await bcrypt.hash(body.password, 12);

    await Admin.findOneAndUpdate({ email: session.user?.email }, update);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

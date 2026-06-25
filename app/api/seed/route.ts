import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Admin from "@/lib/db/models/Admin";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    await connectDB();

    const password = await bcrypt.hash("ADMIN123", 12);
    await Admin.findOneAndUpdate(
      { $or: [{ username: "admin" }, { email: "cmsspass@gmail.com" }] },
      {
        name: "Compass Motors Admin",
        username: "admin",
        email: "cmsspass@gmail.com",
        password,
        phone: "0593920144",
        role: "admin",
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Admin credentials updated",
      credentials: {
        username: "admin",
        password: "ADMIN123",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

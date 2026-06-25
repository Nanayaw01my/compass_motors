import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Admin from "@/lib/db/models/Admin";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    await connectDB();

    const existing = await Admin.findOne({ email: "cmsspass@gmail.com" });
    if (existing) {
      return NextResponse.json({ message: "Admin already exists" });
    }

    const password = await bcrypt.hash("CompassAdmin2024!", 12);
    await Admin.create({
      name: "Compass Motors Admin",
      email: "cmsspass@gmail.com",
      password,
      phone: "0593920144",
      role: "admin",
    });

    return NextResponse.json({
      success: true,
      message: "Admin created",
      credentials: {
        email: "cmsspass@gmail.com",
        password: "CompassAdmin2024!",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

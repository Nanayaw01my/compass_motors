import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import Admin from "@/lib/db/models/Admin";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await auth();
  if (!session) return null;
  if ((session.user as any)?.role !== "admin") return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const admins = await Admin.find().select("-password").sort({ createdAt: 1 }).lean();
  return NextResponse.json({ admins });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, username, email, password, phone } = await req.json();

  if (!name || !username || !password) {
    return NextResponse.json({ error: "Name, username and password are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  await connectDB();

  const exists = await Admin.findOne({
    $or: [
      { username: username.toLowerCase().trim() },
      ...(email ? [{ email: email.toLowerCase().trim() }] : []),
    ],
  });
  if (exists) {
    return NextResponse.json({ error: "Username or email already taken" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await Admin.create({
    name: name.trim(),
    username: username.toLowerCase().trim(),
    email: email ? email.toLowerCase().trim() : `${username.toLowerCase().trim()}@compassmotors.local`,
    password: hashed,
    phone: phone?.trim() || "",
    role: "admin",
  });

  return NextResponse.json({
    admin: { _id: admin._id, name: admin.name, username: admin.username, email: admin.email },
  }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await connectDB();

  // Prevent deleting yourself
  const me = await Admin.findOne({ email: session.user?.email }).lean();
  if (me && (me as any)._id.toString() === id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  await Admin.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}

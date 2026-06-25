import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const customer = await Customer.findById(id).select("-password");
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const role = (session.user as any)?.role;
    if (role === "customer" && (session.user as any)?.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contracts = await Contract.find({ customer: id }).populate("motorcycle");
    const payments = await Payment.find({ customer: id }).sort({ createdAt: -1 }).limit(20);

    return NextResponse.json({
      customer,
      contracts: JSON.parse(JSON.stringify(contracts)),
      payments: JSON.parse(JSON.stringify(payments)),
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 12);
    }

    const customer = await Customer.findByIdAndUpdate(id, body, { new: true }).select("-password");
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    await Customer.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

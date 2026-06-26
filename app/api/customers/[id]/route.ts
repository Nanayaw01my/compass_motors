import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import { auth } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getIP(req);
  if (!rateLimit(`customer:get:${ip}`, 60, 60_000)) return TOO_MANY();

  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const role = (session.user as any)?.role;

    if (role === "customer" && (session.user as any)?.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const customer = await Customer.findById(id).select("-password");
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const [contracts, payments] = await Promise.all([
      Contract.find({ customer: id }).populate("motorcycle").sort({ createdAt: -1 }),
      Payment.find({ customer: id }).sort({ createdAt: -1 }).limit(20),
    ]);

    return NextResponse.json({
      customer,
      contracts: JSON.parse(JSON.stringify(contracts)),
      payments:  JSON.parse(JSON.stringify(payments)),
    });
  } catch (error: any) {
    logger.error("GET /api/customers/[id] failed", { ip, err: error.message });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getIP(req);
  if (!rateLimit(`customer:patch:${ip}`, 30, 60_000)) return TOO_MANY();

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      logger.warn("Unauthorized PATCH /api/customers/[id]", { ip });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Prevent role/status escalation via arbitrary body fields
    const allowed = [
      "fullName", "phone", "altPhone", "email", "dateOfBirth", "gender",
      "occupation", "residentialAddress", "gpsAddress",
      "ghanaCardNumber", "ghanaCardFront", "ghanaCardBack", "passportPhoto",
      "emergencyName", "emergencyRelationship", "emergencyPhone", "emergencyAddress",
      "guarantorName", "guarantorPhone", "guarantorAddress", "guarantorOccupation",
      "guarantorGhanaCard", "guarantorPhoto", "status", "password",
    ];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    if (update.password) {
      update.password = await bcrypt.hash(update.password as string, 12);
    }

    const customer = await Customer.findByIdAndUpdate(id, update, { new: true, runValidators: true }).select("-password");
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const adminId = (session.user as any)?.id;
    logger.info("Customer updated", { customerId: id, adminId, fields: Object.keys(update) });
    await audit({
      userId: adminId,
      userRole: "admin",
      action: "UPDATE_CUSTOMER",
      resource: "Customer",
      resourceId: id,
      details: `Updated fields: ${Object.keys(update).filter(k => k !== "password").join(", ")}`,
      req,
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    logger.error("PATCH /api/customers/[id] failed", { ip, err: error.message });
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getIP(req);
  if (!rateLimit(`customer:delete:${ip}`, 10, 60_000)) return TOO_MANY();

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      logger.warn("Unauthorized DELETE /api/customers/[id]", { ip });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const customer = await Customer.findById(id);
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    await Customer.findByIdAndDelete(id);

    const adminId = (session.user as any)?.id;
    logger.warn("Customer deleted", { customerId: id, adminId });
    await audit({
      userId: adminId,
      userRole: "admin",
      action: "DELETE_CUSTOMER",
      resource: "Customer",
      resourceId: id,
      details: `Deleted ${customer.fullName} (${customer.phone})`,
      req,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("DELETE /api/customers/[id] failed", { ip, err: error.message });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

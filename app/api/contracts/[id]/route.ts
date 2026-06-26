import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import Contract from "@/lib/db/models/Contract";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";

const VALID_TRANSITIONS: Record<string, string[]> = {
  active:    ["suspended", "cancelled", "overdue"],
  overdue:   ["suspended", "cancelled", "active"],
  suspended: ["active", "cancelled"],
  completed: [],
  cancelled: [],
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getIP(req);
  if (!rateLimit(`contracts:patch:${ip}`, 20, 60_000)) return TOO_MANY();

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const contract = await Contract.findById(id);
    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

    const body = await req.json();
    const update: Record<string, any> = {};

    if (body.status !== undefined) {
      const allowed = VALID_TRANSITIONS[contract.status] ?? [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `Cannot change status from '${contract.status}' to '${body.status}'` },
          { status: 400 }
        );
      }
      update.status = body.status;
    }

    if (body.notes !== undefined) update.notes = body.notes;
    if (body.nextPaymentDate !== undefined) update.nextPaymentDate = body.nextPaymentDate ? new Date(body.nextPaymentDate) : null;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await Contract.findByIdAndUpdate(id, { $set: update }, { new: true });

    const adminId = (session.user as any)?.id;
    logger.info("Contract updated", { id, update, adminId });
    await audit({
      userId: adminId,
      userRole: "admin",
      action: "UPDATE_CONTRACT",
      resource: "Contract",
      resourceId: id,
      details: `Updated fields: ${Object.keys(update).join(", ")} → ${JSON.stringify(update)}`,
      req,
    });

    return NextResponse.json(JSON.parse(JSON.stringify(updated)));
  } catch (error: any) {
    logger.error("PATCH /api/contracts/[id] failed", { err: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getIP(req);
  if (!rateLimit(`contracts:get:${ip}`, 60, 60_000)) return TOO_MANY();

  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const contract = await Contract.findById(id)
      .populate("customer", "fullName customerId phone email")
      .populate("motorcycle", "brand model year images sellingPrice installmentPrice");

    if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const role = (session.user as any)?.role;
    if (role === "customer" && contract.customer?._id?.toString() !== (session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(contract)));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

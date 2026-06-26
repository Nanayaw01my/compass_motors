import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import { logger } from "@/lib/logger";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";

function csv(val: any): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export async function GET(req: NextRequest) {
  const ip = getIP(req);
  if (!rateLimit(`export:customers:${ip}`, 5, 60_000)) return TOO_MANY(60);

  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .select("-password -__v");

    const headers = [
      "Customer ID", "Full Name", "Phone", "Alt Phone", "Email",
      "Status", "Gender", "Occupation", "Address", "GPS Address",
      "Ghana Card No", "Emergency Contact", "Emergency Phone", "Joined",
    ];

    const rows = customers.map((c: any) =>
      [
        c.customerId, c.fullName, c.phone, c.altPhone || "",
        c.email || "", c.status, c.gender || "", c.occupation || "",
        c.residentialAddress || "", c.gpsAddress || "",
        c.ghanaCardNumber || "",
        c.emergencyContact?.name || "", c.emergencyContact?.phone || "",
        new Date(c.createdAt).toLocaleDateString("en-GH"),
      ]
        .map(csv)
        .join(",")
    );

    const body = [headers.join(","), ...rows].join("\r\n");
    const date = new Date().toISOString().split("T")[0];

    logger.info("Customers CSV exported", { adminId: (session.user as any)?.id, count: customers.length });

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="compass-customers-${date}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

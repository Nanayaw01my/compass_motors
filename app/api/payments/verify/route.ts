import { NextResponse } from "next/server";

// Paystack has been removed from this project.
// All payments are recorded manually by admin via /api/payments.
export async function GET() {
  return NextResponse.json({ error: "Endpoint removed" }, { status: 410 });
}

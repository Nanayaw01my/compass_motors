import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import Payment from "@/lib/db/models/Payment";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";

function ghs(n: number) {
  return `GHS ${n.toFixed(2)}`;
}

function cap(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const ip = getIP(req);
  if (!rateLimit(`receipt:${ip}`, 30, 60_000)) return TOO_MANY(60);

  try {
    const session = await auth();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { paymentId } = await params;
    await connectDB();

    const payment = await Payment.findById(paymentId)
      .populate("customer", "fullName customerId phone")
      .populate("contract", "contractNumber sellingPrice");

    if (!payment) return new NextResponse("Receipt not found", { status: 404 });

    const role = (session.user as any)?.role;
    const uid  = (session.user as any)?.id;
    if (role === "customer" && (payment.customer as any)?._id?.toString() !== uid) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const date = new Date(payment.createdAt).toLocaleDateString("en-GH", { year: "numeric", month: "long", day: "numeric" });
    const time = new Date(payment.createdAt).toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" });
    const c = payment.customer as any;
    const contract = payment.contract as any;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Receipt ${payment.receiptNumber}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f0;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:32px 16px}
.wrap{width:100%;max-width:400px}
.card{background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.top{background:linear-gradient(135deg,#b91c1c,#7f1d1d);padding:24px;color:white}
.brand{font-size:20px;font-weight:900;letter-spacing:-0.5px}
.brand span{opacity:.65}
.tagline{font-size:11px;opacity:.65;margin-top:2px}
.rtype{font-size:11px;opacity:.75;text-transform:uppercase;letter-spacing:1px;margin-top:16px}
.rnum{font-size:18px;font-weight:700;font-family:monospace;margin-top:2px}
.amount-box{padding:24px 24px 20px;text-align:center;border-bottom:2px dashed #f0f0f0}
.alabel{font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px}
.amount{font-size:40px;font-weight:900;color:#111;margin-top:4px;line-height:1}
.rows{padding:16px 24px}
.row{display:flex;justify-content:space-between;align-items:baseline;padding:9px 0;border-bottom:1px solid #f5f5f5}
.row:last-child{border-bottom:none}
.rl{font-size:12px;color:#888}
.rv{font-size:13px;font-weight:600;color:#111;text-align:right;max-width:60%}
.rv.red{color:#dc2626}
.footer{background:#fafafa;border-top:1px solid #f0f0f0;padding:14px 24px;text-align:center}
.footer p{font-size:11px;color:#aaa;margin-top:2px}
.btn{display:block;width:calc(100% - 48px);margin:16px auto;padding:12px;background:linear-gradient(135deg,#b91c1c,#991b1b);color:white;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.3px}
@media print{body{background:white;padding:0}.card{box-shadow:none;border-radius:0;max-width:100%}.btn{display:none}}
</style>
</head>
<body>
<div class="wrap">
<div class="card">
<div class="top">
  <div class="brand">Compass<span>Motors</span></div>
  <div class="tagline">Motorcycle Installment System</div>
  <div class="rtype">Payment Receipt</div>
  <div class="rnum">${payment.receiptNumber}</div>
</div>
<div class="amount-box">
  <div class="alabel">Amount Paid</div>
  <div class="amount">${ghs(payment.amount)}</div>
</div>
<div class="rows">
  <div class="row"><span class="rl">Customer</span><span class="rv">${c?.fullName || "—"}</span></div>
  <div class="row"><span class="rl">Customer ID</span><span class="rv">${c?.customerId || "—"}</span></div>
  <div class="row"><span class="rl">Phone</span><span class="rv">${c?.phone || "—"}</span></div>
  <div class="row"><span class="rl">Contract</span><span class="rv">${contract?.contractNumber || "—"}</span></div>
  <div class="row"><span class="rl">Method</span><span class="rv">${cap(payment.paymentMethod)}</span></div>
  <div class="row"><span class="rl">Date</span><span class="rv">${date}</span></div>
  <div class="row"><span class="rl">Time</span><span class="rv">${time}</span></div>
  <div class="row"><span class="rl">Balance After</span><span class="rv red">${ghs(payment.balanceAfter)}</span></div>
  ${payment.notes ? `<div class="row"><span class="rl">Notes</span><span class="rv">${payment.notes}</span></div>` : ""}
</div>
<div class="footer">
  <p style="color:#555;font-weight:600">Thank you for your payment!</p>
  <p>Compass Motors · 0593920144</p>
  <p>cmsspass@gmail.com</p>
</div>
<button class="btn" onclick="window.print()">Print Receipt</button>
</div>
</div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    return new NextResponse("Server error", { status: 500 });
  }
}

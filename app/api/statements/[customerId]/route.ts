import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Contract from "@/lib/db/models/Contract";
import Payment from "@/lib/db/models/Payment";
import { rateLimit, getIP, TOO_MANY } from "@/lib/rate-limit";

function ghs(n: number) {
  return `GHS ${n.toFixed(2)}`;
}
function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GH", { year: "numeric", month: "short", day: "numeric" });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const ip = getIP(req);
  if (!rateLimit(`statement:${ip}`, 10, 60_000)) return TOO_MANY(60);

  try {
    const session = await auth();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { customerId } = await params;
    await connectDB();

    const customer = await Customer.findById(customerId).select("-password -__v");
    if (!customer) return new NextResponse("Customer not found", { status: 404 });

    const role = (session.user as any)?.role;
    const uid  = (session.user as any)?.id;
    if (role === "customer" && customerId !== uid) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const contracts = await Contract.find({ customer: customerId })
      .populate("motorcycle", "brand model year")
      .sort({ createdAt: -1 });

    const payments = await Payment.find({ customer: customerId, status: "successful" })
      .populate("contract", "contractNumber")
      .sort({ createdAt: -1 });

    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    const activeContract = contracts.find((c) => ["active", "overdue"].includes(c.status));

    const paymentRows = payments.map((p: any) => `
      <tr>
        <td>${fmtDate(p.createdAt)}</td>
        <td style="font-family:monospace">${p.receiptNumber}</td>
        <td>${p.contract?.contractNumber || "—"}</td>
        <td style="text-align:right;color:#16a34a;font-weight:600">${ghs(p.amount)}</td>
        <td>${p.paymentMethod.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</td>
        <td style="text-align:right;color:#dc2626">${ghs(p.balanceAfter)}</td>
      </tr>`).join("");

    const generated = new Date().toLocaleString("en-GH", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Statement — ${customer.fullName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f0;padding:32px 16px}
.page{max-width:720px;margin:auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.header{background:linear-gradient(135deg,#b91c1c,#7f1d1d);padding:28px 32px;color:white;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px}
.brand{font-size:22px;font-weight:900;letter-spacing:-0.5px}
.brand span{opacity:.65}
.tagline{font-size:11px;opacity:.65;margin-top:3px}
.stmt-label{font-size:11px;opacity:.75;text-transform:uppercase;letter-spacing:1px;margin-top:12px}
.stmt-title{font-size:18px;font-weight:700;margin-top:2px}
.meta{text-align:right}
.meta p{font-size:12px;opacity:.75}
.meta strong{font-size:13px}
.info{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0;border-bottom:1px solid #f0f0f0}
.info-cell{padding:16px 24px;border-right:1px solid #f0f0f0}
.info-cell:last-child{border-right:none}
.info-label{font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px}
.info-value{font-size:14px;font-weight:600;color:#111}
.info-value.green{color:#16a34a}
.info-value.red{color:#dc2626}
.section{padding:24px 24px 0}
.section-title{font-size:13px;font-weight:700;color:#111;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;padding:8px 10px;background:#fafafa;color:#888;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #f0f0f0}
td{padding:10px;border-bottom:1px solid #f9f9f9;color:#333}
tr:last-child td{border-bottom:none}
.footer{padding:20px 24px;text-align:center;border-top:1px solid #f0f0f0;margin-top:24px}
.footer p{font-size:11px;color:#aaa;margin-top:2px}
.btn{display:block;width:200px;margin:16px auto 0;padding:10px;background:linear-gradient(135deg,#b91c1c,#991b1b);color:white;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer}
@media print{body{background:white;padding:0}.page{box-shadow:none;border-radius:0}.btn{display:none}}
</style>
</head>
<body>
<div class="page">
<div class="header">
  <div>
    <div class="brand">Compass<span>Motors</span></div>
    <div class="tagline">Motorcycle Installment System</div>
    <div class="stmt-label">Account Statement</div>
    <div class="stmt-title">${customer.fullName}</div>
  </div>
  <div class="meta">
    <p>Customer ID</p>
    <strong>${customer.customerId}</strong>
    <p style="margin-top:8px">Generated</p>
    <strong style="font-size:11px">${generated}</strong>
  </div>
</div>

<div class="info">
  <div class="info-cell">
    <div class="info-label">Phone</div>
    <div class="info-value">${customer.phone}</div>
  </div>
  <div class="info-cell">
    <div class="info-label">Status</div>
    <div class="info-value">${customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}</div>
  </div>
  <div class="info-cell">
    <div class="info-label">Total Paid</div>
    <div class="info-value green">${ghs(totalPaid)}</div>
  </div>
  <div class="info-cell">
    <div class="info-label">Outstanding</div>
    <div class="info-value red">${ghs(activeContract ? activeContract.remainingBalance : 0)}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Contracts (${contracts.length})</div>
  <table>
    <thead><tr>
      <th>Contract No</th><th>Type</th><th>Motorcycle</th>
      <th style="text-align:right">Price</th><th style="text-align:right">Paid</th>
      <th style="text-align:right">Balance</th><th>Status</th>
    </tr></thead>
    <tbody>
    ${contracts.map((c: any) => `<tr>
      <td style="font-family:monospace">${c.contractNumber}</td>
      <td>${c.contractType === "work-and-pay" ? "Work & Pay" : "Installment"}</td>
      <td>${(c.motorcycle as any)?.brand} ${(c.motorcycle as any)?.model} (${(c.motorcycle as any)?.year})</td>
      <td style="text-align:right">${ghs(c.sellingPrice)}</td>
      <td style="text-align:right;color:#16a34a">${ghs(c.totalPaid)}</td>
      <td style="text-align:right;color:#dc2626">${ghs(c.remainingBalance)}</td>
      <td>${c.status.charAt(0).toUpperCase() + c.status.slice(1)}</td>
    </tr>`).join("")}
    </tbody>
  </table>
</div>

<div class="section" style="padding-top:24px">
  <div class="section-title">Payment History (${payments.length})</div>
  ${payments.length === 0 ? '<p style="color:#aaa;font-size:13px;padding:16px 0">No payments recorded yet.</p>' : `
  <table>
    <thead><tr>
      <th>Date</th><th>Receipt</th><th>Contract</th>
      <th style="text-align:right">Amount</th><th>Method</th>
      <th style="text-align:right">Balance After</th>
    </tr></thead>
    <tbody>${paymentRows}</tbody>
  </table>`}
</div>

<div class="footer">
  <p style="font-weight:600;color:#555">Compass Motors — Official Account Statement</p>
  <p>Phone: 0593920144 · Email: cmsspass@gmail.com</p>
  <p>This statement is generated automatically and is valid without a signature.</p>
</div>
<button class="btn" onclick="window.print()">Print Statement</button>
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

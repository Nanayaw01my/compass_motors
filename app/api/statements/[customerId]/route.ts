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

    const outstanding = activeContract ? activeContract.remainingBalance : 0;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="format-detection" content="telephone=no"/>
<title>Statement — ${customer.fullName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f0;padding:24px 12px}
.page{max-width:720px;margin:auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.header{background:linear-gradient(135deg,#b91c1c,#7f1d1d);padding:24px 24px 28px;color:white}
.header-top{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:20px}
.brand{font-size:22px;font-weight:900;letter-spacing:-0.5px;color:white}
.brand-sub{font-size:11px;color:rgba(255,255,255,0.65);margin-top:3px}
.meta{text-align:right}
.meta-label{font-size:10px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:.8px}
.meta-value{font-size:13px;font-weight:700;color:white;margin-top:1px}
.divider{height:1px;background:rgba(255,255,255,0.15);margin:0 0 16px}
.stmt-label{font-size:10px;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px}
.stmt-name{font-size:20px;font-weight:800;color:white}
.info{display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid #f0f0f0}
.info-cell{padding:14px 20px;border-right:1px solid #f0f0f0}
.info-cell:nth-child(2n){border-right:none}
.info-label{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px}
.info-value{font-size:14px;font-weight:700;color:#111}
.info-value a{color:#111;text-decoration:none}
.info-value.green{color:#16a34a}
.info-value.red{color:#dc2626}
.info-value.muted{color:#999;font-weight:500}
.section{padding:20px 20px 0}
.section-title{font-size:12px;font-weight:800;color:#111;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px}
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
table{width:100%;border-collapse:collapse;font-size:12px;min-width:480px}
th{text-align:left;padding:8px 10px;background:#fafafa;color:#888;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #f0f0f0;white-space:nowrap}
td{padding:10px;border-bottom:1px solid #f9f9f9;color:#333;white-space:nowrap}
tr:last-child td{border-bottom:none}
.no-data{font-size:13px;color:#bbb;padding:16px 0}
.footer{padding:16px 20px;text-align:center;border-top:1px solid #f0f0f0;margin-top:20px}
.footer p{font-size:11px;color:#aaa;margin-top:2px;line-height:1.5}
.btn{display:block;width:180px;margin:14px auto 0;padding:10px;background:linear-gradient(135deg,#b91c1c,#991b1b);color:white;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:.3px}
@media(max-width:480px){.info{grid-template-columns:1fr 1fr}.header-top{flex-direction:column}.meta{text-align:left}}
@media print{body{background:white;padding:0}.page{box-shadow:none;border-radius:0}.btn{display:none}}
</style>
</head>
<body>
<div class="page">

<div class="header">
  <div class="header-top">
    <div>
      <div class="brand">Compass Motors</div>
      <div class="brand-sub">Motorcycle Installment System</div>
    </div>
    <div class="meta">
      <div class="meta-label">Customer ID</div>
      <div class="meta-value">${customer.customerId}</div>
      <div class="meta-label" style="margin-top:8px">Generated</div>
      <div class="meta-value" style="font-size:11px;font-weight:600">${generated}</div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="stmt-label">Account Statement</div>
  <div class="stmt-name">${customer.fullName}</div>
</div>

<div class="info">
  <div class="info-cell">
    <div class="info-label">Phone</div>
    <div class="info-value"><a href="tel:${customer.phone}">${customer.phone}</a></div>
  </div>
  <div class="info-cell">
    <div class="info-label">Status</div>
    <div class="info-value">${customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}</div>
  </div>
  <div class="info-cell" style="border-top:1px solid #f0f0f0">
    <div class="info-label">Total Paid</div>
    <div class="info-value ${totalPaid > 0 ? "green" : "muted"}">${ghs(totalPaid)}</div>
  </div>
  <div class="info-cell" style="border-top:1px solid #f0f0f0">
    <div class="info-label">Outstanding</div>
    <div class="info-value ${outstanding > 0 ? "red" : "muted"}">${activeContract ? ghs(outstanding) : "—"}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Contracts (${contracts.length})</div>
  ${contracts.length === 0
    ? '<p class="no-data">No contracts recorded yet.</p>'
    : `<div class="scroll"><table>
    <thead><tr>
      <th>Contract No</th><th>Type</th><th>Motorcycle</th>
      <th style="text-align:right">Price</th><th style="text-align:right">Paid</th>
      <th style="text-align:right">Balance</th><th>Status</th>
    </tr></thead>
    <tbody>
    ${contracts.map((c: any) => `<tr>
      <td style="font-family:monospace;font-weight:700">${c.contractNumber}</td>
      <td>${c.contractType === "work-and-pay" ? "Work & Pay" : "Installment"}</td>
      <td>${(c.motorcycle as any)?.brand} ${(c.motorcycle as any)?.model} (${(c.motorcycle as any)?.year})</td>
      <td style="text-align:right">${ghs(c.sellingPrice)}</td>
      <td style="text-align:right;color:#16a34a;font-weight:600">${ghs(c.totalPaid)}</td>
      <td style="text-align:right;color:#dc2626;font-weight:600">${ghs(c.remainingBalance)}</td>
      <td>${c.status.charAt(0).toUpperCase() + c.status.slice(1)}</td>
    </tr>`).join("")}
    </tbody>
  </table></div>`}
</div>

<div class="section" style="padding-top:20px">
  <div class="section-title">Payment History (${payments.length})</div>
  ${payments.length === 0
    ? '<p class="no-data">No payments recorded yet.</p>'
    : `<div class="scroll"><table>
    <thead><tr>
      <th>Date</th><th>Receipt</th><th>Contract</th>
      <th style="text-align:right">Amount</th><th>Method</th>
      <th style="text-align:right">Balance After</th>
    </tr></thead>
    <tbody>${paymentRows}</tbody>
  </table></div>`}
</div>

<div class="footer">
  <p style="font-weight:700;color:#444;font-size:12px">Compass Motors — Official Account Statement</p>
  <p>Phone: 0593920144 &middot; Email: cmsspass@gmail.com</p>
  <p>Generated automatically &middot; Valid without signature</p>
</div>
<button class="btn" onclick="window.print()">&#128438; Print Statement</button>

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

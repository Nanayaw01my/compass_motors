"use client";
import React, { useState } from "react";
import { MessageSquare, CheckCircle, AlertTriangle, ChevronDown } from "lucide-react";

interface Props {
  phone: string;
  name: string;
  installmentAmount?: number;
  remainingBalance: number;
  contractStatus: string;
}

type ReminderType = "reminder" | "overdue";

export function SendReminderButton({ phone, name, installmentAmount, remainingBalance, contractStatus }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ReminderType | null>(null);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const send = async (type: ReminderType) => {
    setOpen(false);
    setLoading(type);
    setResult(null);
    try {
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name,
          type,
          amount: installmentAmount || remainingBalance,
        }),
      });
      const data = await res.json();
      setResult(res.ok
        ? { ok: true,  msg: "SMS sent successfully" }
        : { ok: false, msg: data.error || "Failed to send SMS" }
      );
    } catch {
      setResult({ ok: false, msg: "Network error — could not send SMS" });
    } finally {
      setLoading(null);
      setTimeout(() => setResult(null), 4000);
    }
  };

  const busy = loading !== null;

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => { if (!busy) setOpen(o => !o); }}
        disabled={busy}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all disabled:opacity-50"
        style={{ borderColor: "#e5e5e5", background: busy ? "#f9f9f9" : "#fff", color: "#374151" }}
      >
        <span className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" style={{ color: "#b91c1c" }} />
          {busy ? `Sending ${loading === "reminder" ? "reminder" : "overdue notice"}…` : "Send SMS Reminder"}
        </span>
        {!busy && <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 mt-1 z-20 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            <button
              onClick={() => send("reminder")}
              className="w-full px-4 py-3.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <p className="text-sm font-semibold text-gray-900">Payment Reminder</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Remind {name.split(" ")[0]} their installment is due
              </p>
            </button>
            <button
              onClick={() => send("overdue")}
              className="w-full px-4 py-3.5 text-left hover:bg-red-50 transition-colors"
            >
              <p className="text-sm font-semibold text-red-600">Overdue Notice</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Alert {name.split(" ")[0]} their payment is overdue
              </p>
            </button>
          </div>
        </>
      )}

      {/* Result toast */}
      {result && (
        <div
          className="mt-2 flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
          style={{
            background: result.ok ? "#ecfdf5" : "#fef2f2",
            color: result.ok ? "#065f46" : "#b91c1c",
            border: `1px solid ${result.ok ? "#a7f3d0" : "#fecaca"}`,
          }}
        >
          {result.ok
            ? <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            : <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          }
          {result.msg}
        </div>
      )}
    </div>
  );
}

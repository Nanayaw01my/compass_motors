"use client";
import React, { useState } from "react";
import { AlertCircle, MessageSquare, Loader2, CheckCircle, RefreshCw } from "lucide-react";

type Phase = "idle" | "loading" | "done" | "error";

export function BulkActions() {
  const [overduePhase, setOverduePhase] = useState<Phase>("idle");
  const [overdueCount, setOverdueCount] = useState(0);

  const [smsPhase, setSmsPhase] = useState<Phase>("idle");
  const [smsConfirm, setSmsConfirm] = useState(false);
  const [smsResult, setSmsResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  async function checkOverdue() {
    setOverduePhase("loading");
    try {
      const res = await fetch("/api/cron/overdue", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOverdueCount(data.marked);
      setOverduePhase("done");
      setTimeout(() => setOverduePhase("idle"), 6000);
    } catch {
      setOverduePhase("error");
      setTimeout(() => setOverduePhase("idle"), 4000);
    }
  }

  async function sendBulkSMS() {
    setSmsConfirm(false);
    setSmsPhase("loading");
    try {
      const res = await fetch("/api/sms/bulk", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSmsResult(data);
      setSmsPhase("done");
      setTimeout(() => setSmsPhase("idle"), 8000);
    } catch {
      setSmsPhase("error");
      setTimeout(() => setSmsPhase("idle"), 4000);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* ── Check Overdue ── */}
      <button
        onClick={checkOverdue}
        disabled={overduePhase === "loading"}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-60"
        style={
          overduePhase === "done"
            ? { borderColor: "#bbf7d0", background: "#f0fdf4", color: "#15803d" }
            : overduePhase === "error"
            ? { borderColor: "#fecaca", background: "#fef2f2", color: "#dc2626" }
            : { borderColor: "#fecaca", background: "#fef2f2", color: "#dc2626" }
        }
      >
        {overduePhase === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : overduePhase === "done" ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        {overduePhase === "loading"
          ? "Checking…"
          : overduePhase === "done"
          ? `${overdueCount} marked overdue`
          : overduePhase === "error"
          ? "Check failed"
          : "Check Overdue"}
      </button>

      {/* ── Bulk SMS ── */}
      {smsConfirm ? (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50">
          <span className="text-xs text-amber-700 font-medium">SMS all overdue customers?</span>
          <button
            onClick={sendBulkSMS}
            className="px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
          >
            Send
          </button>
          <button
            onClick={() => setSmsConfirm(false)}
            className="px-2 py-1 rounded-lg text-xs text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => smsPhase === "idle" ? setSmsConfirm(true) : undefined}
          disabled={smsPhase === "loading"}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-60"
          style={
            smsPhase === "done"
              ? { borderColor: "#bbf7d0", background: "#f0fdf4", color: "#15803d" }
              : smsPhase === "error"
              ? { borderColor: "#fecaca", background: "#fef2f2", color: "#dc2626" }
              : { borderColor: "#fde68a", background: "#fffbeb", color: "#92400e" }
          }
        >
          {smsPhase === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : smsPhase === "done" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <MessageSquare className="w-4 h-4" />
          )}
          {smsPhase === "loading"
            ? "Sending…"
            : smsPhase === "done"
            ? `${smsResult?.sent ?? 0}/${smsResult?.total ?? 0} SMS sent`
            : smsPhase === "error"
            ? "SMS failed"
            : "SMS Overdue Customers"}
        </button>
      )}
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export function ClearDataButton() {
  const [step, setStep] = useState<"idle" | "confirm" | "loading" | "done">("idle");
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState("");

  const handleClear = async () => {
    setStep("loading");
    setError("");
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data.deleted);
      setStep("done");
    } catch (err: any) {
      setError(err.message);
      setStep("confirm");
    }
  };

  if (step === "done" && result) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-5">
        <p className="font-semibold text-green-700 mb-3">All data cleared successfully</p>
        <div className="space-y-1 text-sm text-green-600">
          {Object.entries(result).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="capitalize">{k}</span>
              <span className="font-mono font-bold">{v} deleted</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => { setStep("idle"); setResult(null); }}
          className="mt-4 text-xs text-green-600 underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="rounded-xl border-2 border-red-300 bg-red-50 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700">This will permanently delete:</p>
            <ul className="mt-2 text-sm text-red-600 space-y-0.5 list-disc list-inside">
              <li>All customers and their accounts</li>
              <li>All contracts</li>
              <li>All payment records</li>
              <li>All motorcycles</li>
              <li>All audit logs</li>
            </ul>
            <p className="mt-3 text-sm font-semibold text-red-700">Admin account will be preserved. This cannot be undone.</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-700 bg-red-100 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => setStep("idle")}
            className="flex-1 h-10 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleClear}
            className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"
          >
            Yes, Delete Everything
          </button>
        </div>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
        <p className="text-sm font-medium text-gray-600">Clearing all data…</p>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep("confirm")}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 font-semibold text-sm transition-all group"
    >
      <Trash2 className="w-4 h-4" />
      Clear All Data
    </button>
  );
}

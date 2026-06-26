"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PauseCircle, PlayCircle, XCircle, Loader2, ChevronDown } from "lucide-react";

type Status = "active" | "overdue" | "suspended" | "completed" | "cancelled";

interface Props {
  contractId: string;
  status: Status;
  currentNotes?: string;
}

const TRANSITIONS: Record<Status, { to: Status; label: string; icon: React.ReactNode; color: string }[]> = {
  active:    [
    { to: "suspended", label: "Suspend Contract", icon: <PauseCircle className="w-4 h-4" />, color: "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100" },
    { to: "cancelled", label: "Cancel Contract",  icon: <XCircle    className="w-4 h-4" />, color: "text-red-700 bg-red-50 border-red-200 hover:bg-red-100" },
  ],
  overdue:   [
    { to: "active",    label: "Mark Active",      icon: <PlayCircle  className="w-4 h-4" />, color: "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
    { to: "suspended", label: "Suspend Contract", icon: <PauseCircle className="w-4 h-4" />, color: "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100" },
    { to: "cancelled", label: "Cancel Contract",  icon: <XCircle    className="w-4 h-4" />, color: "text-red-700 bg-red-50 border-red-200 hover:bg-red-100" },
  ],
  suspended: [
    { to: "active",    label: "Resume Contract",  icon: <PlayCircle  className="w-4 h-4" />, color: "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
    { to: "cancelled", label: "Cancel Contract",  icon: <XCircle    className="w-4 h-4" />, color: "text-red-700 bg-red-50 border-red-200 hover:bg-red-100" },
  ],
  completed: [],
  cancelled: [],
};

export function ContractActions({ contractId, status, currentNotes }: Props) {
  const router = useRouter();
  const actions = TRANSITIONS[status] ?? [];

  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<(typeof actions)[0] | null>(null);
  const [notes, setNotes] = useState(currentNotes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (actions.length === 0) return null;

  function pick(action: (typeof actions)[0]) {
    setChosen(action);
    setOpen(false);
    setError("");
  }

  async function confirm() {
    if (!chosen) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/contracts/${contractId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: chosen.to, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setChosen(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        Actions
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-200 bg-white shadow-lg z-20 overflow-hidden">
            {actions.map((a) => (
              <button
                key={a.to}
                onClick={() => pick(a)}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold border-b border-gray-100 last:border-0 transition-colors ${a.color}`}
              >
                {a.icon}
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {chosen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`p-2 rounded-xl border ${chosen.color}`}>{chosen.icon}</span>
              <div>
                <p className="font-bold text-gray-900">{chosen.label}</p>
                <p className="text-xs text-gray-400">Status will change to <strong>{chosen.to}</strong></p>
              </div>
            </div>

            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Notes / Reason <span className="text-gray-300">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Customer requested deferral until next month"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />

            {error && (
              <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setChosen(null)}
                className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirm}
                disabled={loading}
                className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

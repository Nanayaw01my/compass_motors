"use client";
import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

const STATUSES = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "overdue", label: "Overdue" },
  { value: "suspended", label: "Suspended" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function ContractSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  function apply(q: string, s: string) {
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (s) params.set("status", s);
    startTransition(() => {
      router.push(`/admin/contracts?${params.toString()}`);
    });
  }

  function onQuery(val: string) {
    setQuery(val);
    apply(val, status);
  }

  function onStatus(val: string) {
    setStatus(val);
    apply(query, val);
  }

  function clear() {
    setQuery("");
    setStatus("");
    startTransition(() => router.push("/admin/contracts"));
  }

  const dirty = query || status;

  return (
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search customer or contract…"
          className="w-full pl-9 pr-4 h-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-white"
        />
      </div>

      {/* Status filter */}
      <select
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        className="h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-red-400 text-gray-700"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Clear */}
      {dirty && (
        <button
          onClick={clear}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

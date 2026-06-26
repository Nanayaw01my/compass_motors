"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Trash2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

export function AdminUsersPanel({ admins: initial, currentAdminId }: { admins: AdminUser[]; currentAdminId: string }) {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ name: "", username: "", email: "", phone: "", password: "" });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create admin"); return; }
      setAdmins((prev) => [...prev, data.admin]);
      setForm({ name: "", username: "", email: "", phone: "", password: "" });
      setShowForm(false);
      setSuccess(`Admin "${data.admin.name}" created successfully!`);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to delete"); return; }
      setAdmins((prev) => prev.filter((a) => a._id !== id));
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-600" /> Admin Users
            </CardTitle>
            <p className="text-xs text-gray-400 mt-0.5">{admins.length} admin{admins.length !== 1 ? "s" : ""} · all can log in with full access</p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setError(""); setSuccess(""); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Admin
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {(error || success) && (
          <div className={`mx-5 mb-3 px-4 py-2.5 rounded-xl text-sm font-medium ${error ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
            {error || success}
          </div>
        )}

        {/* Add Admin Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="mx-5 mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <p className="text-sm font-black text-gray-900">New Admin Account</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold">Full Name *</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. John Mensah" className="mt-1" required />
              </div>
              <div>
                <Label className="text-xs font-bold">Username *</Label>
                <Input value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="e.g. john" className="mt-1" required />
              </div>
              <div>
                <Label className="text-xs font-bold">Email (optional)</Label>
                <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@example.com" type="email" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-bold">Phone (optional)</Label>
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0XXXXXXXXX" type="tel" className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold">Password *</Label>
              <div className="relative mt-1">
                <Input
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  className="pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" loading={loading} className="text-xs">Create Admin</Button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Admin List */}
        <div className="divide-y divide-gray-100">
          {admins.map((a) => {
            const isMe = a._id === currentAdminId;
            return (
              <div key={a._id} className="flex items-center gap-3 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-sm">{a.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{a.name}</p>
                    {isMe && <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">You</span>}
                  </div>
                  <p className="text-xs text-gray-400">@{a.username} · {a.email}</p>
                </div>
                {!isMe && (
                  <button
                    onClick={() => handleDelete(a._id)}
                    disabled={deleteId === a._id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

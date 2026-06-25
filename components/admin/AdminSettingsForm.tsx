"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminSettingsForm({ admin }: { admin: { _id: string; name: string; email: string; phone: string } }) {
  const [name, setName] = useState(admin.name);
  const [phone, setPhone] = useState(admin.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");
    try {
      const body: Record<string, string> = { name, phone };
      if (newPassword) {
        body.password = newPassword;
      }
      await fetch(`/api/admin/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setMessage("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setMessage("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Admin Profile</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {message && <div className="text-sm text-green-600 font-medium">{message}</div>}
        <div><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
        <div><Label>Email</Label><Input value={admin.email} disabled className="mt-1 bg-gray-50" /></div>
        <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" type="tel" /></div>
        <hr className="border-gray-200" />
        <p className="text-sm font-medium text-gray-700">Change Password</p>
        <div><Label>New Password</Label><Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1" type="password" placeholder="Leave blank to keep current" /></div>
        <Button onClick={handleUpdate} loading={loading}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}

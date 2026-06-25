"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldOff, Shield, Trash2 } from "lucide-react";

export function CustomerActions({ customerId, currentStatus }: { customerId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    await fetch(`/api/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  };

  const deleteCustomer = async () => {
    setLoading(true);
    await fetch(`/api/customers/${customerId}`, { method: "DELETE" });
    setLoading(false);
    router.push("/admin/customers");
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        loading={loading}
        onClick={toggleStatus}
      >
        {currentStatus === "suspended" ? (
          <><Shield className="w-4 h-4 mr-1 text-green-600" /> Activate</>
        ) : (
          <><ShieldOff className="w-4 h-4 mr-1 text-orange-600" /> Suspend</>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => setShowDelete(true)}
      >
        <Trash2 className="w-4 h-4 mr-1" /> Delete Customer
      </Button>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">This action cannot be undone. All data for this customer will be permanently removed.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" loading={loading} onClick={deleteCustomer}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

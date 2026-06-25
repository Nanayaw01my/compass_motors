"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Bike, AlertCircle } from "lucide-react";

export function NewMotorcycleForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    brand: "", model: "", year: new Date().getFullYear().toString(),
    engineNumber: "", chassisNumber: "",
    sellingPrice: "", installmentPrice: "", quantity: "1",
    description: "",
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand || !form.model || !form.sellingPrice || !form.installmentPrice) {
      setError("Brand, model, and prices are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/motorcycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: parseInt(form.year),
          sellingPrice: parseFloat(form.sellingPrice),
          installmentPrice: parseFloat(form.installmentPrice),
          quantity: parseInt(form.quantity),
          images,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/admin/motorcycles");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="w-5 h-5 text-red-600" /> Motorcycle Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Brand *</Label><Input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Yamaha, Honda, TVS" className="mt-1" required /></div>
            <div><Label>Model *</Label><Input value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g. FZ150, CB150R" className="mt-1" required /></div>
            <div><Label>Year *</Label><Input value={form.year} onChange={(e) => set("year", e.target.value)} type="number" min="2000" max="2030" className="mt-1" required /></div>
            <div><Label>Quantity</Label><Input value={form.quantity} onChange={(e) => set("quantity", e.target.value)} type="number" min="1" className="mt-1" /></div>
            <div><Label>Engine Number</Label><Input value={form.engineNumber} onChange={(e) => set("engineNumber", e.target.value)} placeholder="Engine No." className="mt-1" /></div>
            <div><Label>Chassis Number</Label><Input value={form.chassisNumber} onChange={(e) => set("chassisNumber", e.target.value)} placeholder="Chassis No." className="mt-1" /></div>
            <div>
              <Label>Selling Price (GHS) *</Label>
              <Input value={form.sellingPrice} onChange={(e) => set("sellingPrice", e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className="mt-1" required />
            </div>
            <div>
              <Label>Installment Price (GHS) *</Label>
              <Input value={form.installmentPrice} onChange={(e) => set("installmentPrice", e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className="mt-1" required />
              <p className="text-xs text-gray-400 mt-1">Total price under installment plan</p>
            </div>
          </div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Additional details..." className="mt-1" /></div>
          <div>
            <Label>Motorcycle Images</Label>
            <div className="grid sm:grid-cols-2 gap-3 mt-1">
              {[0, 1, 2, 3].map((i) => (
                <ImageUpload
                  key={i}
                  current={images[i]}
                  onUpload={(url) => {
                    const updated = [...images];
                    updated[i] = url;
                    setImages(updated.filter(Boolean));
                  }}
                  label={`Image ${i + 1}`}
                  folder="motorcycles"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" loading={loading}>Add Motorcycle</Button>
      </div>
    </form>
  );
}

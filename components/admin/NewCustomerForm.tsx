"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { User, Phone, MapPin, CreditCard, AlertCircle, Shield, CheckCircle } from "lucide-react";

const SECTIONS = ["Personal Info", "Identification", "Emergency Contact", "Guarantor"];

export function NewCustomerForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ customerId: string; username: string; password: string } | null>(null);

  const [form, setForm] = useState({
    fullName: "", phone: "", altPhone: "", email: "",
    dateOfBirth: "", gender: "", occupation: "",
    residentialAddress: "", gpsAddress: "",
    ghanaCardNumber: "", ghanaCardFront: "", ghanaCardBack: "", passportPhoto: "",
    emergencyName: "", emergencyRelationship: "", emergencyPhone: "", emergencyAddress: "",
    guarantorName: "", guarantorPhone: "", guarantorAddress: "",
    guarantorOccupation: "", guarantorGhanaCard: "", guarantorPhoto: "",
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create customer");
      setSuccess({ customerId: data.customerId, username: data.username, password: data.password });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="py-12 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Registered!</h2>
          <p className="text-gray-500">Account has been created and login credentials sent via SMS.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Customer ID</span>
              <span className="font-mono font-semibold text-red-600">{success.customerId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Username (Phone)</span>
              <span className="font-mono font-semibold">{success.username}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Temporary Password</span>
              <span className="font-mono font-semibold">{success.password}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/admin/customers")}>
              All Customers
            </Button>
            <Button className="flex-1" onClick={() => router.push(`/admin/contracts/new`)}>
              Create Contract
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {SECTIONS.map((section, i) => (
          <React.Fragment key={i}>
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                i === step ? "text-red-600" : i < step ? "text-green-600 cursor-pointer" : "text-gray-400"
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i === step ? "bg-red-600 text-white" : i < step ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {i < step ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{section}</span>
            </button>
            {i < SECTIONS.length - 1 && <div className="flex-1 h-0.5 bg-gray-200" />}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Step 0: Personal Info */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-red-600" /> Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full Name *</Label><Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="e.g. Kwame Mensah" className="mt-1" required /></div>
              <div><Label>Phone Number *</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0244123456" className="mt-1" type="tel" required /></div>
              <div><Label>Alternative Phone</Label><Input value={form.altPhone} onChange={(e) => set("altPhone", e.target.value)} placeholder="0551234567" className="mt-1" type="tel" /></div>
              <div><Label>Email Address</Label><Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="kwame@email.com" className="mt-1" type="email" /></div>
              <div><Label>Date of Birth</Label><Input value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} className="mt-1" type="date" /></div>
              <div>
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Occupation</Label><Input value={form.occupation} onChange={(e) => set("occupation", e.target.value)} placeholder="e.g. Trader" className="mt-1" /></div>
            </div>
            <div><Label>Residential Address</Label><Textarea value={form.residentialAddress} onChange={(e) => set("residentialAddress", e.target.value)} placeholder="House No, Street, City" className="mt-1" /></div>
            <div><Label>GPS Address</Label><Input value={form.gpsAddress} onChange={(e) => set("gpsAddress", e.target.value)} placeholder="GR-123-4567" className="mt-1" /></div>
            <div className="pt-2">
              <Label>Passport Photo</Label>
              <ImageUpload
                onUpload={(url) => set("passportPhoto", url)}
                current={form.passportPhoto}
                label="Upload passport photo"
                folder="customers/photos"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Identification */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-red-600" /> Identification Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Ghana Card Number *</Label><Input value={form.ghanaCardNumber} onChange={(e) => set("ghanaCardNumber", e.target.value)} placeholder="GHA-XXXXXXXXX-X" className="mt-1" required /></div>
            <div>
              <Label>Ghana Card Front Image</Label>
              <ImageUpload onUpload={(url) => set("ghanaCardFront", url)} current={form.ghanaCardFront} label="Upload front of Ghana Card" folder="customers/id" />
            </div>
            <div>
              <Label>Ghana Card Back Image</Label>
              <ImageUpload onUpload={(url) => set("ghanaCardBack", url)} current={form.ghanaCardBack} label="Upload back of Ghana Card" folder="customers/id" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Emergency Contact */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-600" /> Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full Name</Label><Input value={form.emergencyName} onChange={(e) => set("emergencyName", e.target.value)} placeholder="Contact name" className="mt-1" /></div>
              <div><Label>Relationship</Label><Input value={form.emergencyRelationship} onChange={(e) => set("emergencyRelationship", e.target.value)} placeholder="e.g. Spouse, Parent" className="mt-1" /></div>
              <div><Label>Phone Number</Label><Input value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} placeholder="0244123456" className="mt-1" type="tel" /></div>
            </div>
            <div><Label>Address</Label><Textarea value={form.emergencyAddress} onChange={(e) => set("emergencyAddress", e.target.value)} placeholder="Emergency contact address" className="mt-1" /></div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Guarantor */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-red-600" /> Guarantor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Guarantor Name</Label><Input value={form.guarantorName} onChange={(e) => set("guarantorName", e.target.value)} placeholder="Full name" className="mt-1" /></div>
              <div><Label>Guarantor Phone</Label><Input value={form.guarantorPhone} onChange={(e) => set("guarantorPhone", e.target.value)} placeholder="0244123456" className="mt-1" type="tel" /></div>
              <div><Label>Occupation</Label><Input value={form.guarantorOccupation} onChange={(e) => set("guarantorOccupation", e.target.value)} placeholder="e.g. Teacher" className="mt-1" /></div>
              <div><Label>Ghana Card Number</Label><Input value={form.guarantorGhanaCard} onChange={(e) => set("guarantorGhanaCard", e.target.value)} placeholder="GHA-XXXXXXXXX-X" className="mt-1" /></div>
            </div>
            <div><Label>Address</Label><Textarea value={form.guarantorAddress} onChange={(e) => set("guarantorAddress", e.target.value)} placeholder="Guarantor address" className="mt-1" /></div>
            <div>
              <Label>Guarantor Photo</Label>
              <ImageUpload onUpload={(url) => set("guarantorPhoto", url)} current={form.guarantorPhoto} label="Upload guarantor photo" folder="customers/guarantors" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3 justify-between">
        <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          Previous
        </Button>
        {step < SECTIONS.length - 1 ? (
          <Button onClick={() => {
            if (step === 0 && (!form.fullName || !form.phone)) {
              setError("Please fill in Name and Phone Number");
              return;
            }
            setError("");
            setStep((s) => s + 1);
          }}>
            Next Step
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={loading}>
            Register Customer
          </Button>
        )}
      </div>
    </div>
  );
}

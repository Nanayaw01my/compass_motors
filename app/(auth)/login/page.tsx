"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Phone, Lock, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      role: isAdmin ? "admin" : "customer",
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error === "Account suspended" ? "Your account has been suspended. Contact support." : "Invalid credentials. Please try again.");
    } else {
      router.push(isAdmin ? "/admin/dashboard" : "/customer/dashboard");

      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex flex-col w-[45%] bg-gradient-to-br from-red-600 via-red-700 to-red-900 p-12 justify-between">
        <Logo size="md" white />
        <div className="text-white">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Manage your motorcycle payments with ease
          </h2>
          <p className="text-red-200 text-lg">
            Track installments, view contracts, and make payments — all in one secure platform.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: "Active Contracts", value: "500+" },
              { label: "Payments Processed", value: "GHS 2M+" },
              { label: "Happy Customers", value: "400+" },
              { label: "Years in Business", value: "10+" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-red-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-red-300 text-sm">
          <p>Compass Motors · 0593920144 · cmsspass@gmail.com</p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="md" />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500">Sign in to your Compass Motors account</p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => { setIsAdmin(false); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !isAdmin ? "bg-white shadow text-red-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Phone className="w-4 h-4" />
              Customer
            </button>
            <button
              onClick={() => { setIsAdmin(true); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isAdmin ? "bg-white shadow text-red-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="username">{isAdmin ? "Email Address" : "Phone Number"}</Label>
              <div className="relative mt-1">
                <Input
                  id="username"
                  type={isAdmin ? "email" : "tel"}
                  placeholder={isAdmin ? "admin@compassmotors.com" : "0244123456"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base" loading={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Need help? Contact us at</p>
            <a href="tel:0593920144" className="text-red-600 font-medium hover:underline">
              0593920144
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

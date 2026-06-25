"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { SplashScreen } from "@/components/shared/SplashScreen";

export default function LoginPage() {
  const router = useRouter();
  const [splashDone, setSplashDone] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { username, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError(
        result.error === "Account suspended"
          ? "Your account has been suspended. Please contact Compass Motors."
          : result.error === "Database unavailable"
          ? "Service temporarily unavailable. Please try again in a moment."
          : "Invalid credentials. Please check your details and try again."
      );
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}

      <div className="min-h-screen flex">
        {/* ── Left Panel ── */}
        <div
          className="hidden lg:flex flex-col w-[52%] relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #0f0f0f 0%, #1a0303 50%, #0f0f0f 100%)" }}
        >
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#DC2626 1px, transparent 1px), linear-gradient(90deg, #DC2626 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Diagonal accent stripe */}
          <div
            className="absolute -right-20 top-0 bottom-0 w-40 opacity-10"
            style={{ background: "linear-gradient(180deg, transparent, #DC2626, transparent)" }}
          />

          {/* Large background motorcycle silhouette */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
            <svg viewBox="0 0 600 300" className="w-[90%]" fill="white">
              <circle cx="130" cy="210" r="72" />
              <circle cx="470" cy="210" r="72" />
              <path d="M130 210 L180 110 L310 90 L390 120 L470 210" fill="none" strokeWidth="18" stroke="white" strokeLinejoin="round" />
              <path d="M310 90 Q330 40 360 30 L420 60 L390 120" fill="white" />
              <circle cx="355" cy="60" r="34" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full p-14 justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
                  <circle cx="8" cy="22" r="4" fill="white" />
                  <circle cx="24" cy="22" r="4" fill="white" />
                  <path d="M8 22 L16 9 L24 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                  <circle cx="16" cy="9" r="2" fill="white" />
                </svg>
              </div>
              <div>
                <span className="text-white font-bold text-lg tracking-tight">Compass</span>
                <span className="text-red-500 font-bold text-lg tracking-tight ml-1">Motors</span>
              </div>
            </div>

            {/* Headline */}
            <div>
              <div className="inline-block bg-red-600/20 border border-red-600/30 rounded-full px-4 py-1.5 mb-6">
                <span className="text-red-400 text-xs font-semibold tracking-[0.15em] uppercase">
                  Installment Management Platform
                </span>
              </div>
              <h1 className="text-5xl font-bold text-white leading-[1.15] mb-5">
                Manage your<br />
                <span className="text-red-500">motorcycle</span><br />
                payments with ease
              </h1>
              <p className="text-gray-400 text-base leading-relaxed max-w-sm">
                Track installments, manage contracts, and process payments — all from one secure, centralized platform.
              </p>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-2 gap-3">
                {[
                  { label: "Active Contracts", value: "500+" },
                  { label: "Payments Processed", value: "GHS 2M+" },
                  { label: "Happy Customers", value: "400+" },
                  { label: "Years in Business", value: "10+" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl p-4 border border-white/[0.06]"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
                    <div className="text-gray-500 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 text-gray-600 text-xs">
              <span>Compass Motors</span>
              <span className="w-px h-3 bg-gray-700" />
              <span>0593920144</span>
              <span className="w-px h-3 bg-gray-700" />
              <span>cmsspass@gmail.com</span>
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-[400px]">

              {/* Mobile logo */}
              <div className="lg:hidden mb-10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center">
                  <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                    <circle cx="8" cy="22" r="4" fill="white" />
                    <circle cx="24" cy="22" r="4" fill="white" />
                    <path d="M8 22 L16 9 L24 22" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                    <circle cx="16" cy="9" r="2" fill="white" />
                  </svg>
                </div>
                <div>
                  <span className="text-gray-900 font-bold text-lg tracking-tight">Compass</span>
                  <span className="text-red-600 font-bold text-lg tracking-tight ml-1">Motors</span>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Sign in</h2>
                <p className="text-gray-500 text-sm mt-1">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username field */}
                <div className="space-y-1.5">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Phone Number or Email
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="0244123456 or admin@email.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    className="w-full h-11 px-3.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                  />
                </div>

                {/* Password field */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="w-full h-11 px-3.5 pr-10 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold tracking-wide transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">Need help accessing your account?</p>
                <a
                  href="tel:0593920144"
                  className="inline-block mt-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  Call 0593920144
                </a>
              </div>

            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-gray-400">Compass Motors &copy; {new Date().getFullYear()}</span>
            <span className="text-xs text-gray-400">Secured platform</span>
          </div>
        </div>
      </div>
    </>
  );
}

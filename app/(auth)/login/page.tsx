"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { SplashScreen } from "@/components/shared/SplashScreen";
import { Logo } from "@/components/shared/Logo";

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
          ? "Your account has been suspended. Contact Compass Motors."
          : result.error === "Database unavailable"
          ? "Service temporarily unavailable. Please try again shortly."
          : "Invalid credentials. Please check your details."
      );
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}

      <div className="min-h-screen flex" style={{ background: "#f5f5f0" }}>

        {/* ── Left Brand Panel (desktop) ── */}
        <div
          className="hidden lg:flex flex-col w-[50%] relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #111010 0%, #1c0505 60%, #0d0d0d 100%)" }}
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(220,38,38,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.06) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Radial glow */}
          <div
            className="absolute"
            style={{
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(185,28,28,0.18) 0%, transparent 70%)",
              top: "30%",
              left: "20%",
              transform: "translate(-50%,-50%)",
            }}
          />

          {/* Accent line */}
          <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg, transparent, rgba(220,38,38,0.3), transparent)" }} />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full px-12 py-12 justify-between">
            {/* Logo */}
            <Logo white size="md" />

            {/* Main copy */}
            <div>
              <div className="mb-6">
                <span
                  className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border"
                  style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.06)" }}
                >
                  Installment &amp; Work-and-Pay
                </span>
              </div>

              <h1 className="text-[3.25rem] font-bold leading-[1.1] tracking-tight text-white mb-6">
                The smarter way<br />
                to manage<br />
                <span style={{ color: "#f87171" }}>motorcycle sales</span>
              </h1>

              <p className="text-gray-500 text-[15px] leading-relaxed max-w-xs">
                Track contracts, record payments, and monitor installment plans — all from one secure platform.
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 mt-10">
                {[
                  { v: "500+", l: "Active Contracts" },
                  { v: "GHS 2M+", l: "Collected" },
                  { v: "400+", l: "Customers" },
                  { v: "10+", l: "Years Operating" },
                ].map(s => (
                  <div
                    key={s.l}
                    className="rounded-xl px-4 py-3.5 border"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <div className="text-2xl font-bold text-white tracking-tight">{s.v}</div>
                    <div className="text-gray-600 text-xs mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 text-[11px] text-gray-700">
              <span>0593920144</span>
              <span className="w-px h-3 bg-gray-800" />
              <span>cmsspass@gmail.com</span>
              <span className="w-px h-3 bg-gray-800" />
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="flex-1 flex flex-col" style={{ background: "#f5f5f0" }}>

          {/* Mobile top bar */}
          <div
            className="lg:hidden flex items-center px-6 pt-12 pb-8"
            style={{ background: "linear-gradient(160deg, #1a0505 0%, #111010 100%)" }}
          >
            <Logo white size="sm" />
          </div>

          {/* Form container */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-[420px]">

              {/* Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/[0.06] overflow-hidden">

                {/* Card header */}
                <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                  <div className="hidden lg:flex mb-6">
                    <Logo size="sm" />
                  </div>
                  <h2 className="text-[1.6rem] font-bold text-gray-900 tracking-tight leading-tight">Welcome back</h2>
                  <p className="text-gray-400 text-sm mt-1">Sign in to your account to continue</p>
                </div>

                {/* Form body */}
                <div className="px-8 py-7">
                  <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                        Phone or Email
                      </label>
                      <input
                        type="text"
                        placeholder="0244123456 or email@example.com"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        autoComplete="username"
                        required
                        className="w-full h-12 px-4 rounded-xl border text-gray-900 text-sm placeholder:text-gray-300 outline-none transition-all"
                        style={{
                          background: "#fafafa",
                          borderColor: "#e5e5e5",
                        }}
                        onFocus={e => { e.target.style.borderColor = "#b91c1c"; e.target.style.boxShadow = "0 0 0 3px rgba(185,28,28,0.08)"; e.target.style.background = "#fff"; }}
                        onBlur={e => { e.target.style.borderColor = "#e5e5e5"; e.target.style.boxShadow = "none"; e.target.style.background = "#fafafa"; }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          autoComplete="current-password"
                          required
                          className="w-full h-12 px-4 pr-11 rounded-xl border text-gray-900 text-sm placeholder:text-gray-300 outline-none transition-all"
                          style={{
                            background: "#fafafa",
                            borderColor: "#e5e5e5",
                          }}
                          onFocus={e => { e.target.style.borderColor = "#b91c1c"; e.target.style.boxShadow = "0 0 0 3px rgba(185,28,28,0.08)"; e.target.style.background = "#fff"; }}
                          onBlur={e => { e.target.style.borderColor = "#e5e5e5"; e.target.style.boxShadow = "none"; e.target.style.background = "#fafafa"; }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div
                        className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                        style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" }}
                      >
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 rounded-xl text-white font-bold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mt-1"
                      style={{ background: loading ? "#9b1c1c" : "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)", boxShadow: "0 4px 20px rgba(185,28,28,0.3)" }}
                    >
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Signing in...
                        </>
                      ) : "Sign In"}
                    </button>
                  </form>
                </div>

                {/* Card footer */}
                <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/60">
                  <span className="text-xs text-gray-400">Need help?</span>
                  <a href="tel:0593920144" className="text-xs font-bold transition-colors" style={{ color: "#b91c1c" }}>
                    Call 0593920144
                  </a>
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mt-6">
                Compass Motors &copy; {new Date().getFullYear()} &middot; Secured Platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

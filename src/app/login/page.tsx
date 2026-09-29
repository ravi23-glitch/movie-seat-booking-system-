"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Film, Lock, Mail, User, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, switchQuickUser } = useAuth();

  const [mode, setMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "LOGIN") {
        const success = await login(email, password);
        if (success) {
          router.push("/");
        }
      } else {
        const success = await register(name, email, password);
        if (success) {
          router.push("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillCustomer = () => {
    setEmail("alex@example.com");
    setPassword("customer123");
    setMode("LOGIN");
  };

  const handleFillAdmin = () => {
    setEmail("admin@cinema.com");
    setPassword("admin123");
    setMode("LOGIN");
  };

  return (
    <div className="w-full max-w-md mx-auto my-12">
      <div className="rounded-3xl bg-cinema-card border border-cinema-border p-8 shadow-2xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-amber-500 to-amber-300 flex items-center justify-center mx-auto shadow-glow">
            <Film className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {mode === "LOGIN" ? "Welcome Back to CineSync" : "Create CineSync Account"}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === "LOGIN"
              ? "Sign in to reserve tickets and access your digital passes"
              : "Register to enjoy high-speed, zero-conflict movie booking"}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-slate-900/80 p-1 border border-cinema-border text-xs">
          <button
            type="button"
            onClick={() => setMode("LOGIN")}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              mode === "LOGIN" ? "bg-brand-500 text-black shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("REGISTER")}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              mode === "REGISTER" ? "bg-brand-500 text-black shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* Quick Credentials Helper Buttons */}
        <div className="p-3.5 rounded-2xl bg-cinema-darker/80 border border-cinema-border/60 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-brand-400" />
            Quick Demo Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleFillCustomer}
              className="px-2.5 py-1.5 rounded-lg bg-cinema-card hover:bg-cinema-hover border border-slate-700 text-slate-300 hover:text-white text-left transition-all"
            >
              <span className="font-bold text-white block">Alex (Customer)</span>
              <span className="text-[10px] text-slate-500">alex@example.com</span>
            </button>
            <button
              type="button"
              onClick={handleFillAdmin}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/50 text-cyan-300 text-left transition-all"
            >
              <span className="font-bold text-cyan-300 block">Cinema Admin</span>
              <span className="text-[10px] text-cyan-500">admin@cinema.com</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === "REGISTER" && (
            <div>
              <label className="font-semibold text-slate-400 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-400 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-400 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-400 hover:to-amber-400 text-black font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "LOGIN" ? "Sign In & Continue" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-cinema-border/60">
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Continue Browsing as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Film, Ticket, Shield, User, LogOut, Sparkles, Menu, X, MapPin, IndianRupee } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, switchQuickUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Mumbai");

  const cities = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Chennai", "Pune"];

  const navLinks = [
    { label: "Movies", href: "/", icon: Film },
    { label: "My Tickets", href: "/my-bookings", icon: Ticket },
    ...(user?.role === "ADMIN"
      ? [{ label: "Admin Panel", href: "/admin", icon: Shield }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cinema-border/60 bg-cinema-darker/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & City Picker */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-amber-500 to-amber-300 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                CINE<span className="text-brand-400">SYNC</span>
                <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  PRO
                </span>
              </span>
            </div>
          </Link>

          {/* City Selector */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cinema-card/70 border border-cinema-border text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent border-0 text-white font-semibold text-xs focus:outline-none cursor-pointer"
            >
              {cities.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cinema-card text-brand-400 border border-cinema-border shadow-inner"
                    : "text-slate-300 hover:text-white hover:bg-cinema-hover/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-400" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Quick User Role Switcher & Auth */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Currency Indicator */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
            <span>INR (₹)</span>
          </div>

          {/* Quick Persona Switcher for testing */}
          <div className="flex items-center p-1 rounded-xl bg-cinema-card border border-cinema-border text-xs">
            <button
              onClick={() => switchQuickUser("USER")}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                user?.role === "USER"
                  ? "bg-brand-500 text-black shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Switch to Customer account (Alex)"
            >
              Customer
            </button>
            <button
              onClick={() => switchQuickUser("ADMIN")}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium flex items-center gap-1 ${
                user?.role === "ADMIN"
                  ? "bg-cyan-500 text-black shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Switch to Cinema Admin (Manager)"
            >
              <Shield className="w-3 h-3" />
              Admin
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="text-right text-xs">
                <p className="font-semibold text-white leading-tight">{user.name}</p>
                <p className="text-slate-400 text-[10px] uppercase tracking-wider">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs bg-brand-500 hover:bg-brand-400 text-black px-4 py-2 rounded-xl font-bold shadow-glow transition-all"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-cinema-card text-slate-300 border border-cinema-border"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-cinema-dark border-b border-cinema-border flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-cinema-border/60">
            <span className="text-xs text-slate-400">Current City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold text-xs px-2 py-1"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-slate-200 hover:bg-cinema-hover flex items-center gap-2"
            >
              <link.icon className="w-4 h-4 text-brand-400" />
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-cinema-border flex items-center justify-between">
            <span className="text-xs text-slate-400">Demo Persona:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  switchQuickUser("USER");
                  setMobileMenuOpen(false);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg ${
                  user?.role === "USER" ? "bg-brand-500 text-black font-bold" : "bg-cinema-card text-white"
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => {
                  switchQuickUser("ADMIN");
                  setMobileMenuOpen(false);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg ${
                  user?.role === "ADMIN" ? "bg-cyan-500 text-black font-bold" : "bg-cinema-card text-white"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

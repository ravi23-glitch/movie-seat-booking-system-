import React from "react";
import { Film, ShieldCheck, Zap, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-cinema-border/60 bg-cinema-darker/90 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-brand-400" />
              <span className="font-bold text-white tracking-wide">CINESYNC PRO</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise movie ticketing infrastructure built for maximum concurrency with PostgreSQL row-level pessimistic locking.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Engine Highlights
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Row-Level Locks (SELECT FOR UPDATE)
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Sub-Millisecond Contention Resolution
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero Double-Booking Guarantee
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Screen Formats
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>IMAX 70mm & IMAX Digital</li>
              <li>Dolby Atmos Cinema Sound</li>
              <li>VIP Leather Recliner Lounges</li>
              <li>4DX Dynamic Experience</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Architecture
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Next.js App Router, Tailwind CSS, TypeScript, Prisma ORM, PostgreSQL containerization, and automated cleanup sweepers.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-cinema-border/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CineSync Pro. High-Concurrency Movie Booking System.</p>
          <div className="flex gap-4">
            <span>Pessimistic Locking Active</span>
            <span>•</span>
            <span>ACID Transactional Isolation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

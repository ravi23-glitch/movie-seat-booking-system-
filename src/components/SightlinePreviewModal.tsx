"use client";

import React, { useState } from "react";
import { X, Eye, Sparkles, Volume2, ShieldCheck } from "lucide-react";

interface SightlinePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRow: string;
}

export function SightlinePreviewModal({ isOpen, onClose, selectedRow }: SightlinePreviewModalProps) {
  const [activeRow, setActiveRow] = useState<string>(selectedRow || "D");

  if (!isOpen) return null;

  const rowsData: Record<string, { title: string; angle: string; distance: string; immersion: string; note: string; scale: string; perspective: string }> = {
    A: {
      title: "Front Row Experience (Row A - C)",
      angle: "68° Field of View",
      distance: "8.5 meters",
      immersion: "Maximum Visual Impact",
      note: "Full peripheral vision filled by the 70mm curved display. Incredible for visual blockbusters.",
      scale: "scale-125",
      perspective: "perspective-[400px] rotate-x-[12deg]",
    },
    D: {
      title: "Auditorium Sweet Spot (Row D - F)",
      angle: "46° THX Certified Angle",
      distance: "14.2 meters",
      immersion: "Reference Master Audio & Visual",
      note: "Direct eye-level sightline aligned with acoustic center of Dolby Atmos array. Zero neck strain.",
      scale: "scale-100",
      perspective: "perspective-[800px] rotate-x-[4deg]",
    },
    G: {
      title: "Balcony Wide-Angle View (Row G - H)",
      angle: "36° Panoramic Vista",
      distance: "19.8 meters",
      immersion: "Expansive Auditorium Vista",
      note: "Complete perspective of entire screen frame and audience. Preferred by guests who enjoy grand scale.",
      scale: "scale-90",
      perspective: "perspective-[1000px] -rotate-x-[4deg]",
    },
  };

  const currentCategory = ["A", "B", "C"].includes(activeRow) ? "A" : ["D", "E", "F"].includes(activeRow) ? "D" : "G";
  const rowInfo = rowsData[currentCategory];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl rounded-3xl bg-cinema-card border border-cinema-border overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cinema-border/70 bg-cinema-darker/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Auditorium Sightline Perspective
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Row {activeRow}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Simulated sightline geometry from your selected auditorium row</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Row Switcher Pills */}
        <div className="flex items-center justify-center gap-2 p-3 bg-cinema-darker/40 border-b border-cinema-border/40 text-xs">
          <span className="text-slate-400 text-[11px] mr-2">Simulate from:</span>
          {["A", "B", "C", "D", "E", "F", "G", "H"].map((r) => (
            <button
              key={r}
              onClick={() => setActiveRow(r)}
              className={`w-7 h-7 rounded-lg font-bold font-mono transition-all text-xs ${
                activeRow === r
                  ? "bg-brand-500 text-black shadow-glow scale-105"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* 3D Visual Cinema Screen Perspective Preview */}
        <div className="relative h-64 sm:h-72 w-full bg-gradient-to-b from-slate-950 via-cinema-darker to-black overflow-hidden flex flex-col items-center justify-center p-6">
          {/* Ambient Lighting Cone */}
          <div className="absolute top-0 w-3/4 h-32 bg-cyan-500/15 filter blur-3xl rounded-full pointer-events-none" />

          {/* Virtual Screen Mesh */}
          <div className={`transition-all duration-500 ${rowInfo.scale} flex flex-col items-center w-full max-w-lg`}>
            {/* The Screen Display */}
            <div className="w-full h-32 sm:h-36 rounded-2xl bg-gradient-to-tr from-cyan-900/60 via-slate-800 to-indigo-900/60 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center filter blur-sm opacity-40 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80')]" />
              <div className="relative z-10 text-center space-y-1">
                <span className="text-xs uppercase font-mono font-bold tracking-widest text-cyan-300 drop-shadow">
                  4K LASER PROJECTION
                </span>
                <p className="text-sm sm:text-base font-black text-white drop-shadow-md">
                  {rowInfo.title}
                </p>
              </div>
              <div className="absolute bottom-1 text-[9px] font-mono text-cyan-400/80">
                Dolby Atmos 64-Channel Spatial Audio
              </div>
            </div>

            {/* Simulated Seating Rows below screen */}
            <div className="w-full flex justify-center gap-2 mt-4 opacity-50">
              <div className="w-12 h-2 rounded bg-slate-700" />
              <div className="w-16 h-2 rounded bg-amber-500/80 shadow-glow" />
              <div className="w-12 h-2 rounded bg-slate-700" />
            </div>
            <p className="text-[10px] text-amber-300 font-mono mt-1">Your Selected Row ({activeRow}) Position</p>
          </div>
        </div>

        {/* Sightline Metrics Grid */}
        <div className="p-6 bg-cinema-darker/90 border-t border-cinema-border/70 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-cinema-border/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Field of View</span>
              <span className="text-xs font-bold text-cyan-400 font-mono mt-0.5 block">{rowInfo.angle}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-cinema-border/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Screen Distance</span>
              <span className="text-xs font-bold text-amber-400 font-mono mt-0.5 block">{rowInfo.distance}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-cinema-border/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Audio Immersion</span>
              <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">{rowInfo.immersion}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-brand-500/10 border border-brand-500/20 p-3 rounded-xl">
            💡 <strong className="text-white">Acoustic & Sightline Note:</strong> {rowInfo.note}
          </p>
        </div>
      </div>
    </div>
  );
}

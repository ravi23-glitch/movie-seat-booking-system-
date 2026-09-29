"use client";

import React, { useState, useEffect } from "react";
import { ShowDto, ShowSeatDto } from "@/types";
import { Users, Clock, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

interface AdminOccupancyInspectorProps {
  shows: ShowDto[];
}

export function AdminOccupancyInspector({ shows }: AdminOccupancyInspectorProps) {
  const [selectedShowId, setSelectedShowId] = useState<string>(shows[0]?.id || "");
  const [seatData, setSeatData] = useState<{
    show: ShowDto;
    seats: ShowSeatDto[];
    totalSeats: number;
    availableSeats: number;
    lockedSeats: number;
    bookedSeats: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSeats = async (showId: string) => {
    if (!showId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/shows/${showId}/seats`);
      const data = await res.json();
      if (data.success) {
        setSeatData(data.data);
      }
    } catch (err) {
      console.error("Failed to load show seats for inspector:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedShowId) {
      fetchSeats(selectedShowId);
    }
  }, [selectedShowId]);

  if (shows.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-cinema-card border border-cinema-border text-center text-slate-400">
        No active shows scheduled. Add a show schedule to inspect real-time occupancy.
      </div>
    );
  }

  const occupancyRate = seatData
    ? Math.round(((seatData.bookedSeats + seatData.lockedSeats) / (seatData.totalSeats || 1)) * 100)
    : 0;

  // Group seats by row
  const rowsMap: { [row: string]: ShowSeatDto[] } = {};
  if (seatData?.seats) {
    seatData.seats.forEach((s) => {
      if (!rowsMap[s.seat.seatRow]) rowsMap[s.seat.seatRow] = [];
      rowsMap[s.seat.seatRow].push(s);
    });
  }

  return (
    <div className="rounded-2xl bg-cinema-card border border-cinema-border p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Live Screen Occupancy Inspector
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time visual seat states and concurrency lock monitor
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedShowId}
            onChange={(e) => setSelectedShowId(e.target.value)}
            className="flex-1 sm:w-64 bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2.5 focus:border-brand-500 focus:outline-none"
          >
            {shows.map((s) => (
              <option key={s.id} value={s.id}>
                {s.movie?.title || "Movie"} (Screen {s.screen?.screenNumber}) -{" "}
                {new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchSeats(selectedShowId)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
            title="Refresh Real-time States"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {seatData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Capacity</p>
            <p className="text-xl font-bold text-white mt-1">{seatData.totalSeats} Seats</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50">
            <p className="text-[11px] text-emerald-400 uppercase font-semibold">Available</p>
            <p className="text-xl font-bold text-emerald-300 mt-1">{seatData.availableSeats}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-900/50">
            <p className="text-[11px] text-amber-400 uppercase font-semibold">Temporarily Locked</p>
            <p className="text-xl font-bold text-amber-300 mt-1">{seatData.lockedSeats}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-900/50">
            <p className="text-[11px] text-cyan-400 uppercase font-semibold">Occupancy</p>
            <p className="text-xl font-bold text-cyan-300 mt-1">{occupancyRate}%</p>
          </div>
        </div>
      )}

      {/* Real-Time Seat Layout */}
      {seatData && (
        <div className="p-6 rounded-xl bg-cinema-darker/70 border border-cinema-border/50 flex flex-col items-center overflow-x-auto">
          <div className="curved-screen max-w-md" />

          <div className="flex flex-col gap-2 min-w-[500px] mt-4">
            {Object.keys(rowsMap).sort().map((row) => (
              <div key={row} className="flex items-center gap-2 justify-center">
                <span className="w-5 text-center text-xs font-mono text-slate-500 font-bold">{row}</span>
                <div className="flex gap-1.5">
                  {rowsMap[row].map((seat) => {
                    let color = "bg-emerald-950/60 border-emerald-700/60 text-emerald-300";
                    if (seat.status === "BOOKED") {
                      color = "bg-slate-900 border-slate-800 text-slate-600";
                    } else if (seat.status === "LOCKED") {
                      color = "bg-amber-500/30 border-amber-500 text-amber-300 animate-pulse";
                    }
                    return (
                      <div
                        key={seat.id}
                        className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono border ${color}`}
                        title={`Seat ${seat.seat.seatRow}${seat.seat.seatNumber} - Status: ${seat.status} ${seat.lockedUntil ? `(Locked until ${new Date(seat.lockedUntil).toLocaleTimeString()})` : ""}`}
                      >
                        {seat.seat.seatNumber}
                      </div>
                    );
                  })}
                </div>
                <span className="w-5 text-center text-xs font-mono text-slate-500 font-bold">{row}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 mt-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-600" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" />
              Locked (In Checkout)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-900 border border-slate-800" />
              Booked
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

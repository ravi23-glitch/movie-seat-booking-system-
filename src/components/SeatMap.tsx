"use client";

import React, { useState, useEffect } from "react";
import { ShowDto, ShowSeatDto } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Clock, ShieldAlert, Check, Sparkles, AlertCircle, ArrowRight, Eye, Volume2, VolumeX, Flame } from "lucide-react";
import { SightlinePreviewModal } from "./SightlinePreviewModal";

interface SeatMapProps {
  show: ShowDto;
  seats: ShowSeatDto[];
  onRefreshSeats: () => Promise<void>;
  onProceedToCheckout: (reservationToken: string, selectedSeats: ShowSeatDto[]) => void;
}

export function SeatMap({
  show,
  seats,
  onRefreshSeats,
  onProceedToCheckout,
}: SeatMapProps) {
  const { addToast } = useAuth();
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [reservationToken, setReservationToken] = useState<string | null>(null);
  const [holdRemainingSeconds, setHoldRemainingSeconds] = useState<number | null>(null);
  const [sightlineOpen, setSightlineOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const playAudioClick = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  // Group seats by row
  const rowsMap: { [row: string]: ShowSeatDto[] } = {};
  seats.forEach((s) => {
    if (!rowsMap[s.seat.seatRow]) {
      rowsMap[s.seat.seatRow] = [];
    }
    rowsMap[s.seat.seatRow].push(s);
  });

  const sortedRows = Object.keys(rowsMap).sort();
  sortedRows.forEach((row) => {
    rowsMap[row].sort((a, b) => a.seat.seatNumber - b.seat.seatNumber);
  });

  // Hold Timer countdown
  useEffect(() => {
    if (holdRemainingSeconds === null || holdRemainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setHoldRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setReservationToken(null);
          addToast("warning", "Reservation hold expired", "Your seats were released. Please reselect.");
          onRefreshSeats();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [holdRemainingSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeatClick = (seat: ShowSeatDto) => {
    // If booked or locked by someone else, ignore
    if (seat.status === "BOOKED") {
      addToast("info", `Seat ${seat.seat.seatRow}${seat.seat.seatNumber} is already booked.`);
      return;
    }
    if (seat.status === "LOCKED" && !selectedSeatIds.includes(seat.seatId)) {
      addToast("warning", `Seat ${seat.seat.seatRow}${seat.seat.seatNumber} is temporarily held by another customer.`);
      return;
    }

    playAudioClick();

    if (selectedSeatIds.includes(seat.seatId)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.seatId));
      if (reservationToken) {
        // If modifying selection while token exists, reset token so user re-locks
        setReservationToken(null);
        setHoldRemainingSeconds(null);
      }
    } else {
      if (selectedSeatIds.length >= 6) {
        addToast("warning", "Maximum seat limit reached", "You can select up to 6 seats per transaction.");
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.seatId]);
      if (reservationToken) {
        setReservationToken(null);
        setHoldRemainingSeconds(null);
      }
    }
  };

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.seatId));
  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleLockAndProceed = async () => {
    if (selectedSeatIds.length === 0) {
      addToast("warning", "Please select at least 1 seat");
      return;
    }

    setIsLocking(true);
    try {
      const res = await fetch("/api/bookings/lock-seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: show.id,
          seatIds: selectedSeatIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          addToast(
            "error",
            "Seat Conflict: Seat already taken!",
            data.error || "Another customer reserved this seat seconds before you."
          );
        } else {
          addToast("error", data.error || "Failed to hold seats");
        }
        // Immediately refresh seat states to update visuals
        await onRefreshSeats();
        return;
      }

      setReservationToken(data.data.reservationToken);
      setHoldRemainingSeconds(data.data.expiresInSeconds || 600);
      addToast("success", "Seats held for 10 minutes!", "Proceeding to checkout...");

      onProceedToCheckout(data.data.reservationToken, selectedSeats);
    } catch (err: any) {
      addToast("error", "Network error while locking seats");
    } finally {
      setIsLocking(false);
    }
  };

  const activeRow = selectedSeats[0]?.seat.seatRow || "D";

  return (
    <div className="w-full flex flex-col items-center">
      {/* Sightline Simulator Modal */}
      <SightlinePreviewModal
        isOpen={sightlineOpen}
        onClose={() => setSightlineOpen(false)}
        selectedRow={activeRow}
      />

      {/* Top Experience Bar */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 px-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 animate-pulse" />
          <span>Contention Alert: 18 moviegoers actively viewing this screen</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSightlineOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 text-xs font-semibold text-cyan-300 transition-all shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            View from Seat
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-2 rounded-xl border transition-all text-xs ${
              soundEnabled
                ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
            title={soundEnabled ? "Mute Click Sound" : "Enable Click Sound"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Curved Cinema Screen Guide with Projector Light Beam */}
      <div className="curved-screen-wrapper px-4 my-4">
        <div className="projector-beam" />
        <div className="curved-screen" />
      </div>

      {/* Seat Map Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4 px-6 rounded-2xl bg-cinema-card/70 border border-cinema-border/60 text-xs mb-8">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border border-slate-700 bg-slate-800/80 hover:bg-slate-700" />
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border border-amber-500/80 bg-amber-500/20" />
          <span className="text-amber-300">Premium (₹350)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-brand-500 to-amber-400 text-black font-bold flex items-center justify-center shadow-glow">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-brand-400 font-semibold">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
          </div>
          <span className="text-amber-400">Held (10m Lock)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 text-slate-600 flex items-center justify-center">
            ✕
          </div>
          <span className="text-slate-500">Booked</span>
        </div>
      </div>

      {/* Visual Seat Grid */}
      <div className="w-full overflow-x-auto pb-8">
        <div className="min-w-[620px] max-w-4xl mx-auto flex flex-col gap-2.5 items-center">
          {sortedRows.map((row) => {
            const rowSeats = rowsMap[row];
            const isPremiumRow = rowSeats[0]?.seat.seatType === "PREMIUM";

            return (
              <div key={row} className="flex items-center gap-2 sm:gap-3">
                {/* Left Row Identifier */}
                <span className="w-6 text-center text-xs font-bold text-slate-500 font-mono">
                  {row}
                </span>

                {/* Seats in Row */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {rowSeats.map((seat, seatIdx) => {
                    const isSelected = selectedSeatIds.includes(seat.seatId);
                    const isBooked = seat.status === "BOOKED";
                    const isLocked = seat.status === "LOCKED";
                    const isPremium = seat.seat.seatType === "PREMIUM";

                    let buttonClass = "w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[11px] font-semibold flex items-center justify-center transition-all duration-200 ";

                    if (isSelected) {
                      buttonClass += "bg-gradient-to-tr from-brand-500 to-amber-400 text-black shadow-glow font-bold scale-105 ring-2 ring-amber-300";
                    } else if (isBooked) {
                      buttonClass += "bg-slate-900 border border-slate-800/80 text-slate-600 cursor-not-allowed opacity-40";
                    } else if (isLocked) {
                      buttonClass += "bg-amber-500/20 border border-amber-500/60 text-amber-300 cursor-not-allowed animate-pulse";
                    } else if (isPremium) {
                      buttonClass += "bg-slate-800/90 border border-amber-500/50 text-amber-200 hover:border-amber-400 hover:scale-110 hover:shadow-sm";
                    } else {
                      buttonClass += "bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:border-slate-500 hover:scale-110";
                    }

                    // Add center aisle gap between seats 4 and 5
                    const hasAisle = seatIdx === Math.floor(rowSeats.length / 2) - 1;

                    return (
                      <React.Fragment key={seat.id}>
                        <button
                          disabled={isBooked || (isLocked && !isSelected)}
                          onClick={() => handleSeatClick(seat)}
                          className={buttonClass}
                          title={`${seat.seat.seatRow}${seat.seat.seatNumber} (${seat.seat.seatType}) - ₹${seat.price.toFixed(2)} [${seat.status}]`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : isBooked ? (
                            "✕"
                          ) : (
                            seat.seat.seatNumber
                          )}
                        </button>
                        {hasAisle && <div className="w-4 sm:w-6" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right Row Identifier */}
                <span className="w-6 text-center text-xs font-bold text-slate-500 font-mono">
                  {row}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Floating Action Bar */}
      <div className="sticky bottom-4 z-30 w-full max-w-3xl mt-6 px-4">
        <div className="rounded-2xl border border-cinema-border/90 bg-cinema-card/95 backdrop-blur-xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Selected Seats:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((s) => (
                    <span
                      key={s.seatId}
                      className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/40 text-xs font-bold font-mono"
                    >
                      {s.seat.seatRow}
                      {s.seat.seatNumber}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">None selected (tap up to 6 seats)</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <span className="text-lg font-extrabold text-white">
                Total: <span className="text-brand-400 font-mono">₹{subtotal.toFixed(2)}</span>
              </span>
              <span className="text-xs text-slate-400">
                ({selectedSeats.length} {selectedSeats.length === 1 ? "seat" : "seats"})
              </span>

              {holdRemainingSeconds !== null && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  Hold Time: {formatTimer(holdRemainingSeconds)}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleLockAndProceed}
              disabled={selectedSeatIds.length === 0 || isLocking}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                selectedSeatIds.length > 0 && !isLocking
                  ? "bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-400 hover:to-amber-400 text-black shadow-glow cursor-pointer hover:scale-105 active:scale-95"
                  : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
              }`}
            >
              {isLocking ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Locking Rows...
                </>
              ) : (
                <>
                  Lock & Checkout
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

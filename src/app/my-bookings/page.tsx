"use client";

import React, { useState, useEffect } from "react";
import { BookingDto, BookingStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  XCircle,
  Eye,
  CheckCircle2,
  Filter,
} from "lucide-react";
import Link from "next/link";

export default function MyBookingsPage() {
  const { user, addToast } = useAuth();
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Cancellation Modal state
  const [cancellingBooking, setCancellingBooking] = useState<BookingDto | null>(null);
  const [isProcessingCancel, setIsProcessingCancel] = useState<boolean>(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === "ALL"
          ? "/api/bookings/my-bookings"
          : `/api/bookings/my-bookings?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error("Error loading user bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, user]);

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setIsProcessingCancel(true);

    try {
      const res = await fetch(`/api/bookings/${cancellingBooking.id}/cancel`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        addToast("error", data.error || "Failed to cancel booking");
        setIsProcessingCancel(false);
        return;
      }

      addToast("success", "Booking Cancelled", "Seats have been released back to available.");
      setCancellingBooking(null);
      await fetchBookings();
    } catch (err) {
      addToast("error", "Error cancelling booking");
    } finally {
      setIsProcessingCancel(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-cinema-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="w-7 h-7 text-brand-400" />
            My Tickets & Booking History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review your confirmed cinema tickets or cancel reservations
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cinema-card border border-cinema-border text-xs">
          {["ALL", "CONFIRMED", "CANCELLED"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === filter
                  ? "bg-brand-500 text-black shadow-sm font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-400">Loading your tickets...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-cinema-card/50 border border-cinema-border p-8">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No bookings found</h3>
          <p className="text-xs text-slate-400 mt-1">
            You don&apos;t have any ticket reservations matching this filter.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-brand-500 text-black font-bold text-xs shadow-glow"
          >
            Browse Movies & Book Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {bookings.map((booking) => {
            const show = booking.show;
            const movie = show?.movie;
            const screen = show?.screen;
            const theatre = screen?.theatre;
            const isConfirmed = booking.status === "CONFIRMED";

            return (
              <div
                key={booking.id}
                className="rounded-3xl bg-cinema-card border border-cinema-border overflow-hidden hover:border-slate-700 transition-all shadow-xl flex flex-col sm:flex-row items-stretch"
              >
                {/* Movie Poster Preview */}
                {movie?.posterUrl && (
                  <div className="w-full sm:w-44 aspect-[16/9] sm:aspect-[2/3] shrink-0 overflow-hidden bg-slate-950 relative">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-transparent to-transparent sm:hidden" />
                  </div>
                )}

                {/* Info Container */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            isConfirmed
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {booking.status}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Ref: {booking.bookingReference}
                        </span>
                        {booking.customerName && (
                          <span className="text-[11px] text-brand-300 font-semibold px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                            👤 {booking.customerName}
                          </span>
                        )}
                      </div>

                      <span className="text-sm font-black font-mono text-brand-400">
                        ₹{booking.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {movie?.title || "Feature Presentation"}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      {theatre?.name} • Screen #{screen?.screenNumber}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-cinema-border/60 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Showtime</p>
                      <p className="font-bold text-white mt-0.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {show?.startTime
                          ? new Date(show.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "18:00"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Assigned Seats</p>
                      <p className="font-bold text-amber-400 font-mono mt-0.5">
                        {booking.bookingSeats?.map((s) => `${s.seat.seatRow}${s.seat.seatNumber}`).join(", ") || "A1"}
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Booked On</p>
                      <p className="text-slate-300 mt-0.5 text-[11px]">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-cinema-border/60 flex items-center justify-end gap-3">
                    {isConfirmed && (
                      <button
                        onClick={() => setCancellingBooking(booking)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
                      >
                        Cancel Ticket
                      </button>
                    )}

                    <Link
                      href={`/bookings/${booking.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold shadow-glow transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Digital Ticket
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-cinema-card border border-cinema-border p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-950/60 border border-rose-800/40">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cancel Reservation?</h3>
                <p className="text-xs text-slate-400">Ref: {cancellingBooking.bookingReference}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel your tickets for{" "}
              <strong className="text-white">
                {cancellingBooking.show?.movie?.title || "this movie"}
              </strong>
              ? Your assigned seats will be released immediately back to the cinema pool, and your
              simulated payment will be marked as REFUNDED.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancellingBooking(null)}
                disabled={isProcessingCancel}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700"
              >
                Keep Tickets
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isProcessingCancel}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950 flex items-center gap-2"
              >
                {isProcessingCancel ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Releasing Seats...
                  </>
                ) : (
                  "Confirm Cancellation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

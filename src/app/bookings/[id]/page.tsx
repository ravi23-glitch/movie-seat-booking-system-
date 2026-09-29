"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BookingDto } from "@/types";
import { DigitalTicket } from "@/components/DigitalTicket";
import { CheckCircle2, Film, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const data = await res.json();
        if (data.success) {
          setBooking(data.data);
        }
      } catch (err) {
        console.error("Error loading booking:", err);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading your digital ticket...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white">Ticket not found</h2>
        <p className="text-xs text-slate-400 mt-2">
          The requested booking reference could not be located.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-brand-500 text-black font-bold text-xs"
        >
          Return to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/my-bookings"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          View All Tickets
        </Link>

        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          Transaction Finalized
        </span>
      </div>

      {/* Digital Ticket component */}
      <DigitalTicket booking={booking} />

      {/* Additional navigation */}
      <div className="flex justify-center gap-4 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cinema-card hover:bg-cinema-hover border border-cinema-border text-xs font-semibold text-slate-300 hover:text-white transition-all"
        >
          <Film className="w-4 h-4 text-brand-400" />
          Book Another Movie
        </Link>
      </div>
    </div>
  );
}

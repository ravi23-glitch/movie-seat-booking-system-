"use client";

import React, { useState, useEffect } from "react";
import { BookingDto } from "@/types";
import { Film, Calendar, Clock, MapPin, Printer, Download, CheckCircle, ShieldCheck, User, QrCode } from "lucide-react";
import QRCode from "qrcode";

interface DigitalTicketProps {
  booking: BookingDto;
}

export function DigitalTicket({ booking }: DigitalTicketProps) {
  const show = booking.show;
  const movie = show?.movie;
  const screen = show?.screen;
  const theatre = screen?.theatre;

  const customerName =
    booking.customerName ||
    booking.user?.name ||
    "Cinema Guest";

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const payload = JSON.stringify({
      app: "CineSync Pro Cinema Ticket",
      bookingRef: booking.bookingReference,
      customer: customerName,
      movie: movie?.title || "Feature Presentation",
      theatre: theatre?.name || "Starlight Cinema",
      screen: screen?.screenNumber || 1,
      showtime: show?.startTime ? new Date(show.startTime).toISOString() : new Date().toISOString(),
      seats: booking.bookingSeats?.map((s) => `${s.seat.seatRow}${s.seat.seatNumber}`) || [],
      amount: `₹${booking.totalAmount.toFixed(2)}`,
      status: booking.status,
      verified: true,
    });

    QRCode.toDataURL(payload, {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [booking, customerName, movie, show, theatre, screen]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    const receiptText = `
=============================================
           CINESYNC PRO CINEMA RECEIPT
=============================================
Booking Reference: ${booking.bookingReference}
Customer Name:     ${customerName}
Date:              ${new Date(booking.createdAt).toLocaleString()}
Status:            ${booking.status}

Movie:             ${movie?.title || "Feature Presentation"}
Theatre:           ${theatre?.name || "Starlight Cinema"} (${theatre?.location || "Main Hall"})
Screen:            Screen #${screen?.screenNumber || "1"}
Showtime:          ${show?.startTime ? new Date(show.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBA"}

Assigned Seats:
${booking.bookingSeats?.map((s) => `• Seat ${s.seat.seatRow}${s.seat.seatNumber} (${s.seat.seatType}) - ₹${s.price.toFixed(2)}`).join("\n")}
${
  booking.snacks && booking.snacks.length > 0
    ? `\nConcessions / Snacks (Express Pickup Counter #3):\n${booking.snacks
        .map((s) => `• ${s.name} x${s.quantity} - ₹${(s.price * s.quantity).toFixed(2)}`)
        .join("\n")}`
    : ""
}

Payment Method:    ${booking.payment?.paymentMethod || "UPI / Card"}
Transaction Ref:   ${booking.payment?.transactionRef || "N/A"}
Total Paid:        ₹${booking.totalAmount.toFixed(2)}
=============================================
Thank you for booking with CineSync Pro!
Enjoy your movie experience!
`;
    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt-${booking.bookingReference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-xl mx-auto my-6 print:m-0 print:max-w-none">
      {/* Ticket Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-cinema-card via-slate-900 to-black border border-cinema-border shadow-2xl">
        {/* Top Banner with Movie Backdrop */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-950">
          {movie?.backdropUrl && (
            <img
              src={movie.backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover object-center filter brightness-[0.35]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-card to-transparent" />

          <div className="absolute top-4 left-6 right-6 flex items-center justify-between">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5" />
              {booking.status}
            </span>
            <span className="text-xs font-mono font-bold text-slate-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              Ref: {booking.bookingReference}
            </span>
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl font-black text-white tracking-tight line-clamp-1">
              {movie?.title || "Feature Presentation"}
            </h2>
            <p className="text-xs text-brand-400 font-medium">{movie?.genre || "Cinematic Release"}</p>
          </div>
        </div>

        {/* Customer Badge Row */}
        <div className="px-6 sm:px-8 pt-5 pb-1 flex flex-wrap items-center justify-between gap-3 border-b border-cinema-border/40 bg-cinema-darker/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Ticket Holder</p>
              <p className="text-sm font-bold text-white tracking-wide">{customerName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Confirmed Pass
          </div>
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Theatre & Screen Info */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-cinema-border/60">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Cinema / Theatre</p>
              <p className="text-sm font-bold text-white mt-0.5">{theatre?.name || "Starlight Cinema"}</p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-400 shrink-0" />
                {theatre?.city || "Metropolis"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Auditorium / Screen</p>
              <p className="text-sm font-bold text-cyan-400 mt-0.5">Screen #{screen?.screenNumber || "1"}</p>
              <p className="text-xs text-slate-400 mt-0.5">Dolby Atmos • 4K Laser</p>
            </div>
          </div>

          {/* Date, Time, and Seats */}
          <div className="grid grid-cols-3 gap-4 pb-6 border-b border-cinema-border/60 text-center">
            <div className="p-3 rounded-xl bg-cinema-darker/70 border border-cinema-border/40">
              <Calendar className="w-4 h-4 text-brand-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase">Date</p>
              <p className="text-xs font-bold text-white mt-0.5">
                {show?.startTime
                  ? new Date(show.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "Today"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-cinema-darker/70 border border-cinema-border/40">
              <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase">Showtime</p>
              <p className="text-xs font-bold text-white mt-0.5">
                {show?.startTime
                  ? new Date(show.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "18:00"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-cinema-darker/70 border border-cinema-border/40">
              <Film className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase">Assigned Seats</p>
              <p className="text-xs font-bold text-amber-400 font-mono mt-0.5">
                {booking.bookingSeats?.map((s) => `${s.seat.seatRow}${s.seat.seatNumber}`).join(", ") || "A1"}
              </p>
            </div>
          </div>

          {/* Optional Concessions / Snacks Pass */}
          {booking.snacks && booking.snacks.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>🍿</span> Gourmet Snacks Pass (Express Counter #3)
                </span>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-bold">
                  TOKEN: SNK-{booking.bookingReference.slice(-4)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                {booking.snacks.map((snk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-black/40 border border-amber-500/20 font-mono text-slate-200"
                  >
                    {snk.name} <strong className="text-amber-400">x{snk.quantity}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Scannable QR Code & Barcode Verification */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            <div className="flex items-center gap-5 w-full">
              {/* Actual Generated QR Code */}
              <div className="w-28 h-28 p-2 bg-white rounded-2xl shadow-xl flex items-center justify-center shrink-0 border border-slate-200">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Ticket QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-[10px]">
                    <QrCode className="w-6 h-6 animate-pulse" />
                    <span>Generating...</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <p className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Official Digital Gate Pass
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Scan this QR code at cinema turnstiles. Encodes seat allocation for <span className="text-white font-medium">{customerName}</span>.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 uppercase font-mono">Total Paid</span>
                  <span className="text-sm font-mono font-bold text-brand-400">
                    ₹{booking.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-cinema-darker/90 border-t border-cinema-border flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cinema-card hover:bg-cinema-hover border border-cinema-border text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <Download className="w-4 h-4" />
            Receipt (.txt)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold shadow-glow transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

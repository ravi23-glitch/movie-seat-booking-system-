"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShowDto, ShowSeatDto, BookingDto } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
  CreditCard,
  Smartphone,
  Building,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Clock,
  User,
  Film,
  UtensilsCrossed,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { DigitalTicket } from "@/components/DigitalTicket";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const { user, addToast } = useAuth();
  const [token, setToken] = useState<string>("");
  const [show, setShow] = useState<ShowDto | null>(null);
  const [seats, setSeats] = useState<ShowSeatDto[]>([]);
  const [snacks, setSnacks] = useState<{ id?: string; name: string; quantity: number; price: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CREDIT_CARD" | "UPI" | "NET_BANKING">("UPI");

  // Form states
  const [customerName, setCustomerName] = useState<string>(user?.name || "Rajesh Sharma");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8912");
  const [cardHolder, setCardHolder] = useState("Rajesh Sharma");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("892");
  const [upiId, setUpiId] = useState("rajesh@okaxis");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingDto | null>(null);

  useEffect(() => {
    // Generate unique idempotency key once per checkout attempt
    const newIdemp = `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setIdempotencyKey(newIdemp);

    if (user?.name) {
      setCustomerName(user.name);
      setCardHolder(user.name);
    }

    const savedToken = tokenFromUrl || sessionStorage.getItem("checkout_token");
    const savedShow = sessionStorage.getItem("checkout_show");
    const savedSeats = sessionStorage.getItem("checkout_seats");
    const savedSnacks = sessionStorage.getItem("checkout_snacks");

    if (savedToken) setToken(savedToken);
    if (savedShow) setShow(JSON.parse(savedShow));
    if (savedSeats) setSeats(JSON.parse(savedSeats));
    if (savedSnacks) {
      try {
        setSnacks(JSON.parse(savedSnacks));
      } catch (e) {
        console.error("Failed to parse saved snacks", e);
      }
    }
  }, [tokenFromUrl, user]);

  // If already confirmed, render success screen with digital ticket and QR code
  if (confirmedBooking) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Celebration Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-black border border-emerald-500/40 text-center space-y-2 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-glow">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-white">Payment Successful & Ticket Confirmed!</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Payment was finalized in <span className="text-brand-400 font-bold">INR (₹)</span>. Your digital cinema pass and turnstile QR gate barcode have been generated for{" "}
            <span className="text-white font-bold">{confirmedBooking.customerName || customerName}</span>.
          </p>
        </div>

        {/* The Digital Cinema Ticket */}
        <DigitalTicket booking={confirmedBooking} />

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/my-bookings"
            className="px-5 py-2.5 rounded-xl bg-cinema-card hover:bg-cinema-hover border border-cinema-border text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-md"
          >
            View All My Bookings
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold shadow-glow transition-all"
          >
            <Film className="w-4 h-4" />
            Book Another Movie
          </Link>
        </div>
      </div>
    );
  }

  if (!token && !show) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white">No active reservation found</h2>
        <p className="text-xs text-slate-400 mt-2">
          Please select your movie seats first to initiate a hold reservation.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-brand-500 text-black font-bold text-xs"
        >
          Browse Movies
        </Link>
      </div>
    );
  }

  // Financial calculations in Indian Rupees (INR - ₹)
  const seatTotal = seats.reduce((sum, s) => sum + s.price, 0);
  const snacksTotal = snacks.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const convenienceFee = seats.length * 30.0; // ₹30 per ticket
  const taxes = Math.round((seatTotal + snacksTotal + convenienceFee) * 0.18 * 100) / 100; // 18% GST
  const grandTotal = Math.round((seatTotal + snacksTotal + convenienceFee + taxes) * 100) / 100;

  const updateSnackQty = (index: number, delta: number) => {
    const updated = [...snacks];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    setSnacks(updated);
    sessionStorage.setItem("checkout_snacks", JSON.stringify(updated));
  };

  const handlePayAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationToken: token,
          paymentMethod,
          idempotencyKey,
          customerName: customerName.trim() || user?.name || "Cinema Guest",
          snacks: snacks.length > 0 ? snacks : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast("error", "Checkout Failed", data.error || "Unable to confirm booking");
        setIsProcessing(false);
        return;
      }

      addToast("success", "Booking Confirmed!", "Your digital ticket with QR code has been generated.");
      // Clear checkout session
      sessionStorage.removeItem("checkout_token");
      sessionStorage.removeItem("checkout_seats");
      sessionStorage.removeItem("checkout_snacks");

      // Save confirmed booking to display immediate result card & QR code
      setConfirmedBooking(data.data);
      setIsProcessing(false);
    } catch (err: any) {
      addToast("error", "Payment network timeout. Please retry.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cinema-border/60">
        <Link
          href={show?.movieId ? `/movies/${show.movieId}` : "/"}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Seat Selection
        </Link>
        <div className="flex items-center gap-2 text-xs text-amber-400 font-mono font-semibold">
          <Clock className="w-4 h-4" />
          Temporary 10m Hold Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Payment Selector & Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-cinema-card border border-cinema-border space-y-6 shadow-xl">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-400" />
                Secure Payment Checkout (INR ₹)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter ticket holder details and select your payment method to generate your QR ticket
              </p>
            </div>

            {/* Ticket Holder Details */}
            <div className="p-4 rounded-2xl bg-cinema-darker/80 border border-cinema-border/60 space-y-3">
              <label className="text-xs font-semibold text-slate-300 block flex items-center justify-between">
                <span>Customer Name (Appears on QR Pass & Ticket)</span>
                <span className="text-[10px] text-brand-400 font-semibold uppercase">Required</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setCardHolder(e.target.value);
                  }}
                  required
                  placeholder="Enter full name for ticket pass"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white pl-10 focus:outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all text-xs ${
                  paymentMethod === "UPI"
                    ? "bg-brand-500/10 border-brand-500 text-brand-400 font-bold shadow-glow/30"
                    : "bg-slate-900/60 border-cinema-border text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1.5" />
                UPI (GPay/PhonePe)
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CREDIT_CARD")}
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all text-xs ${
                  paymentMethod === "CREDIT_CARD"
                    ? "bg-brand-500/10 border-brand-500 text-brand-400 font-bold shadow-glow/30"
                    : "bg-slate-900/60 border-cinema-border text-slate-400 hover:text-white"
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1.5" />
                Cards (RuPay/Visa)
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("NET_BANKING")}
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all text-xs ${
                  paymentMethod === "NET_BANKING"
                    ? "bg-brand-500/10 border-brand-500 text-brand-400 font-bold shadow-glow/30"
                    : "bg-slate-900/60 border-cinema-border text-slate-400 hover:text-white"
                }`}
              >
                <Building className="w-5 h-5 mb-1.5" />
                Net Banking
              </button>
            </div>

            {/* Simulated Payment Forms */}
            <form onSubmit={handlePayAndConfirm} className="space-y-4 pt-2">
              {paymentMethod === "UPI" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                      Virtual Payment Address (UPI ID / VPA)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["@okhdfcbank", "@okaxis", "@paytm", "@ybl"].map((suffix) => (
                      <button
                        type="button"
                        key={suffix}
                        onClick={() => setUpiId((prev) => prev.split("@")[0] + suffix)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] text-slate-300 hover:text-white border border-slate-700"
                      >
                        {suffix}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Fast atomic authorization in Indian Rupees (₹). Instant ticket generation upon verification.
                  </p>
                </div>
              )}

              {paymentMethod === "CREDIT_CARD" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={4}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "NET_BANKING" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                      Select Bank
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isProcessing
                      ? "bg-slate-800 text-slate-400 cursor-wait"
                      : "bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-400 hover:to-amber-400 text-black shadow-glow cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Finalizing Transaction in INR (₹)...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Pay ₹{grandTotal.toFixed(2)} & Generate QR Ticket
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center pt-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Idempotency-protected submission: {idempotencyKey.substring(0, 16)}...</span>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border space-y-6 shadow-xl">
            <h3 className="text-base font-bold text-white border-b border-cinema-border/60 pb-3">
              Booking Summary
            </h3>

            {/* Movie Info */}
            <div className="flex gap-4 items-center">
              {show?.movie?.posterUrl && (
                <div className="w-16 aspect-[2/3] rounded-xl overflow-hidden shadow-md shrink-0">
                  <img src={show.movie.posterUrl} alt={show.movie.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{show?.movie?.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{show?.screen?.theatre?.name}</p>
                <p className="text-[11px] text-brand-400 mt-0.5">
                  Screen #{show?.screen?.screenNumber} •{" "}
                  {show?.startTime && new Date(show.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Selected Seats Matrix */}
            <div className="space-y-2 pt-2 border-t border-cinema-border/60">
              <p className="text-xs font-semibold text-slate-400 uppercase">Selected Seats</p>
              <div className="space-y-1.5">
                {seats.map((s) => (
                  <div key={s.seatId} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-mono">
                      Row {s.seat.seatRow}, Seat {s.seat.seatNumber} ({s.seat.seatType})
                    </span>
                    <span className="text-white font-semibold font-mono">₹{s.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Concessions / Snacks */}
            {snacks.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-cinema-border/60">
                <div className="flex items-center justify-between text-xs">
                  <p className="font-semibold text-amber-400 flex items-center gap-1.5 uppercase">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    Snacks & Concessions
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">₹{snacksTotal.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  {snacks.map((snk, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-900/60 border border-cinema-border/40 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium text-white text-[11px] line-clamp-1">{snk.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">
                          ₹{snk.price} × {snk.quantity} = ₹{(snk.price * snk.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateSnackQty(idx, -1)}
                          className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold text-white w-4 text-center">
                          {snk.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateSnackQty(idx, 1)}
                          className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Breakdown in INR */}
            <div className="space-y-2.5 pt-4 border-t border-cinema-border/60 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tickets Subtotal</span>
                <span className="font-mono text-white">₹{seatTotal.toFixed(2)}</span>
              </div>
              {snacksTotal > 0 && (
                <div className="flex justify-between text-amber-400/90 font-medium">
                  <span>Concessions & Snacks</span>
                  <span className="font-mono text-amber-400">₹{snacksTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Convenience Fee (₹30.00/seat)</span>
                <span className="font-mono text-white">₹{convenienceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Integrated GST (18%)</span>
                <span className="font-mono text-white">₹{taxes.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base font-black text-white pt-3 border-t border-cinema-border">
                <span>Total Amount to Pay</span>
                <span className="font-mono text-brand-400">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-cinema-darker/80 border border-cinema-border/60 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Guaranteed Seat Hold
              </div>
              <p className="leading-relaxed">
                Your seats are reserved under row-level lock. Finalizing completes payment simulation in Indian Rupees (₹) and immediately generates your scannable QR ticket with your name.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-400">Loading checkout session...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MovieDto, ShowDto, ShowSeatDto } from "@/types";
import { DateSelector } from "@/components/DateSelector";
import { SeatMap } from "@/components/SeatMap";
import { TrailerModal } from "@/components/TrailerModal";
import { FoodAndBeverages, CINEMA_SNACKS } from "@/components/FoodAndBeverages";
import { Star, Clock, Calendar, Film, MapPin, Sparkles, ArrowLeft, Play, Utensils, ShieldCheck, Flame } from "lucide-react";
import Link from "next/link";

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<MovieDto | null>(null);
  const [shows, setShows] = useState<ShowDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [selectedShow, setSelectedShow] = useState<ShowDto | null>(null);
  const [trailerOpen, setTrailerOpen] = useState<boolean>(false);

  // Seat state for selected show
  const [seats, setSeats] = useState<ShowSeatDto[]>([]);
  const [seatsLoading, setSeatsLoading] = useState<boolean>(false);

  // Concessions & snacks state
  const [snackQuantities, setSnackQuantities] = useState<Record<string, number>>({});

  const handleSnackQuantityChange = (id: string, delta: number) => {
    setSnackQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const fetchMovieDetails = async () => {
    try {
      const res = await fetch(`/api/movies/${movieId}`);
      const data = await res.json();
      if (data.success) {
        setMovie(data.data.movie);
        setShows(data.data.shows);
        if (data.data.shows.length > 0) {
          setSelectedShow(data.data.shows[0]);
        }
      }
    } catch (err) {
      console.error("Error loading movie:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async (showId: string) => {
    setSeatsLoading(true);
    try {
      const res = await fetch(`/api/shows/${showId}/seats`);
      const data = await res.json();
      if (data.success) {
        setSeats(data.data.seats);
      }
    } catch (err) {
      console.error("Error loading seats:", err);
    } finally {
      setSeatsLoading(false);
    }
  };

  useEffect(() => {
    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  useEffect(() => {
    if (selectedShow) {
      fetchSeats(selectedShow.id);
    }
  }, [selectedShow]);

  // Group shows by Theatre
  const showsByTheatre: {
    [theatreId: string]: {
      theatreName: string;
      location: string;
      city: string;
      shows: ShowDto[];
    };
  } = {};

  shows.forEach((show) => {
    const theatre = show.screen?.theatre;
    const theatreId = theatre?.id || "default";

    if (!showsByTheatre[theatreId]) {
      showsByTheatre[theatreId] = {
        theatreName: theatre?.name || "Starlight Cinema",
        location: theatre?.location || "Main Blvd",
        city: theatre?.city || "Metropolis",
        shows: [],
      };
    }
    showsByTheatre[theatreId].shows.push(show);
  });

  const handleProceedToCheckout = (reservationToken: string, selectedSeats: ShowSeatDto[]) => {
    if (!selectedShow) return;

    // Filter non-zero snacks
    const chosenSnacks = Object.entries(snackQuantities).map(([snackId, qty]) => {
      const item = CINEMA_SNACKS.find((s) => s.id === snackId);
      return {
        id: snackId,
        name: item?.name || "Snack",
        price: item?.price || 0,
        quantity: qty,
      };
    });

    // Store in sessionStorage for checkout
    sessionStorage.setItem("checkout_token", reservationToken);
    sessionStorage.setItem("checkout_show", JSON.stringify(selectedShow));
    sessionStorage.setItem("checkout_seats", JSON.stringify(selectedSeats));
    sessionStorage.setItem("checkout_snacks", JSON.stringify(chosenSnacks));

    router.push(`/checkout?token=${encodeURIComponent(reservationToken)}`);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-white">Movie not found</h2>
        <Link href="/" className="text-sm text-brand-400 mt-2 inline-block">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <>
      <TrailerModal
        movie={movie}
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
      />

      <div className="w-full space-y-10">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>

        {/* Header Backdrop & Movie Metadata */}
        <div className="relative rounded-3xl overflow-hidden border border-cinema-border/80 bg-cinema-card shadow-2xl">
          <div className="absolute inset-0">
            <img
              src={movie.backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover filter brightness-[0.25]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-cinema-card/70 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="relative group w-44 sm:w-56 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mx-auto md:mx-0">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-brand-500 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-glow"
              >
                <Play className="w-5 h-5 fill-black ml-0.5" />
              </button>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500 text-black shadow-glow">
                  Now Showing
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {movie.genre}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {movie.rating.toFixed(1)} / 10
                </span>
                <span className="text-xs font-semibold text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                  🍅 92% Critics Choice
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>

              <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                {movie.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 pt-2 border-t border-cinema-border/60">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-400" />
                  {movie.durationMin} minutes
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  Release: {new Date(movie.releaseDate).toLocaleDateString()}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-medium">
                  Laser IMAX 70mm & Dolby Atmos 7.1
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setTrailerOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Watch Official Trailer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Showtime & Theatre Selection */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Film className="w-6 h-6 text-brand-400" />
              Select Showtime & Experience
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose your preferred cinema hall, screen format, and time slot
            </p>
          </div>

          {/* Date Selector Carousel */}
          <DateSelector
            selectedDateIndex={selectedDateIndex}
            onSelectDate={(idx) => setSelectedDateIndex(idx)}
          />

          {/* Theatres and Showtimes Grouping */}
          <div className="grid grid-cols-1 gap-6">
            {Object.entries(showsByTheatre).map(([theatreId, group]) => (
              <div
                key={theatreId}
                className="p-6 rounded-3xl bg-cinema-card border border-cinema-border space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-cinema-border/60">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-400" />
                      {group.theatreName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {group.location}, {group.city}
                    </p>
                  </div>

                  <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/40">
                    <Sparkles className="w-3.5 h-3.5" />
                    Dolby Cinema & IMAX Enabled
                  </span>
                </div>

                {/* Showtimes Grid */}
                <div className="flex flex-wrap gap-3">
                  {group.shows.map((show) => {
                    const isSelected = selectedShow?.id === show.id;
                    const startTimeFormatted = new Date(show.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <button
                        key={show.id}
                        onClick={() => setSelectedShow(show)}
                        className={`flex flex-col items-center px-4 py-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-brand-500 border-brand-400 text-black shadow-glow font-bold scale-105"
                            : "bg-cinema-darker hover:bg-cinema-hover border-cinema-border text-slate-200 hover:border-slate-600"
                        }`}
                      >
                        <span className="text-sm font-bold font-mono">{startTimeFormatted}</span>
                        <span
                          className={`text-[10px] uppercase tracking-wider ${
                            isSelected ? "text-black/80 font-bold" : "text-brand-400"
                          }`}
                        >
                          Screen #{show.screen?.screenNumber} • 4K Laser
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Visual Seat Map Section */}
        {selectedShow && (
          <div className="space-y-8">
            <div className="p-6 sm:p-10 rounded-3xl bg-cinema-card/90 border border-cinema-border shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-cinema-border/60 gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-brand-400" />
                    Select Your Seats
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedShow.screen?.theatre?.name} • Screen #{selectedShow.screen?.screenNumber} •{" "}
                    {new Date(selectedShow.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/50">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Live Seat State Engine Active
                </div>
              </div>

              {seatsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs text-slate-400">Loading real-time seat matrix...</p>
                </div>
              ) : (
                <SeatMap
                  show={selectedShow}
                  seats={seats}
                  onRefreshSeats={() => fetchSeats(selectedShow.id)}
                  onProceedToCheckout={handleProceedToCheckout}
                />
              )}
            </div>

            {/* Cinema Concessions & Food Add-on */}
            <FoodAndBeverages
              quantities={snackQuantities}
              onQuantityChange={handleSnackQuantityChange}
            />
          </div>
        )}
      </div>
    </>
  );
}

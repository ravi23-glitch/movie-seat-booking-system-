"use client";

import React, { useEffect } from "react";
import { MovieDto } from "@/types";
import { X, Star, Calendar, Clock, Film, Volume2, ShieldCheck, Ticket } from "lucide-react";
import Link from "next/link";

interface TrailerModalProps {
  movie: MovieDto | null;
  isOpen: boolean;
  onClose: () => void;
}

// Map blockbuster movies to official trailer embeds
const TRAILER_MAP: Record<string, { embedId: string; director: string; cast: string; censor: string; rottenTomatoes: string }> = {
  "movie-1": {
    embedId: "Way9Dexny3w", // Dune: Part Two
    director: "Denis Villeneuve",
    cast: "Timothée Chalamet, Zendaya, Rebecca Ferguson, Austin Butler",
    censor: "UA 16+",
    rottenTomatoes: "92%",
  },
  "movie-2": {
    embedId: "uYPbbksJxIg", // Oppenheimer
    director: "Christopher Nolan",
    cast: "Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.",
    censor: "A (Adults)",
    rottenTomatoes: "93%",
  },
  "movie-3": {
    embedId: "cqGjhVJWtEg", // Spider-Man: Across the Spider-Verse
    director: "Joaquim Dos Santos, Kemp Powers",
    cast: "Shameik Moore, Hailee Steinfeld, Oscar Isaac",
    censor: "U (Universal)",
    rottenTomatoes: "95%",
  },
  "movie-4": {
    embedId: "zSWdZVtXT7E", // Interstellar
    director: "Christopher Nolan",
    cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
    censor: "UA 13+",
    rottenTomatoes: "87%",
  },
};

export function TrailerModal({ movie, isOpen, onClose }: TrailerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !movie) return null;

  const extra = TRAILER_MAP[movie.id] || {
    embedId: "Way9Dexny3w",
    director: "Visionary Cinema Director",
    cast: "Ensemble Star Cast",
    censor: "UA 16+",
    rottenTomatoes: "90%",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl rounded-3xl bg-cinema-card border border-cinema-border overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cinema-border/70 bg-cinema-darker/60">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <Film className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white line-clamp-1">{movie.title} — Official Trailer</h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>IMAX 4K Laser</span>
                <span>•</span>
                <span>Dolby Atmos 7.1</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${extra.embedId}?autoplay=1&rel=0&modestbranding=1`}
            title={`${movie.title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Details & Fast Action Footer */}
        <div className="p-6 bg-cinema-darker/90 overflow-y-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {movie.rating} / 10
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
                🍅 {extra.rottenTomatoes} Rotten Tomatoes
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
                {extra.censor}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/30 text-xs font-semibold">
                {movie.genre}
              </span>
            </div>

            <Link
              href={`/movies/${movie.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-400 hover:to-amber-400 text-black font-bold text-xs shadow-glow transition-all"
            >
              <Ticket className="w-4 h-4" />
              Book Seats from ₹220
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-cinema-border/50 text-slate-400">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Director</span>
              <span className="text-slate-200 font-medium">{extra.director}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Key Cast</span>
              <span className="text-slate-200 font-medium">{extra.cast}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

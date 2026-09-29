"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MovieDto } from "@/types";
import { Star, Clock, Calendar, Ticket, Flame, Play, Sparkles } from "lucide-react";
import { TrailerModal } from "./TrailerModal";

interface HeroBannerProps {
  movie: MovieDto;
}

export function HeroBanner({ movie }: HeroBannerProps) {
  const [trailerOpen, setTrailerOpen] = useState(false);

  return (
    <>
      <TrailerModal
        movie={movie}
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
      />

      <div className="relative w-full rounded-3xl overflow-hidden border border-cinema-border/80 shadow-2xl mb-12 bg-cinema-card">
        {/* Background Image with Cinematic Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.38] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-darker via-cinema-darker/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-darker via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-2xl flex flex-col justify-end min-h-[400px] md:min-h-[460px]">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500 text-black shadow-glow">
              <Flame className="w-3.5 h-3.5" />
              Featured Premiere
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cinema-border/80 text-slate-300 border border-slate-700">
              {movie.genre}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {movie.rating} / 10
            </span>
            <span className="text-xs font-semibold text-rose-300 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
              🍅 92% Certified Fresh
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-md">
            {movie.title}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6">
            {movie.description}
          </p>

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300 mb-8">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-400" />
              {movie.durationMin} mins
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-400" />
              {new Date(movie.releaseDate).getFullYear()}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 font-medium">
              IMAX 70mm & Dolby Atmos
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
              Starts from ₹220
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/movies/${movie.id}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-400 hover:to-amber-400 text-black font-bold text-sm shadow-glow hover:scale-105 active:scale-95 transition-all"
            >
              <Ticket className="w-4 h-4" />
              Book Tickets from ₹220
            </Link>

            <button
              type="button"
              onClick={() => setTrailerOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 hover:border-white/40 backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              Watch Trailer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

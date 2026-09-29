"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MovieDto } from "@/types";
import { Star, Clock, Ticket, Play, Sparkles } from "lucide-react";
import { TrailerModal } from "./TrailerModal";

interface MovieCardProps {
  movie: MovieDto;
}

export function MovieCard({ movie }: MovieCardProps) {
  const [trailerOpen, setTrailerOpen] = useState(false);

  return (
    <>
      <TrailerModal
        movie={movie}
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
      />

      <div className="group relative flex flex-col rounded-3xl bg-cinema-card border border-cinema-border/70 overflow-hidden hover:border-brand-500/60 hover:shadow-[0_0_28px_rgba(245,158,11,0.2)] transition-all duration-300">
        {/* Poster image container */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-black/20 to-transparent opacity-90" />

          {/* Quick Play Trailer Hover Overlay */}
          <button
            type="button"
            onClick={() => setTrailerOpen(true)}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-brand-500/90 hover:bg-brand-400 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 shadow-glow z-20 cursor-pointer"
            title="Watch Official Trailer"
          >
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </button>

          {/* Rating badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-xl bg-black/75 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-400/30 shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            {movie.rating.toFixed(1)}
          </div>

          {/* Format & Genre Badges */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-1">
            <span className="rounded-lg bg-black/70 backdrop-blur-md px-2 py-0.5 text-[11px] font-semibold text-slate-200 border border-white/10">
              {movie.genre.split("/")[0].trim()}
            </span>
            <span className="rounded-lg bg-cyan-950/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/40">
              IMAX Laser
            </span>
          </div>
        </div>

        {/* Movie info */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1 mb-1">
              {movie.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {movie.description}
            </p>
          </div>

          <div className="pt-3 border-t border-cinema-border/70 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Starts from</span>
              <span className="text-xs font-bold font-mono text-brand-400">₹220</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-medium"
                title="Trailer"
              >
                Trailer
              </button>

              <Link
                href={`/movies/${movie.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all"
              >
                <Ticket className="w-3.5 h-3.5" />
                Book
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

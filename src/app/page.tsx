"use client";

import React, { useState, useEffect } from "react";
import { MovieDto } from "@/types";
import { HeroBanner } from "@/components/HeroBanner";
import { MovieCard } from "@/components/MovieCard";
import { Search, Filter, Sparkles, Film, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const [movies, setMovies] = useState<MovieDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedGenre !== "ALL") params.set("genre", selectedGenre);

      const res = await fetch(`/api/movies?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMovies(data.data.movies);
      }
    } catch (err) {
      console.error("Error fetching movies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovies();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedGenre]);

  const featuredMovie = movies[0];
  const genres = ["ALL", "Sci-Fi", "Drama", "Action", "Animation"];

  return (
    <div className="w-full">
      {/* Featured Hero Banner */}
      {featuredMovie && <HeroBanner movie={featuredMovie} />}

      {/* Catalog Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-brand-400" />
            Now Showing in Theatres
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time seat availability backed by PostgreSQL row-level locks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movie or genre..."
              className="w-full bg-cinema-card border border-cinema-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Genre Filters */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cinema-card border border-cinema-border overflow-x-auto">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  selectedGenre === g
                    ? "bg-brand-500 text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="aspect-[2/3] rounded-2xl bg-cinema-card/50 border border-cinema-border animate-pulse"
            />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-cinema-card/40 border border-cinema-border">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No movies found</h3>
          <p className="text-xs text-slate-400 mt-1">Try refining your search terms or genre filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {/* Trust & Architecture Banner */}
      <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-cinema-card via-cinema-darker to-cinema-card border border-cinema-border/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Zero Race-Conditions Guarantee
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Every seat reservation is secured with PostgreSQL row-level pessimistic locking (`FOR UPDATE`) in an atomic transaction.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-cyan-400 shrink-0">
          <span className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/60">
            ISO: READ COMMITTED
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-300">
            HOLD: 10 MINUTES
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { MovieDto, ShowDto, TheatreDto } from "@/types";
import { AdminOccupancyInspector } from "@/components/AdminOccupancyInspector";
import {
  Shield,
  TrendingUp,
  Ticket,
  DollarSign,
  Film,
  Plus,
  Trash2,
  Calendar,
  Users,
  RefreshCw,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, switchQuickUser, addToast } = useAuth();

  const [metrics, setMetrics] = useState<{
    totalTicketsSold: number;
    totalRevenue: number;
    activeShows: number;
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
  } | null>(null);

  const [movies, setMovies] = useState<MovieDto[]>([]);
  const [shows, setShows] = useState<ShowDto[]>([]);
  const [theatres, setTheatres] = useState<TheatreDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isAddMovieModal, setIsAddMovieModal] = useState(false);
  const [isAddShowModal, setIsAddShowModal] = useState(false);

  // New Movie Form
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newMovieDesc, setNewMovieDesc] = useState("");
  const [newMoviePoster, setNewMoviePoster] = useState("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80");
  const [newMovieBackdrop, setNewMovieBackdrop] = useState("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80");
  const [newMovieDuration, setNewMovieDuration] = useState(150);
  const [newMovieGenre, setNewMovieGenre] = useState("Action / Sci-Fi");
  const [newMovieRating, setNewMovieRating] = useState(8.5);

  // New Show Form
  const [newShowMovieId, setNewShowMovieId] = useState("");
  const [newShowScreenId, setNewShowScreenId] = useState("screen-1");
  const [newShowTime, setNewShowTime] = useState("2026-10-01T19:30");
  const [newShowMultiplier, setNewShowMultiplier] = useState(1.2);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Metrics
      const mRes = await fetch("/api/admin/metrics");
      const mData = await mRes.json();
      if (mData.success) setMetrics(mData.data);

      // Movies
      const movRes = await fetch("/api/movies?limit=50");
      const movData = await movRes.json();
      if (movData.success) {
        setMovies(movData.data.movies);
        if (movData.data.movies.length > 0 && !newShowMovieId) {
          setNewShowMovieId(movData.data.movies[0].id);
        }
      }

      // Shows
      const showRes = await fetch("/api/admin/shows");
      const showData = await showRes.json();
      if (showData.success) setShows(showData.data);

      // Theatres
      const thRes = await fetch("/api/admin/theatres");
      const thData = await thRes.json();
      if (thData.success) setTheatres(thData.data);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newMovieTitle,
          description: newMovieDesc,
          posterUrl: newMoviePoster,
          backdropUrl: newMovieBackdrop,
          durationMin: Number(newMovieDuration),
          rating: Number(newMovieRating),
          genre: newMovieGenre,
          releaseDate: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast("error", data.error || "Failed to create movie");
        return;
      }
      addToast("success", "Movie added to catalog!");
      setIsAddMovieModal(false);
      setNewMovieTitle("");
      setNewMovieDesc("");
      await fetchAdminData();
    } catch (err) {
      addToast("error", "Error creating movie");
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm("Are you sure you want to remove this movie?")) return;
    try {
      const res = await fetch(`/api/admin/movies/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("success", "Movie deleted");
        await fetchAdminData();
      } else {
        addToast("error", "Failed to delete movie");
      }
    } catch (err) {
      addToast("error", "Error deleting movie");
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startTime = new Date(newShowTime);
      const endTime = new Date(startTime.getTime() + 150 * 60000);

      const res = await fetch("/api/admin/shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: newShowMovieId,
          screenId: newShowScreenId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          priceMultiplier: Number(newShowMultiplier),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast("error", data.error || "Failed to schedule show");
        return;
      }
      addToast("success", "New showtime scheduled and seats initialized!");
      setIsAddShowModal(false);
      await fetchAdminData();
    } catch (err) {
      addToast("error", "Error scheduling show");
    }
  };

  const handleDeleteShow = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled show?")) return;
    try {
      const res = await fetch(`/api/admin/shows/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("success", "Show deleted");
        await fetchAdminData();
      } else {
        addToast("error", "Failed to delete show");
      }
    } catch (err) {
      addToast("error", "Error deleting show");
    }
  };

  if (user?.role !== "ADMIN") {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Admin Operations Console is protected with role-based authorization. Switch to the
          Admin persona below to manage movies, schedule showtimes, and monitor occupancy.
        </p>
        <button
          onClick={() => switchQuickUser("ADMIN")}
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-glow-cyan"
        >
          Authenticate as Cinema Admin
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-cinema-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-cyan-400" />
            Cinema Operations & Concurrency Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time box office analytics, schedule management, and live screen occupancy
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cinema-card hover:bg-cinema-hover border border-cinema-border text-xs font-semibold text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tickets Sold</p>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-4 font-mono">
            {metrics?.totalTicketsSold ?? 0}
          </p>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            {metrics?.confirmedBookings ?? 0} confirmed orders
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Box Office Gross</p>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-4 font-mono text-brand-400">
            ₹{metrics?.totalRevenue?.toFixed(2) ?? "0.00"}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">Simulated payment processor volume</p>
        </div>

        <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Shows</p>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-4 font-mono">
            {metrics?.activeShows ?? 0}
          </p>
          <p className="text-[11px] text-cyan-400 mt-2">Across 3 configured screens</p>
        </div>

        <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cancellations</p>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-4 font-mono">
            {metrics?.cancelledBookings ?? 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">Seats released atomically</p>
        </div>
      </div>

      {/* Live Screen Occupancy Inspector */}
      <AdminOccupancyInspector shows={shows} />

      {/* Movies Management Table */}
      <div className="rounded-3xl bg-cinema-card border border-cinema-border p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-brand-400" />
              Movie Catalog Management
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Add new cinematic titles or update synopsis and ratings
            </p>
          </div>

          <button
            onClick={() => setIsAddMovieModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold shadow-glow"
          >
            <Plus className="w-4 h-4" />
            Add Movie
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cinema-border text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 px-4">Movie</th>
                <th className="pb-3 px-4">Genre</th>
                <th className="pb-3 px-4">Duration</th>
                <th className="pb-3 px-4">Rating</th>
                <th className="pb-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/50 text-slate-300">
              {movies.map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="w-9 h-12 object-cover rounded-md shadow"
                    />
                    <div>
                      <p className="font-bold text-white">{m.title}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{m.description}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">{m.genre}</td>
                  <td className="py-3 px-4">{m.durationMin} mins</td>
                  <td className="py-3 px-4 text-amber-400 font-bold font-mono">★ {m.rating}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteMovie(m.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                      title="Delete Movie"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shows Schedule Management Table */}
      <div className="rounded-3xl bg-cinema-card border border-cinema-border p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Screen Schedule Management
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Schedule showtimes with custom price multipliers
            </p>
          </div>

          <button
            onClick={() => setIsAddShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-glow-cyan"
          >
            <Plus className="w-4 h-4" />
            Schedule Show
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cinema-border text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 px-4">Movie</th>
                <th className="pb-3 px-4">Screen / Format</th>
                <th className="pb-3 px-4">Showtime</th>
                <th className="pb-3 px-4">Price Multiplier</th>
                <th className="pb-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/50 text-slate-300">
              {shows.slice(0, 10).map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{s.movie?.title || "Movie"}</td>
                  <td className="py-3 px-4">
                    {s.screen?.theatre?.name} • Screen #{s.screen?.screenNumber}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {new Date(s.startTime).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{s.priceMultiplier}x</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteShow(s.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                      title="Cancel Show"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Movie Modal */}
      {isAddMovieModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-cinema-card border border-cinema-border p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add New Movie</h3>
            <form onSubmit={handleCreateMovie} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newMovieTitle}
                  onChange={(e) => setNewMovieTitle(e.target.value)}
                  placeholder="e.g. Gladiator II"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-400 block mb-1">Synopsis</label>
                <textarea
                  required
                  rows={3}
                  value={newMovieDesc}
                  onChange={(e) => setNewMovieDesc(e.target.value)}
                  placeholder="Enter detailed plot synopsis..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Genre</label>
                  <input
                    type="text"
                    required
                    value={newMovieGenre}
                    onChange={(e) => setNewMovieGenre(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Duration (min)</label>
                  <input
                    type="number"
                    required
                    value={newMovieDuration}
                    onChange={(e) => setNewMovieDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddMovieModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold shadow-glow"
                >
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Show Modal */}
      {isAddShowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-cinema-card border border-cinema-border p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Schedule New Showtime</h3>
            <form onSubmit={handleCreateShow} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-400 block mb-1">Select Movie</label>
                <select
                  value={newShowMovieId}
                  onChange={(e) => setNewShowMovieId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-400 block mb-1">Select Screen</label>
                <select
                  value={newShowScreenId}
                  onChange={(e) => setNewShowScreenId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="screen-1">Starlight IMAX - Screen 1 (64 seats)</option>
                  <option value="screen-2">Starlight Dolby Atmos - Screen 2 (56 seats)</option>
                  <option value="screen-3">CineVerse VIP Lounge - Screen 1 (60 seats)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newShowTime}
                    onChange={(e) => setNewShowTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Price Multiplier</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={newShowMultiplier}
                    onChange={(e) => setNewShowMultiplier(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-glow-cyan"
                >
                  Schedule Showtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

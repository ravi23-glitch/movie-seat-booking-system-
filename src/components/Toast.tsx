"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let bgColor = "bg-slate-900 border-slate-700 text-white";
        let icon = <Info className="w-5 h-5 text-cyan-400 shrink-0" />;

        if (toast.type === "success") {
          bgColor = "bg-emerald-950/90 border-emerald-600/40 text-emerald-100";
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === "error") {
          bgColor = "bg-rose-950/90 border-rose-600/50 text-rose-100 shadow-lg shadow-rose-950/50";
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        } else if (toast.type === "warning") {
          bgColor = "bg-amber-950/90 border-amber-600/50 text-amber-100";
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in ${bgColor}`}
          >
            {icon}
            <div className="flex-1 text-sm">
              <p className="font-semibold">{toast.message}</p>
              {toast.details && (
                <p className="text-xs opacity-80 mt-1">{toast.details}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

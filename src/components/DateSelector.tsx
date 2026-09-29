"use client";

import React from "react";
import { Calendar } from "lucide-react";

interface DateOption {
  date: Date;
  label: string;
  dayName: string;
  formattedDate: string;
}

interface DateSelectorProps {
  selectedDateIndex: number;
  onSelectDate: (index: number) => void;
}

export function DateSelector({ selectedDateIndex, onSelectDate }: DateSelectorProps) {
  const dates: DateOption[] = [0, 1, 2].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);

    let label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return {
      date: d,
      label,
      dayName,
      formattedDate,
    };
  });

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mr-2 shrink-0">
        <Calendar className="w-4 h-4 text-brand-400" />
        <span>SELECT DATE:</span>
      </div>
      {dates.map((item, idx) => {
        const isSelected = selectedDateIndex === idx;
        return (
          <button
            key={idx}
            onClick={() => onSelectDate(idx)}
            className={`flex flex-col items-center justify-center px-5 py-2.5 rounded-xl border transition-all shrink-0 ${
              isSelected
                ? "bg-brand-500 text-black border-brand-400 font-bold shadow-glow scale-105"
                : "bg-cinema-card text-slate-300 border-cinema-border hover:border-slate-600 hover:text-white"
            }`}
          >
            <span className={`text-[11px] uppercase tracking-wider ${isSelected ? "text-black/80" : "text-brand-400"}`}>
              {item.label}
            </span>
            <span className="text-sm font-semibold">{item.formattedDate}</span>
          </button>
        );
      })}
    </div>
  );
}

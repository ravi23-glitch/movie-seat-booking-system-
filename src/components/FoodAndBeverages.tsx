"use client";

import React from "react";
import { Plus, Minus, Utensils, Sparkles, Tag } from "lucide-react";

export interface SnackItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "POPCORN" | "NACHOS" | "BEVERAGES" | "COMBOS";
  emoji: string;
  badge?: string;
}

export const CINEMA_SNACKS: SnackItem[] = [
  {
    id: "snack-1",
    name: "Jumbo Caramel Gold Popcorn",
    description: "Slow-popped artisan corn coated in rich buttery golden caramel glaze",
    price: 260,
    category: "POPCORN",
    emoji: "🍿",
    badge: "Bestseller",
  },
  {
    id: "snack-2",
    name: "Cheddar Cheese & Truffle Crunch",
    description: "Crispy butterfly popcorn dusted with aged cheddar and white truffle oil",
    price: 290,
    category: "POPCORN",
    emoji: "🍿",
  },
  {
    id: "snack-3",
    name: "Loaded Mexican Salsa Nachos",
    description: "Crisp stone-ground tortilla chips with jalapeño salsa & warm cheese fondue",
    price: 220,
    category: "NACHOS",
    emoji: "🌮",
  },
  {
    id: "snack-4",
    name: "Ice Cold Coca-Cola Zero (650ml)",
    description: "Chilled fountain beverage served in collectible cinema cup with ice",
    price: 130,
    category: "BEVERAGES",
    emoji: "🥤",
  },
  {
    id: "snack-5",
    name: "Blockbuster Duo Feast Combo",
    description: "1 Jumbo Caramel Popcorn + 2 Large Fountain Drinks + 1 Loaded Nachos",
    price: 499,
    category: "COMBOS",
    emoji: "🍱",
    badge: "Save ₹140",
  },
];

interface FoodAndBeveragesProps {
  quantities: Record<string, number>;
  onQuantityChange: (id: string, delta: number) => void;
}

export function FoodAndBeverages({ quantities, onQuantityChange }: FoodAndBeveragesProps) {
  const totalSnackAmount = CINEMA_SNACKS.reduce((sum, item) => {
    return sum + item.price * (quantities[item.id] || 0);
  }, 0);

  const totalItemCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full rounded-3xl bg-cinema-card border border-cinema-border p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cinema-border/60 pb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            Cinema Gourmet Concessions & Snacks
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Pre-order delicious popcorn, nachos, and drinks for seat delivery or counter fast-track
          </p>
        </div>

        {totalItemCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            {totalItemCount} items: ₹{totalSnackAmount.toFixed(2)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CINEMA_SNACKS.map((snack) => {
          const count = quantities[snack.id] || 0;
          return (
            <div
              key={snack.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                count > 0
                  ? "bg-amber-500/10 border-amber-500/50 shadow-sm"
                  : "bg-cinema-darker/60 border-cinema-border/60 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl shrink-0 p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  {snack.emoji}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white leading-tight">{snack.name}</h4>
                    {snack.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {snack.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-snug">
                    {snack.description}
                  </p>
                  <p className="text-xs font-mono font-bold text-brand-400 mt-1.5">
                    ₹{snack.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-2 shrink-0">
                {count > 0 ? (
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(snack.id, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-white font-mono">
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(snack.id, 1)}
                      className="w-6 h-6 rounded-lg bg-brand-500 hover:bg-brand-400 text-black flex items-center justify-center font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onQuantityChange(snack.id, 1)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-brand-500 hover:text-black border border-slate-700 hover:border-brand-500 text-xs font-semibold text-slate-300 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

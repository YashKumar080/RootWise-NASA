// src/components/Priorities.tsx

import React, { useState } from "react";
import type { Priorities as PrioritiesType } from "../types/models";

interface Props {
  onNext: (p: PrioritiesType) => void;
  onBack?: () => void;
}

export const Priorities: React.FC<Props> = ({ onNext, onBack }) => {
  const [water, setWater] = useState(34);
  const [soil, setSoil] = useState(33);
  const [income, setIncome] = useState(33);

  // Ensure sum is 100 by adjusting proportionally
  const adjust = (changed: "water" | "soil" | "income", value: number) => {
    let newWater = water,
      newSoil = soil,
      newIncome = income;
    const remainder = 100 - value;
    if (changed === "water") {
      newSoil = Math.round((soil / (soil + income || 1)) * remainder);
      newIncome = remainder - newSoil;
      newWater = value;
    } else if (changed === "soil") {
      newWater = Math.round((water / (water + income || 1)) * remainder);
      newIncome = remainder - newWater;
      newSoil = value;
    } else {
      newWater = Math.round((water / (water + soil || 1)) * remainder);
      newSoil = remainder - newWater;
      newIncome = value;
    }
    setWater(newWater);
    setSoil(newSoil);
    setIncome(newIncome);
  };

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] p-6 md:p-10 animate-fade-in">
      <div className="max-w-[700px] mx-auto">
        <div className="mb-8">
          <span className="badge badge-forest text-xs uppercase tracking-wider mb-2 inline-block">Step 3 of 5</span>
          <h2 className="text-3xl font-bold text-[var(--color-text)]">Farmer Priorities</h2>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Weigh what matters most to your operation. Weights automatically balance to 100%.
          </p>
        </div>

        <div className="clay-card p-6 md:p-8 space-y-6 mb-8">
          <div className="p-4 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-[var(--color-text)]">Water Conservation</label>
              <span className="text-xl font-bold text-[var(--color-leaf)]">{water}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={water}
              onChange={(e) => adjust("water", Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">
              Favors crops requiring low total irrigation and drought tolerance.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-[var(--color-text)]">Soil Health & Recovery</label>
              <span className="text-xl font-bold text-[var(--color-forest)]">{soil}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={soil}
              onChange={(e) => adjust("soil", Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">
              Rewards nitrogen-fixing legumes and biomass replenishing root architectures.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-[var(--color-text)]">Income & Market Return</label>
              <span className="text-xl font-bold text-[var(--color-earth)]">{income}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={income}
              onChange={(e) => adjust("income", Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">
              Maximizes estimated harvest gross margin and commercial crop prices.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--color-sage)]/30 border border-[var(--color-border)] text-center text-xs">
            <span className="text-[var(--color-text-secondary)]">Total Allocation: </span>
            <span className="font-bold text-[var(--color-forest)]">{water + soil + income}%</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="btn-secondary">
              Back
            </button>
          )}
          <button onClick={() => onNext({ water, soil, income })} className="btn-primary">
            Generate Recommendations →
          </button>
        </div>
      </div>
    </div>
  );
};

// src/components/CropSelection.tsx

import React, { useState } from "react";
import { CROP_CATALOG } from "../data/crops";
import type { CropInfo } from "../types/models";

interface Props {
  onNext: (crops: CropInfo[]) => void;
  onBack?: () => void;
}

export const CropSelection: React.FC<Props> = ({ onNext, onBack }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(["c1", "c2", "c3"]));

  const filtered = CROP_CATALOG.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.family.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  const handleNext = () => {
    const crops = CROP_CATALOG.filter((c) => selected.has(c.id));
    onNext(crops);
  };

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] p-6 md:p-10 animate-fade-in">
      <div className="max-w-[1000px] mx-auto">
        <div className="mb-8">
          <span className="badge badge-forest text-xs uppercase tracking-wider mb-2 inline-block">Step 2 of 5</span>
          <h2 className="text-3xl font-bold text-[var(--color-text)]">Crop Selection</h2>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Choose candidate crops for the multi-season rotation evaluation. Currently selected: <strong>{selected.size}</strong>
          </p>
        </div>

        <div className="mb-6">
          <input
            placeholder="Search crops by name or botanical family…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {filtered.map((c) => {
            const isChecked = selected.has(c.id);
            return (
              <div
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`clay-card p-5 cursor-pointer transition-all ${
                  isChecked ? "!border-[var(--color-forest)] ring-2 ring-[var(--color-forest)]/20" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-semibold text-[var(--color-text)]">{c.name}</h4>
                    <span className="text-xs text-[var(--color-text-secondary)]">Family: {c.family}</span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isChecked ? "bg-[var(--color-forest)] border-[var(--color-forest)]" : "border-[var(--color-border)]"
                    }`}
                  >
                    {isChecked && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <span className="badge badge-sage text-[10px] capitalize">{c.season}</span>
                  <span className="badge badge-earth text-[10px]">{c.durationMonths} months</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--color-border)] text-center text-xs">
                  <div>
                    <div className="text-[var(--color-text-secondary)]">Water</div>
                    <div className="font-semibold text-[var(--color-text)]">{c.waterDemand}/10</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-text-secondary)]">Soil</div>
                    <div className="font-semibold text-[var(--color-forest)]">{c.soilContribution}/10</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-text-secondary)]">Income</div>
                    <div className="font-semibold text-[var(--color-earth)]">{c.incomePotential}/10</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="btn-secondary">
              Back
            </button>
          )}
          <button onClick={handleNext} className="btn-primary" disabled={selected.size === 0}>
            Next: Set Priorities →
          </button>
        </div>
      </div>
    </div>
  );
};

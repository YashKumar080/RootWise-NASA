// src/components/screens/CropLibraryScreen.tsx

import React, { useState } from "react";
import { CROP_CATALOG } from "../../data/crops";
import type { CropInfo } from "../../types/models";

interface Props {
  selectedCrops: CropInfo[];
  onSelect: (crops: CropInfo[]) => void;
}

const categories = ["All", "Poaceae", "Fabaceae"];
const seasons = ["All", "spring", "summer", "autumn", "winter"];

export const CropLibraryScreen: React.FC<Props> = ({ selectedCrops, onSelect }) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [seasonFilter, setSeasonFilter] = useState("All");
  const [detailCrop, setDetailCrop] = useState<CropInfo | null>(null);

  const selectedIds = new Set(selectedCrops.map(c => c.id));

  const filtered = CROP_CATALOG.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.family.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || c.family === categoryFilter;
    const matchesSeason = seasonFilter === "All" || c.season === seasonFilter;
    return matchesSearch && matchesCategory && matchesSeason;
  });

  const toggleCrop = (crop: CropInfo) => {
    if (selectedIds.has(crop.id)) {
      onSelect(selectedCrops.filter(c => c.id !== crop.id));
    } else {
      onSelect([...selectedCrops, crop]);
    }
  };

  const MetricBar: React.FC<{ value: number; max?: number; color: string }> = ({ value, max = 10, color }) => (
    <div className="metric-bar" style={{ height: '4px' }}>
      <div className="metric-bar-fill" style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  );

  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Crop Library</h2>
          <p className="text-[var(--color-text-secondary)]">
            Browse and select crops for rotation planning. <strong>{selectedCrops.length}</strong> selected.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="clay-card-flat p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search crops by name or family…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none font-[var(--font-sans)] ${
                  categoryFilter === cat
                    ? "bg-[var(--color-forest)] text-white"
                    : "bg-[var(--color-ivory)] text-[var(--color-text-secondary)] hover:bg-[var(--color-sage)]"
                }`}
              >
                {cat}
              </button>
            ))}
            <span className="w-px bg-[var(--color-border)] mx-1 hidden md:block" />
            {seasons.map((s) => (
              <button
                key={s}
                onClick={() => setSeasonFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize cursor-pointer border-none font-[var(--font-sans)] ${
                  seasonFilter === s
                    ? "bg-[var(--color-forest)] text-white"
                    : "bg-[var(--color-ivory)] text-[var(--color-text-secondary)] hover:bg-[var(--color-sage)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Crop grid */}
        <div className="flex-1">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((crop) => {
              const isSelected = selectedIds.has(crop.id);
              return (
                <div
                  key={crop.id}
                  className={`clay-card p-5 cursor-pointer transition-all ${isSelected ? "!border-[var(--color-forest)] ring-2 ring-[var(--color-forest)]/20" : ""}`}
                  onClick={() => toggleCrop(crop)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-semibold text-[var(--color-text)]">{crop.name}</h4>
                      <span className="text-xs text-[var(--color-text-secondary)]">{crop.family}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isSelected ? "bg-[var(--color-forest)] border-[var(--color-forest)]" : "border-[var(--color-border)]"
                    }`}>
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <span className="badge badge-sage text-[10px] capitalize">{crop.season}</span>
                    <span className="badge badge-earth text-[10px]">{crop.durationMonths}mo</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-[var(--color-text-secondary)]">Water</span>
                        <span className="font-medium text-[var(--color-text)]">{crop.waterDemand}/10</span>
                      </div>
                      <MetricBar value={crop.waterDemand} color="var(--color-leaf)" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-[var(--color-text-secondary)]">Soil</span>
                        <span className="font-medium text-[var(--color-text)]">{crop.soilContribution}/10</span>
                      </div>
                      <MetricBar value={crop.soilContribution} color="var(--color-forest)" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-[var(--color-text-secondary)]">Income</span>
                        <span className="font-medium text-[var(--color-text)]">{crop.incomePotential}/10</span>
                      </div>
                      <MetricBar value={crop.incomePotential} color="var(--color-earth)" />
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); setDetailCrop(crop); }}
                    className="mt-3 text-xs text-[var(--color-forest)] font-medium hover:underline cursor-pointer bg-transparent border-none p-0 font-[var(--font-sans)]"
                  >
                    View details →
                  </button>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="clay-card-flat p-12 text-center">
              <div className="text-2xl mb-3">🔍</div>
              <div className="text-sm text-[var(--color-text-secondary)]">No crops match your search criteria.</div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {detailCrop && (
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="clay-card p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--color-text)]">{detailCrop.name}</h3>
                <button onClick={() => setDetailCrop(null)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer bg-transparent border-none p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between"><span className="text-xs text-[var(--color-text-secondary)]">Family</span><span className="text-sm font-medium text-[var(--color-text)]">{detailCrop.family}</span></div>
                <div className="flex justify-between"><span className="text-xs text-[var(--color-text-secondary)]">Season</span><span className="text-sm font-medium text-[var(--color-text)] capitalize">{detailCrop.season}</span></div>
                <div className="flex justify-between"><span className="text-xs text-[var(--color-text-secondary)]">Duration</span><span className="text-sm font-medium text-[var(--color-text)]">{detailCrop.durationMonths} months</span></div>
                <div className="flex justify-between"><span className="text-xs text-[var(--color-text-secondary)]">Water Demand</span><span className="text-sm font-medium text-[var(--color-text)]">{detailCrop.waterDemand}/10</span></div>
                <div className="flex justify-between"><span className="text-xs text-[var(--color-text-secondary)]">Soil Contribution</span><span className="text-sm font-medium text-[var(--color-text)]">{detailCrop.soilContribution}/10</span></div>
                <div className="flex justify-between"><span className="text-xs text-[var(--color-text-secondary)]">Income Potential</span><span className="text-sm font-medium text-[var(--color-text)]">{detailCrop.incomePotential}/10</span></div>
              </div>
              <button
                onClick={() => toggleCrop(detailCrop)}
                className={selectedIds.has(detailCrop.id) ? "btn-secondary w-full text-sm" : "btn-primary w-full text-sm"}
              >
                {selectedIds.has(detailCrop.id) ? "Remove from Selection" : "Add to Selection"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// src/components/screens/PlannerScreen.tsx

import React, { useState, useEffect, useRef } from "react";
import { getCropHistory } from "../../services/cropHistoryService";
import { CROP_CATALOG } from "../../data/crops";
import type { FarmLocation, SoilCharacteristics, CropInfo, Priorities } from "../../types/models";

interface Props {
  location: FarmLocation;
  soil: SoilCharacteristics;
  selectedCrops: CropInfo[];
  priorities: Priorities;
  onUpdateCrops: (crops: CropInfo[]) => void;
  onUpdatePriorities: (p: Priorities) => void;
  onNavigate: (screen: string) => void;
  // New props for historical data connection
  fieldId?: string;
  setPreviousFamilies?: (families: string[]) => void;
}



export const PlannerScreen: React.FC<Props> = ({
  location,
  soil,
  selectedCrops,
  priorities,
  onUpdateCrops,
  onUpdatePriorities,
  onNavigate,
  fieldId,
  setPreviousFamilies,
}) => {
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const [activeTab, setActiveTab] = useState<'crops' | 'priorities' | 'history'>('crops');

  // Fetch crop history when fieldId changes
  useEffect(() => {
    if (!fieldId) {
      // No field selected – clear any previous families and exit early
      setPreviousFamilies?.([]);
      setHistoryLoading(false);
      setHistoryError(null);
      return;
    }
    const currentRequestId = ++requestIdRef.current;
    setHistoryLoading(true);
    setHistoryError(null);
    getCropHistory(fieldId)
      .then((rows) => {
        if (currentRequestId !== requestIdRef.current) return; // stale response
        const families = rows
          .filter((r) => r.crop_family)
          .sort((a, b) => {
            const da = new Date(a.planting_date ?? 0).getTime();
            const db = new Date(b.planting_date ?? 0).getTime();
            return db - da; // most recent first
          })
          .map((r) => r.crop_family);
        setPreviousFamilies?.(families);
      })
      .catch((e) => {
        if (currentRequestId !== requestIdRef.current) return;
        console.error(e);
        setHistoryError(e.message ?? 'Failed to load crop history');
        setPreviousFamilies?.([]);
      })
      .finally(() => {
        if (currentRequestId !== requestIdRef.current) return;
        setHistoryLoading(false);
      });
  }, [fieldId]);

  const selectedIds = new Set(selectedCrops.map((c) => c.id));

  const toggleCrop = (crop: CropInfo) => {
    if (selectedIds.has(crop.id)) {
      onUpdateCrops(selectedCrops.filter((c) => c.id !== crop.id));
    } else {
      onUpdateCrops([...selectedCrops, crop]);
    }
  };

  // Priority adjustment — preserve existing logic
  const adjustPriority = (changed: "water" | "soil" | "income", value: number) => {
    let w = priorities.water,
      s = priorities.soil,
      inc = priorities.income;
    const remainder = 100 - value;
    if (changed === "water") {
      s = Math.round((priorities.soil / (priorities.soil + priorities.income || 1)) * remainder);
      inc = remainder - s;
      w = value;
    } else if (changed === "soil") {
      w = Math.round((priorities.water / (priorities.water + priorities.income || 1)) * remainder);
      inc = remainder - w;
      s = value;
    } else {
      w = Math.round((priorities.water / (priorities.water + priorities.soil || 1)) * remainder);
      s = remainder - w;
      inc = value;
    }
    onUpdatePriorities({ water: w, soil: s, income: inc });
  };

  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Rotation Planner</h2>
          <p className="text-[var(--color-text-secondary)]">
            Select crops and set priorities to generate rotation recommendations.
          </p>
        </div>
                <button
          onClick={() => onNavigate("recommendations")}
          className="btn-primary text-sm"
          disabled={historyLoading || !!historyError || selectedCrops.length < 4}
        >
          Generate Plans →
        </button>
        {/* Selection counter & warning */}
        <div className="text-sm mt-2">
          <span>{selectedCrops.length} of {CROP_CATALOG.length} crops selected</span>
          {selectedCrops.length < 4 && (
            <p className="text-red-600">Select at least 4 crops to generate recommendations.</p>
          )}
        </div>

      </div>

      {/* Context bar */}
      <div className="clay-card-flat p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)]">Field:</span>
            <span className="text-sm font-medium text-[var(--color-text)]">{location.fieldName || "—"}</span>
          </div>
          <span className="w-px h-4 bg-[var(--color-border)]" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)]">Soil:</span>
            <span className="text-sm font-medium text-[var(--color-text)] capitalize">{soil.soilType || "—"}</span>
          </div>
          <span className="w-px h-4 bg-[var(--color-border)]" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)]">Selected:</span>
            <span className="text-sm font-bold text-[var(--color-forest)]">{selectedCrops.length} crops</span>
          </div>
        </div>
      </div>

      {/* Loading / error messages for crop history */}
      {historyLoading && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">Loading crop history…</p>
      )}
      {historyError && (
        <p className="text-sm text-red-600 mb-4">Error loading crop history: {historyError}</p>
      )}
      {fieldId === undefined && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">Select a field to load its crop history.</p>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--color-border)]">
        {([
          { key: "crops", label: "Crop Selection" },
          { key: "priorities", label: "Priorities" },
          { key: "history", label: "Previous Crops" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px cursor-pointer bg-transparent border-l-0 border-r-0 border-t-0 font-[var(--font-sans)] ${
              activeTab === tab.key
                ? "text-[var(--color-forest)] border-[var(--color-forest)]"
                : "text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "crops" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CROP_CATALOG.map((crop) => {
            const isSelected = selectedIds.has(crop.id);
            return (
              <div
                key={crop.id}
                onClick={() => toggleCrop(crop)}
                className={`clay-card p-5 cursor-pointer transition-all ${isSelected ? "!border-[var(--color-forest)] ring-2 ring-[var(--color-forest)]/20" : ""}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-base font-semibold text-[var(--color-text)]">{crop.name}</h4>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSelected ? "bg-[var(--color-forest)] border-[var(--color-forest)]" : "border-[var(--color-border)]"
                  }`}>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] mb-2">
                  {crop.family} · {crop.season} · {crop.durationMonths}mo
                </div>
                <div className="flex gap-3 text-[11px]">
                  <span className="text-[var(--color-text-secondary)]">
                    Water <strong className="text-[var(--color-text)]">{crop.waterDemand}</strong>
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    Soil <strong className="text-[var(--color-text)]">{crop.soilContribution}</strong>
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    Income <strong className="text-[var(--color-text)]">{crop.incomePotential}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "priorities" && (
        <div className="clay-card p-8 max-w-lg">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">Farmer Priorities</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            Adjust how the rotation planner weighs each factor. Total must equal 100%.
          </p>
          <div className="space-y-6">
            {([
              { key: "water" as const, label: "Water Conservation", value: priorities.water, color: "var(--color-leaf)" },
              { key: "soil" as const, label: "Soil Health", value: priorities.soil, color: "var(--color-forest)" },
              { key: "income" as const, label: "Income Potential", value: priorities.income, color: "var(--color-earth)" },
            ]).map((p) => (
              <div key={p.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--color-text)]">{p.label}</label>
                  <span className="text-lg font-bold" style={{ color: p.color }}>
                    {p.value}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={p.value}
                  onChange={(e) => adjustPriority(p.key, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 p-3 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)] text-center">
            <span className="text-xs text-[var(--color-text-secondary)]">Total: </span>
            <span className="text-sm font-bold text-[var(--color-forest)]">
              {priorities.water + priorities.soil + priorities.income}%
            </span>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="clay-card-flat p-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Previous Crop History</h3>
          <div className="space-y-3">
            {historyLoading ? (
              <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>
            ) : historyError ? (
              <p className="text-sm text-red-600">Unable to display history.</p>
            ) : (
              // Placeholder data – real history will be shown after integration
              [
                { season: "Kharif 2025", crop: "Soybean", note: "Good soil recovery" },
                { season: "Rabi 2024-25", crop: "Wheat", note: "Standard rotation" },
                { season: "Kharif 2024", crop: "Cotton", note: "High water use" },
              ].map((h) => (
                <div key={h.season} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)]">
                  <div className="w-1 h-10 rounded-full bg-[var(--color-leaf)]" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[var(--color-text)]">{h.crop}</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">{h.season}</div>
                  </div>
                  <span className="badge badge-sage text-[10px]">{h.note}</span>
                </div>
              ))
            )}
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-3 italic">Demo history data</p>
        </div>
      )}
    </div>
  );
};
// src/components/screens/RiskRadarScreen.tsx

import React from "react";
import { generatePlans } from "../../engine/rotationEngine";
import type { FarmLocation, SoilCharacteristics, CropInfo, Priorities } from "../../types/models";

interface Props {
  location: FarmLocation;
  soil: SoilCharacteristics;
  selectedCrops: CropInfo[];
  priorities: Priorities;
  previousFamilies?: string[];
}


const RiskIndicator: React.FC<{ level: "low" | "medium" | "high"; label: string }> = ({ level, label }) => {
  const config = {
    low: { color: "var(--color-forest)", bg: "rgba(25, 75, 59, 0.08)", text: "Low" },
    medium: { color: "var(--color-earth)", bg: "rgba(199, 164, 119, 0.15)", text: "Medium" },
    high: { color: "#c44536", bg: "rgba(196, 69, 54, 0.1)", text: "High" },
  }[level];
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)]">
      <span className="text-sm text-[var(--color-text)]">{label}</span>
      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: config.bg, color: config.color }}>
        {config.text}
      </span>
    </div>
  );
};

export const RiskRadarScreen: React.FC<Props> = ({ location, soil, selectedCrops, priorities, previousFamilies }) => {
  const plans = generatePlans(location, soil, selectedCrops, priorities, previousFamilies ?? []);
  const bestPlan = plans.reduce((best, cur) => (cur.scores.total > best.scores.total ? cur : best), plans[0]);

  // Check for family repetition
  const families = bestPlan.crops.map(c => c.family);
  const hasRepetition = families.length !== new Set(families).size;

  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Risk Radar</h2>
        <p className="text-[var(--color-text-secondary)]">
          Assess potential risks in your planned rotation for <strong>{location.fieldName || "your field"}</strong>.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Risk summary */}
        <div className="clay-card p-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-5">Risk Assessment</h3>
          <div className="space-y-3">
            <RiskIndicator level={bestPlan.scores.water > 6 ? "medium" : "low"} label="Water Risk" />
            <RiskIndicator level={hasRepetition ? "high" : "low"} label="Crop-Family Repetition" />
            <RiskIndicator level={soil.soilType ? "low" : "medium"} label="Soil Compatibility" />
            <RiskIndicator level="low" label="Seasonal Compatibility" />
            <RiskIndicator level="medium" label="Climate-Related Risk" />
            <RiskIndicator
              level={(!soil.pH || !soil.organicCarbon) ? "high" : (soil.nitrogen ? "low" : "medium")}
              label="Missing-Data Risk"
            />
          </div>
        </div>

        {/* Risk metrics */}
        <div className="clay-card p-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-5">Risk Metrics</h3>
          <div className="space-y-5">
            {[
              { label: "Soil Compatibility Score", value: bestPlan.scores.soil * 10, color: "var(--color-forest)" },
              { label: "Water Demand Rating", value: bestPlan.scores.water * 10, color: "var(--color-leaf)" },
              { label: "Income Stability", value: bestPlan.scores.income * 10, color: "var(--color-earth)" },
              { label: "Climate Suitability", value: bestPlan.scores.climate * 10, color: "var(--color-lime)" },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-[var(--color-text)]">{m.label}</span>
                  <span className="text-sm font-semibold text-[var(--color-text)]">{Math.round(m.value)}%</span>
                </div>
                <div className="metric-bar">
                  <div className="metric-bar-fill" style={{ width: `${m.value}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warnings */}
      <div className="clay-card-flat p-6 mb-6">
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Warnings & Alerts</h3>
        <div className="space-y-3">
          {hasRepetition && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#c44536]/5 border border-[#c44536]/20">
              <span className="text-lg">⚠️</span>
              <div>
                <div className="text-sm font-medium text-[var(--color-text)]">Crop-family repetition detected</div>
                <div className="text-xs text-[var(--color-text-secondary)]">
                  Your best rotation plan includes crops from the same family in consecutive seasons. This increases pest and disease risk.
                </div>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-earth)]/10 border border-[var(--color-earth)]/20">
            <span className="text-lg">🌤️</span>
            <div>
              <div className="text-sm font-medium text-[var(--color-text)]">Climate data is demo only</div>
              <div className="text-xs text-[var(--color-text-secondary)]">
                Climate suitability uses a static placeholder score. Connect environmental data sources for accurate assessment.
              </div>
            </div>
          </div>
          {(!soil.nitrogen || !soil.phosphorus || !soil.potassium) && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-sage)]/50 border border-[var(--color-border)]">
              <span className="text-lg">📋</span>
              <div>
                <div className="text-sm font-medium text-[var(--color-text)]">Incomplete soil data</div>
                <div className="text-xs text-[var(--color-text-secondary)]">
                  Some soil nutrient values are missing. Complete your soil profile for more accurate recommendations.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-[10px] text-[var(--color-text-secondary)] italic">Risk assessments use simplified demo logic. Not a substitute for professional agronomic advice.</p>
    </div>
  );
};

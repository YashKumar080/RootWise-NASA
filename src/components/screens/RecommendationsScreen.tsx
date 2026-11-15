// src/components/screens/RecommendationsScreen.tsx

import React from "react";
import { generatePlans } from "../../engine/rotationEngine";
import type { FarmLocation, SoilCharacteristics, Priorities, CropInfo } from "../../types/models";

interface Props {
  location: FarmLocation;
  soil: SoilCharacteristics;
  selectedCrops: CropInfo[];
  priorities: Priorities;
  previousFamilies?: string[];
}

export const RecommendationsScreen: React.FC<Props> = ({ location, soil, selectedCrops, priorities, previousFamilies }) => {
  const plans = generatePlans(location, soil, selectedCrops, priorities, previousFamilies ?? []);
  const bestPlan = plans.reduce((best, cur) => (cur.scores.total > best.scores.total ? cur : best), plans[0]);

  const planColors: Record<string, string> = {
    "Soil Guardian": "var(--color-forest)",
    "Water Saver": "var(--color-leaf)",
    "Balanced Return": "var(--color-earth)",
  };

  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Recommendations</h2>
        <p className="text-[var(--color-text-secondary)]">
          Three rotation plans generated based on your field conditions and priorities.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const isBest = plan.name === bestPlan.name;
          const color = planColors[plan.name] || "var(--color-forest)";
          return (
            <div
              key={plan.name}
              className={`clay-card p-6 relative ${isBest ? "ring-2 ring-[var(--color-forest)]/20 !border-[var(--color-forest)]" : ""}`}
            >
              {isBest && (
                <div className="absolute -top-3 left-6">
                  <span className="badge badge-forest text-[10px]">⭐ Recommended</span>
                </div>
              )}
              <div className="mb-4 pt-1">
                <h3 className="text-lg font-semibold text-[var(--color-text)]">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold" style={{ color }}>{plan.scores.total}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">/ 10</span>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="space-y-3 mb-5">
                {[
                  { label: "Water", value: plan.scores.water, max: 10, barColor: "var(--color-leaf)" },
                  { label: "Soil", value: plan.scores.soil, max: 10, barColor: "var(--color-forest)" },
                  { label: "Income", value: plan.scores.income, max: 10, barColor: "var(--color-earth)" },
                  { label: "Climate", value: plan.scores.climate, max: 10, barColor: "var(--color-lime)" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[var(--color-text-secondary)]">{s.label}</span>
                      <span className="text-xs font-semibold text-[var(--color-text)]">{s.value}</span>
                    </div>
                    <div className="metric-bar">
                      <div className="metric-bar-fill" style={{ width: `${(s.value / s.max) * 100}%`, background: s.barColor }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Crops in plan */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Rotation Sequence</div>
                <div className="space-y-2">
                  {plan.crops.map((c, i) => (
                    <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--color-ivory)] border border-[var(--color-border)]">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: color }}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--color-text)]">{c.name}</div>
                        <div className="text-[10px] text-[var(--color-text-secondary)]">{c.family}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanations */}
              <div className="border-t border-[var(--color-border)] pt-4">
                <div className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Analysis</div>
                <ul className="space-y-1">
                  {plan.explanations.map((e, i) => (
                    <li key={i} className="text-xs text-[var(--color-text-secondary)] flex items-start gap-2">
                      <span className="text-[var(--color-leaf)] mt-0.5">•</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="clay-card-flat p-6">
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Side-by-Side Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 px-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Factor</th>
                {plans.map((p) => (
                  <th key={p.name} className="text-center py-3 px-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["water", "soil", "income", "climate", "total"] as const).map((factor) => (
                <tr key={factor} className="border-b border-[var(--color-border)]/50">
                  <td className="py-3 px-3 text-sm font-medium text-[var(--color-text)] capitalize">{factor}</td>
                  {plans.map((p) => {
                    const val = p.scores[factor];
                    const isBestInRow = val === Math.max(...plans.map(pp => pp.scores[factor]));
                    return (
                      <td key={p.name} className="text-center py-3 px-3">
                        <span className={`text-sm ${isBestInRow ? "font-bold text-[var(--color-forest)]" : "text-[var(--color-text)]"}`}>
                          {val}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

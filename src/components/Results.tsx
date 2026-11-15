// src/components/Results.tsx

import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { generatePlans } from "../engine/rotationEngine";
import type { FarmLocation, SoilCharacteristics, Priorities as PrioritiesType, RotationPlan } from "../types/models";

interface Props {
  location: FarmLocation;
  soil: SoilCharacteristics;
  selectedCrops: any[]; // CropInfo array
  priorities: PrioritiesType;
  onBack: () => void;
  // New prop for historical families
  previousFamilies?: string[];
}

export const Results: React.FC<Props> = ({ location, soil, selectedCrops, priorities, onBack, previousFamilies }) => {
  const plans: RotationPlan[] = generatePlans(location, soil, selectedCrops, priorities, previousFamilies ?? []);

  // Prepare data for Radar chart – each factor per plan
  const factors = ["water", "soil", "income", "climate"] as const;
  const radarData = factors.map((factor) => {
    const entry: any = { factor: factor.charAt(0).toUpperCase() + factor.slice(1) };
    entry[plans[0].name] = plans[0].scores[factor];
    entry[plans[1].name] = plans[1].scores[factor];
    entry[plans[2].name] = plans[2].scores[factor];
    return entry;
  });

  // Determine best plan (highest total score)
  const bestPlan = plans.reduce((best, cur) => (cur.scores.total > best.scores.total ? cur : best), plans[0]);

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] p-6 md:p-10 animate-fade-in">
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-8">
          <span className="badge badge-forest text-xs uppercase tracking-wider mb-2 inline-block">Analysis Complete</span>
          <h2 className="text-3xl font-bold text-[var(--color-text)]">Rotation Plan Recommendations</h2>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Evaluated for <strong>{location.fieldName || "your field"}</strong> based on your customized weighting profile.
          </p>
        </div>

        {/* 3 Strategy Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => {
            const isBest = plan.name === bestPlan.name;
            return (
              <div
                key={plan.name}
                className={`clay-card p-6 flex flex-col justify-between relative ${
                  isBest ? "!border-[var(--color-forest)] ring-2 ring-[var(--color-forest)]/20" : ""
                }`}
              >
                {isBest && (
                  <div className="absolute -top-3 left-6">
                    <span className="badge badge-forest text-[11px] py-1 px-3">⭐ Top Recommendation</span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-1 mt-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-[var(--color-forest)]">{plan.scores.total}</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">overall suitability</span>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
                      Sequence (3 Seasons)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.crops.map((c, i) => (
                        <span key={i} className="badge badge-sage text-xs">
                          {i + 1}. {c.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-border)] mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
                      Agronomic Heuristics
                    </div>
                    <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                      {plan.explanations.map((e, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[var(--color-leaf)]">•</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--color-border)] text-center text-xs">
                  <div>
                    <div className="text-[var(--color-text-secondary)]">Water</div>
                    <div className="font-semibold text-[var(--color-text)]">{plan.scores.water}</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-text-secondary)]">Soil</div>
                    <div className="font-semibold text-[var(--color-forest)]">{plan.scores.soil}</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-text-secondary)]">Income</div>
                    <div className="font-semibold text-[var(--color-earth)]">{plan.scores.income}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Factor Comparison Radar Section */}
        <div className="clay-card p-6 md:p-8 mb-8">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-[var(--color-text)]">Multi-Factor Radar Comparison</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Direct dimensional trade-off across Water Demand, Soil Contribution, Income Potential, and Climate Compatibility.
            </p>
          </div>

          <div className="w-full h-[400px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: "var(--color-text)", fontSize: 13 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="var(--color-text-secondary)" />
                <Radar
                  name="Soil Guardian"
                  dataKey="Soil Guardian"
                  stroke="#194B3B"
                  fill="#194B3B"
                  fillOpacity={0.35}
                />
                <Radar
                  name="Water Saver"
                  dataKey="Water Saver"
                  stroke="#72966B"
                  fill="#72966B"
                  fillOpacity={0.35}
                />
                <Radar
                  name="Balanced Return"
                  dataKey="Balanced Return"
                  stroke="#C7A477"
                  fill="#C7A477"
                  fillOpacity={0.35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-white)",
                    borderColor: "var(--color-border)",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(25, 75, 59, 0.1)",
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="btn-secondary">
            ← Reconfigure Parameters
          </button>
          <button
            onClick={() => window.print()}
            className="btn-primary"
          >
            Export Recommendation Brief
          </button>
        </div>
      </div>
    </div>
  );
};

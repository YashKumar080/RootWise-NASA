// src/components/Dashboard.tsx

import React from "react";
import type { FarmLocation, SoilCharacteristics } from "../types/models";
import { SummaryCard } from "./SummaryCard";

interface Props {
  location: FarmLocation;
  soil: SoilCharacteristics;
  onNext: () => void;
  onBack?: () => void;
}

export const Dashboard: React.FC<Props> = ({ location, soil, onNext, onBack }) => {
  // Demo environmental data – labelled clearly as DEMO
  const envData = {
    rainfall: { value: 120, unit: "mm", label: "DEMO" },
    temperature: { value: 24, unit: "°C", label: "DEMO" },
    soilMoisture: { value: 35, unit: "%", label: "DEMO" },
  };

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] p-6 md:p-10 animate-fade-in">
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-8">
          <span className="badge badge-forest text-xs uppercase tracking-wider mb-2 inline-block">Field Intelligence</span>
          <h2 className="text-3xl font-bold text-[var(--color-text)]">Field Summary</h2>
          <p className="text-[var(--color-text-secondary)] mt-1">Review baseline soil and environmental properties before selecting crops.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <SummaryCard title="Field" value={location.fieldName || "(unnamed)"} />
          <SummaryCard title="Location" value={`${location.state || "?"}, ${location.district || "?"}`} />
          <SummaryCard title="Coordinates" value={`${location.latitude || "-"}, ${location.longitude || "-"}`} />
          <SummaryCard title="Soil Type" value={soil.soilType || "(unspecified)"} />
          <SummaryCard title="pH" value={soil.pH || "-"} unit="" />
          <SummaryCard title="Organic C" value={soil.organicCarbon || "-"} unit="%" />
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">Environmental Conditions</h3>
          <p className="text-xs text-[var(--color-text-secondary)]">Synthetic remote sensing telemetry for rotational calibration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <SummaryCard title="Rainfall" value={envData.rainfall.value} unit={envData.rainfall.unit} label={envData.rainfall.label} />
          <SummaryCard title="Avg. Temp" value={envData.temperature.value} unit={envData.temperature.unit} label={envData.temperature.label} />
          <SummaryCard title="Soil Moisture" value={envData.soilMoisture.value} unit={envData.soilMoisture.unit} label={envData.soilMoisture.label} />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-border)]">
          {onBack && (
            <button onClick={onBack} className="btn-secondary">
              Back
            </button>
          )}
          <button onClick={onNext} className="btn-primary">
            Continue to Crops →
          </button>
        </div>
      </div>
    </div>
  );
};

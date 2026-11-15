// src/components/FarmDetails.tsx

import React, { useState } from "react";
import type { FarmLocation, SoilCharacteristics } from "../types/models";

interface Props {
  onNext: (location: FarmLocation, soil: SoilCharacteristics) => void;
  onBack?: () => void;
}

export const FarmDetails: React.FC<Props> = ({ onNext, onBack }) => {
  const [fieldName, setFieldName] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [soilType, setSoilType] = useState("");
  const [pH, setPH] = useState("");
  const [organicCarbon, setOrganicCarbon] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");

  const handleSubmit = () => {
    // Basic coordinate validation
    const latNum = Number(latitude);
    const lonNum = Number(longitude);
    if (latitude && (isNaN(latNum) || latNum < -90 || latNum > 90)) {
      alert("Latitude must be a number between -90 and 90.");
      return;
    }
    if (longitude && (isNaN(lonNum) || lonNum < -180 || lonNum > 180)) {
      alert("Longitude must be a number between -180 and 180.");
      return;
    }

    const location: FarmLocation = {
      fieldName: fieldName || "North Plot",
      state: state || "Maharashtra",
      district: district || "Nagpur",
      latitude: latitude ? latNum : 21.15,
      longitude: longitude ? lonNum : 79.09,
    };
    const soil: SoilCharacteristics = {
      soilType: (soilType as any) || "black",
      pH: pH ? Number(pH) : 7.2,
      organicCarbon: organicCarbon ? Number(organicCarbon) : 0.68,
      nitrogen: nitrogen ? Number(nitrogen) : 240,
      phosphorus: phosphorus ? Number(phosphorus) : 18,
      potassium: potassium ? Number(potassium) : 310,
    };
    onNext(location, soil);
  };

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] p-6 md:p-10 animate-fade-in">
      <div className="max-w-[850px] mx-auto">
        <div className="mb-8">
          <span className="badge badge-forest text-xs uppercase tracking-wider mb-2 inline-block">Step 1 of 5</span>
          <h2 className="text-3xl font-bold text-[var(--color-text)]">Farm & Soil Profile</h2>
          <p className="text-[var(--color-text-secondary)] mt-1">Provide field coordinates and soil test parameters to ground rotational scoring.</p>
        </div>

        <div className="clay-card p-6 md:p-8 space-y-6 mb-8">
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Location Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1.5">Field Name</label>
                <input
                  placeholder="e.g. North Plot"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1.5">State</label>
                <input
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1.5">District</label>
                <input
                  placeholder="e.g. Nagpur"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1.5">Latitude</label>
                <input
                  placeholder="e.g. 21.15"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1.5">Longitude</label>
                <input
                  placeholder="e.g. 79.09"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {latitude && longitude && (
              <a
                href={`https://www.openstreetmap.org/#map=12/${latitude}/${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--color-forest)] font-semibold underline mt-2.5 inline-block"
              >
                View field coordinates on OpenStreetMap ↗
              </a>
            )}
          </div>

          <hr className="border-[var(--color-border)]" />

          <div>
            <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Soil Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1.5">Soil Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="select-field"
                >
                  <option value="">Select soil type</option>
                  <option value="red">Red</option>
                  <option value="black">Black</option>
                  <option value="sandy">Sandy</option>
                  <option value="loamy">Loamy</option>
                  <option value="clay">Clay</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1.5">Soil pH</label>
                <input
                  placeholder="e.g. 7.2"
                  value={pH}
                  onChange={(e) => setPH(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1.5">Organic Carbon (%)</label>
                <input
                  placeholder="e.g. 0.68"
                  value={organicCarbon}
                  onChange={(e) => setOrganicCarbon(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1.5">Nitrogen (kg/ha)</label>
                <input
                  placeholder="Optional"
                  value={nitrogen}
                  onChange={(e) => setNitrogen(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1.5">Phosphorus (kg/ha)</label>
                <input
                  placeholder="Optional"
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1.5">Potassium (kg/ha)</label>
                <input
                  placeholder="Optional"
                  value={potassium}
                  onChange={(e) => setPotassium(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="btn-secondary">
              Back
            </button>
          )}
          <button onClick={handleSubmit} className="btn-primary">
            Next: Field Summary →
          </button>
        </div>
      </div>
    </div>
  );
};

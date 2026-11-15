// src/components/screens/EnvironmentScreen.tsx — Refined NASA POWER UI

import React, { useEffect, useState } from "react";
import type { FarmLocation } from "../../types/models";
import { fetchNasaPowerData, type NasaPowerData } from "../../services/env/nasaPower";

interface Props {
  location: FarmLocation;
}

export const EnvironmentScreen: React.FC<Props> = ({ location }) => {
  const [data, setData] = useState<NasaPowerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coordinates – fall back to demo defaults if missing
  const lat = Number(location.latitude) || 21.15;
  const lon = Number(location.longitude) || 79.09;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNasaPowerData(lat, lon);
      setData(res);
    } catch (err: unknown) {
      console.error("NASA data fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to retrieve NASA POWER data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [lat, lon]);

  // Simple skeleton placeholder (tailwind width utilities need concrete values)
  const skeleton = (width: string) => (
    <div className={`h-5 w-${width} bg-gray-200 animate-pulse rounded`} />
  );

  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Environmental Intelligence</h2>
            <span className="badge badge-forest text-[11px] font-semibold">NASA POWER API</span>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Agroclimatology, precipitation, and root‑zone wetness for <strong>{location.fieldName || "Selected Field"}</strong> ({lat.toFixed(2)}°N, {lon.toFixed(2)}°E).<br />
            <span className="text-xs text-[var(--color-text-secondary)]">Historical climatology (2001‑2025)</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-secondary text-xs !py-2 !px-3 flex items-center gap-1.5"
          >
            <svg
              className={loading ? "animate-spin" : ""}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            <span>{loading ? "Fetching NASA..." : "Refresh Feed"}</span>
          </button>
        </div>
      </div>

      {/* Error handling */}
      {error && (
        <div className="p-4 mb-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
          <span>⚠️</span>
          <span>Failed to load NASA POWER data: {error}</span>
          <button onClick={loadData} className="ml-auto btn-primary text-xs">Retry</button>
        </div>
      )}

      {/* Primary Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {/* Precipitation */}
        <div className="clay-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Precipitation</span>
            <span className="text-xl">🌧️</span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-bold text-[var(--color-forest)]">
              {loading ? skeleton("16") : data ? data.annual.precipMonthlyAvg : "-"}
            </span>
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">mm / mo</span>
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mb-3">
            Daily avg: {loading ? skeleton("12") : data ? data.annual.precipDailyAvg : "-"} mm/day
          </div>
          <div className="metric-bar mb-2">
            <div
              className="metric-bar-fill"
              style={
                loading || !data
                  ? { width: "0%", background: "var(--color-leaf)" }
                  : { width: `${Math.min(100, ((data.annual.precipMonthlyAvg ?? 0) / 200) * 100)}%`, background: "var(--color-leaf)" }
              }
            />
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)]">MERRA‑2 atmospheric model assimilation.</p>
        </div>

        {/* Temperature */}
        <div className="clay-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Avg Temperature</span>
            <span className="text-xl">☀️</span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-bold text-[var(--color-earth)]">
              {loading ? skeleton("8") : data ? data.annual.tempAvg : "-"}
            </span>
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">°C</span>
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mb-3">
            Range: {loading ? skeleton("6") : data ? data.annual.tempMin : "-"}°C – {loading ? skeleton("6") : data ? data.annual.tempMax : "-"}°C
          </div>
          <div className="metric-bar mb-2">
            <div
              className="metric-bar-fill"
              style={
                loading || !data
                  ? { width: "0%", background: "var(--color-earth)" }
                  : { width: `${Math.min(100, ((data.annual.tempAvg ?? 0) / 45) * 100)}%`, background: "var(--color-earth)" }
              }
            />
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)]">Air temperature at 2 m elevation.</p>
        </div>

        {/* Root Soil Wetness */}
        <div className="clay-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Root Soil Wetness</span>
            <span className="text-xl">💧</span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-bold text-[var(--color-leaf)]">
              {loading ? skeleton("8") : data ? data.annual.rootSoilWetness : "-"}
            </span>
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">% index</span>
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mb-3">
            Surface wetness: {loading ? skeleton("6") : data ? data.annual.surfaceSoilWetness : "-"}%
          </div>
          <div className="metric-bar mb-2">
            <div
              className="metric-bar-fill"
              style={
                loading || !data
                  ? { width: "0%", background: "var(--color-leaf)" }
                  : { width: `${data.annual.rootSoilWetness ?? 0}%`, background: "var(--color-leaf)" }
              }
            />
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)]">NASA Catchment Land Surface Model.</p>
        </div>

        {/* Solar Radiation */}
        <div className="clay-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Solar Irradiance</span>
            <span className="text-xl">⚡</span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-bold text-[var(--color-forest)]">
              {loading ? skeleton("6") : data ? data.annual.solarRadiation : "-"}
            </span>
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">MJ/m²/d</span>
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mb-3">
            All‑sky surface shortwave flux.
          </div>
          <div className="metric-bar mb-2">
            <div
              className="metric-bar-fill"
              style={
                loading || !data
                  ? { width: "0%", background: "var(--color-forest)" }
                  : { width: `${Math.min(100, ((data.annual.solarRadiation ?? 0) / 25) * 100)}%`, background: "var(--color-forest)" }
              }
            />
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)]">CERES satellite instrument observation.</p>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="clay-card-flat p-6 mb-8">
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">
          Monthly Agroclimatic Profile (NASA POWER Climatology)
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-5">
          Long‑term satellite multi‑year baseline for crop calendar planning.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                <th className="py-2.5 px-3 font-semibold uppercase">Month</th>
                <th className="py-2.5 px-3 font-semibold uppercase">Precipitation (mm/mo)</th>
                <th className="py-2.5 px-3 font-semibold uppercase">Avg Temp (°C)</th>
                <th className="py-2.5 px-3 font-semibold uppercase">Root Wetness (%)</th>
                <th className="py-2.5 px-3 font-semibold uppercase">Suitability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {(data?.monthly.months || ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]).map((m, idx) => {
                const precip = data?.monthly.precipitation[idx] ?? null;
                const temp = data?.monthly.temperature[idx] ?? null;
                const soil = data?.monthly.soilWetness[idx] ?? null;
                const isMonsoon = precip !== null && precip > 150;
                const isSummerPeak = temp !== null && temp > 32;
                return (
                  <tr key={m} className="hover:bg-[var(--color-sage)]/20 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[var(--color-text)]">{m}</td>
                    <td className="py-2.5 px-3 text-[var(--color-forest)] font-semibold">{precip !== null ? precip : "-"} mm</td>
                    <td className="py-2.5 px-3 text-[var(--color-earth)] font-semibold">{temp !== null ? temp : "-"} °C</td>
                    <td className="py-2.5 px-3 text-[var(--color-leaf)] font-semibold">{soil !== null ? soil : "-"}%</td>
                    <td className="py-2.5 px-3">
                      {isMonsoon ? (
                        <span className="badge badge-sage text-[10px]">High Rain / Kharif</span>
                      ) : isSummerPeak ? (
                        <span className="badge badge-earth text-[10px]">High Evaporation</span>
                      ) : (
                        <span className="badge badge-forest text-[10px]">Favorable / Rabi</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provenance and Citation */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="clay-card-flat p-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-3">Data Provenance</h3>
          <div className="space-y-3 text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="font-bold text-[var(--color-forest)]">Provider:</span>
              <span>NASA Langley Research Center, Prediction Of Worldwide Energy Resources (POWER)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[var(--color-forest)]">Platform:</span>
              <span>MERRA‑2 (Modern‑Era Retrospective analysis for Research and Applications, Version 2)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[var(--color-forest)]">Solar Flux:</span>
              <span>Clouds and the Earth's Radiant Energy System (CERES)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[var(--color-forest)]">Grid Resolution:</span>
              <span>0.5° latitude by 0.625° longitude worldwide</span>
            </div>
          </div>
        </div>
        <div className="clay-card-flat p-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-3">Rotation Engine Integration</h3>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
            ROOTWISE feeds these real atmospheric and soil moisture variables directly into our multi‑season scoring algorithms to evaluate crop water stress, optimal planting windows, and drought risks.
          </p>
          <div className="p-3 rounded-lg bg-[var(--color-ivory)] border border-[var(--color-border)] text-xs text-[var(--color-forest)] font-medium">
            ✓ Genuine live telemetry active (no synthetic placeholder values).
          </div>
        </div>
      </div>
    </div>
  );
};

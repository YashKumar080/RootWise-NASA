// src/components/screens/OverviewScreen.tsx

import React from "react";
import type { FarmLocation, SoilCharacteristics } from "../../types/models";

interface Props {
  location: FarmLocation;
  soil: SoilCharacteristics;
  onNavigate: (screen: string) => void;
}

export const OverviewScreen: React.FC<Props> = ({ location, soil, onNavigate }) => {
  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in">
      {/* Welcome header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">
          Welcome back, Farmer
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          Here's an overview of your current farm and planning status.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Field", value: location.fieldName || "—", icon: "🌾" },
          { label: "Soil Type", value: soil.soilType || "—", icon: "🏔️" },
          { label: "Soil pH", value: soil.pH || "—", icon: "⚗️" },
          { label: "Organic C", value: soil.organicCarbon ? `${soil.organicCarbon}%` : "—", icon: "🧪" },
        ].map((s) => (
          <div key={s.label} className="clay-card p-5">
            <div className="text-xl mb-2">{s.icon}</div>
            <div className="text-xs text-[var(--color-text-secondary)] mb-1">{s.label}</div>
            <div className="text-xl font-bold text-[var(--color-text)] capitalize">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Farm context */}
        <div className="clay-card-flat p-6 md:col-span-2">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Field Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Field Name", value: location.fieldName || "Not set" },
              { label: "Location", value: `${location.state || "—"}, ${location.district || "—"}` },
              { label: "Coordinates", value: location.latitude && location.longitude ? `${location.latitude}°, ${location.longitude}°` : "Not set" },
              { label: "Nitrogen", value: soil.nitrogen ? `${soil.nitrogen} kg/ha` : "—" },
              { label: "Phosphorus", value: soil.phosphorus ? `${soil.phosphorus} kg/ha` : "—" },
              { label: "Potassium", value: soil.potassium ? `${soil.potassium} kg/ha` : "—" },
            ].map((f) => (
              <div key={f.label}>
                <div className="text-xs text-[var(--color-text-secondary)] mb-0.5">{f.label}</div>
                <div className="text-sm font-medium text-[var(--color-text)]">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="clay-card-flat p-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => onNavigate("planner")} className="btn-primary w-full text-sm">
              Start Rotation Planner
            </button>
            <button onClick={() => onNavigate("crops")} className="btn-secondary w-full text-sm">
              Browse Crop Library
            </button>
            <button onClick={() => onNavigate("risk")} className="btn-ghost w-full text-sm justify-center border border-[var(--color-border)]">
              View Risk Radar
            </button>
          </div>
        </div>
      </div>

      {/* Environmental + Rotation status */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="clay-card-flat p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text)]">Environmental Data</h3>
            <span className="badge badge-earth text-[10px]">DEMO</span>
          </div>
          <div className="space-y-4">
            {[
              { label: "Avg. Rainfall", value: "120 mm", pct: 60 },
              { label: "Avg. Temperature", value: "24°C", pct: 48 },
              { label: "Soil Moisture", value: "35%", pct: 35 },
            ].map((e) => (
              <div key={e.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-[var(--color-text)]">{e.label}</span>
                  <span className="text-sm font-semibold text-[var(--color-text)]">{e.value}</span>
                </div>
                <div className="metric-bar">
                  <div className="metric-bar-fill" style={{ width: `${e.pct}%`, background: "var(--color-leaf)" }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-3 italic">Demo values — not live measurements</p>
        </div>

        <div className="clay-card-flat p-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Rotation Status</h3>
          <div className="space-y-3">
            {[
              { label: "Current season", value: "Rabi 2025-26", status: "Active" },
              { label: "Last planned", value: "3 seasons", status: "Complete" },
              { label: "Next action", value: "Select crops", status: "Pending" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)]">
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{r.label}</div>
                  <div className="text-sm font-medium text-[var(--color-text)]">{r.value}</div>
                </div>
                <span className={`badge text-[10px] ${r.status === "Active" ? "badge-lime" : r.status === "Complete" ? "badge-forest" : "badge-earth"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-3 italic">Demo planning status</p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="clay-card-flat p-6">
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Recent Planning Activity</h3>
        <div className="space-y-3">
          {[
            { time: "Today", action: "Updated soil profile for North Plot", badge: "Fields" },
            { time: "Yesterday", action: "Generated 3 rotation plans", badge: "Planner" },
            { time: "2 days ago", action: "Added Soybean and Wheat to crop selection", badge: "Crops" },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)]">
              <div className="w-2 h-2 rounded-full bg-[var(--color-leaf)] mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[var(--color-text)]">{a.action}</div>
                <div className="text-xs text-[var(--color-text-secondary)]">{a.time}</div>
              </div>
              <span className="badge badge-sage text-[10px] flex-shrink-0">{a.badge}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[var(--color-text-secondary)] mt-3 italic">Demo activity log</p>
      </div>
    </div>
  );
};

// src/components/screens/SettingsScreen.tsx

import React, { useState } from "react";

export const SettingsScreen: React.FC = () => {
  const [measurementUnit, setMeasurementUnit] = useState<"metric" | "imperial">("metric");
  const [notifyClimateAlerts, setNotifyClimateAlerts] = useState(true);
  const [notifySoilDeficits, setNotifySoilDeficits] = useState(true);
  const [strictLegumeRule, setStrictLegumeRule] = useState(true);

  return (
    <div className="max-w-[850px] mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Platform Settings</h2>
        <p className="text-[var(--color-text-secondary)]">
          Configure agronomic modeling heuristics, environmental alert triggers, and account preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Agronomic Constraints */}
        <div className="clay-card p-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Agronomic Decision Constraints</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)]">
              <div>
                <div className="text-sm font-semibold text-[var(--color-text)]">Strict Legume Frequency Check</div>
                <div className="text-xs text-[var(--color-text-secondary)]">Enforce at least one Fabaceae nitrogen-fixing crop every 3 cycles.</div>
              </div>
              <input
                type="checkbox"
                checked={strictLegumeRule}
                onChange={(e) => setStrictLegumeRule(e.target.checked)}
                className="w-5 h-5 accent-[var(--color-forest)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)]">
              <div>
                <div className="text-sm font-semibold text-[var(--color-text)]">Monoculture Repetition Penalty</div>
                <div className="text-xs text-[var(--color-text-secondary)]">Heavily penalize successive family plantings in candidate ranking.</div>
              </div>
              <span className="badge badge-forest text-[11px]">Active (0.5x weight)</span>
            </div>
          </div>
        </div>

        {/* Units & Localization */}
        <div className="clay-card p-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Regional & Unit Standards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-2">Unit System</label>
              <select
                value={measurementUnit}
                onChange={(e) => setMeasurementUnit(e.target.value as any)}
                className="select-field"
              >
                <option value="metric">Metric (kg/ha, mm, °C)</option>
                <option value="imperial">Imperial (lbs/acre, in, °F)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-2">Primary Climate Zone</label>
              <select className="select-field" defaultValue="semi-arid">
                <option value="semi-arid">Tropical Semi-Arid (Peninsular India)</option>
                <option value="humid-subtropical">Humid Subtropical (Gangetic Plain)</option>
                <option value="arid">Arid Western Plain</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="clay-card p-6">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Risk & Advisory Alerts</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)]">
              <div>
                <div className="text-sm font-semibold text-[var(--color-text)]">Soil Moisture Deficit Notifications</div>
                <div className="text-xs text-[var(--color-text-secondary)]">Alert when root-zone moisture drops below critical evapotranspiration limit.</div>
              </div>
              <input
                type="checkbox"
                checked={notifySoilDeficits}
                onChange={(e) => setNotifySoilDeficits(e.target.checked)}
                className="w-5 h-5 accent-[var(--color-forest)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)]">
              <div>
                <div className="text-sm font-semibold text-[var(--color-text)]">Seasonal Precipitation Shifts</div>
                <div className="text-xs text-[var(--color-text-secondary)]">Send advisory updates when long-range forecast deviates &gt;15% from historical median.</div>
              </div>
              <input
                type="checkbox"
                checked={notifyClimateAlerts}
                onChange={(e) => setNotifyClimateAlerts(e.target.checked)}
                className="w-5 h-5 accent-[var(--color-forest)] cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button className="btn-secondary text-sm">Discard Changes</button>
          <button className="btn-primary text-sm" onClick={() => alert("Settings saved successfully.")}>Save Settings</button>
        </div>
      </div>
    </div>
  );
};

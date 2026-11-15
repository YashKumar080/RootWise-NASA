// src/components/screens/HistoryScreen.tsx

import React from "react";

interface PlanHistoryEntry {
  id: string;
  date: string;
  field: string;
  rotationName: string;
  crops: string[];
  score: number;
  status: "Implemented" | "Under Review" | "Archived";
}

const mockHistory: PlanHistoryEntry[] = [
  {
    id: "ROT-2026-04",
    date: "12 Nov 2026",
    field: "North Plot (Plot 1A)",
    rotationName: "Soil Guardian Sequence",
    crops: ["Soybean", "Wheat", "Alfalfa"],
    score: 8.85,
    status: "Implemented",
  },
  {
    id: "ROT-2026-03",
    date: "28 Oct 2026",
    field: "East Acreage",
    rotationName: "Water Saver Protocol",
    crops: ["Barley", "Soybean", "Alfalfa"],
    score: 8.20,
    status: "Under Review",
  },
  {
    id: "ROT-2026-02",
    date: "14 Sep 2026",
    field: "Riverbed Terraces",
    rotationName: "Balanced Return Cycle",
    crops: ["Corn", "Soybean", "Wheat"],
    score: 7.95,
    status: "Archived",
  },
  {
    id: "ROT-2026-01",
    date: "01 Jul 2026",
    field: "North Plot (Plot 1A)",
    rotationName: "Monsoon Legume Intensive",
    crops: ["Soybean", "Barley"],
    score: 8.10,
    status: "Archived",
  },
];

export const HistoryScreen: React.FC = () => {
  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Planning History</h2>
          <p className="text-[var(--color-text-secondary)]">
            Audit trail of generated crop rotations, agronomic reviews, and seasonal adoption outcomes.
          </p>
        </div>
        <button className="btn-secondary text-sm">Export Audit Log (CSV)</button>
      </div>

      <div className="clay-card-flat overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-ivory)]">
                <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Plan ID</th>
                <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Date</th>
                <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Field Target</th>
                <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Sequence Strategy</th>
                <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Crops</th>
                <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Score</th>
                <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {mockHistory.map((entry) => (
                <tr key={entry.id} className="hover:bg-[var(--color-sage)]/20 transition-colors">
                  <td className="py-4 px-4 text-sm font-semibold text-[var(--color-forest)]">{entry.id}</td>
                  <td className="py-4 px-4 text-sm text-[var(--color-text-secondary)]">{entry.date}</td>
                  <td className="py-4 px-4 text-sm font-medium text-[var(--color-text)]">{entry.field}</td>
                  <td className="py-4 px-4 text-sm text-[var(--color-text)]">{entry.rotationName}</td>
                  <td className="py-4 px-4 text-sm text-[var(--color-text-secondary)]">
                    <div className="flex gap-1.5 flex-wrap">
                      {entry.crops.map((c) => (
                        <span key={c} className="badge badge-sage text-[11px] py-0.5 px-2">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-[var(--color-text)]">{entry.score}</td>
                  <td className="py-4 px-4 text-sm">
                    <span
                      className={`badge text-[11px] ${
                        entry.status === "Implemented"
                          ? "badge-forest"
                          : entry.status === "Under Review"
                          ? "badge-earth"
                          : "badge-sage"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

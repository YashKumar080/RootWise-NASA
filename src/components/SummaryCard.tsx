// src/components/SummaryCard.tsx

import React from "react";

interface Props {
  title: string;
  value: string | number;
  unit?: string;
  label?: string; // optional small label, e.g., DEMO
}

export const SummaryCard: React.FC<Props> = ({ title, value, unit, label }) => (
  <div className="clay-card p-5 flex flex-col justify-between">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs uppercase font-semibold tracking-wider text-[var(--color-text-secondary)]">{title}</span>
      {label && <span className="badge badge-earth text-[10px] py-0.5 px-2">{label}</span>}
    </div>
    <div className="text-2xl font-bold text-[var(--color-text)] flex items-baseline gap-1">
      {value}
      {unit && <span className="text-sm font-medium text-[var(--color-text-secondary)]">{unit}</span>}
    </div>
  </div>
);

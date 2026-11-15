// src/components/Overview.tsx

import React from "react";
import { Header } from "./Header";

export const Overview: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="min-h-screen flex flex-col bg-[var(--color-ivory)]">
    <Header />
    <main className="flex-1 max-w-[1000px] w-full mx-auto p-6 md:p-12 animate-fade-in">
      <div className="clay-card p-8 md:p-12 text-center max-w-[700px] mx-auto">
        <span className="badge badge-forest text-xs uppercase tracking-wider mb-4 inline-block">Decision Support Platform</span>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--color-text)]">Welcome to ROOTWISE</h2>
        <p className="mb-8 text-base text-[var(--color-text-secondary)] leading-relaxed">
          A climate-adaptive crop rotation intelligence tool designed for commercial and progressive farmers.
          Enter field telemetry, select candidate crops, and evaluate 3 optimized, agronomically-grounded rotation options.
        </p>
        <button
          className="btn-primary text-base !py-3 !px-8"
          onClick={onNext}
        >
          Begin Rotation Planning →
        </button>
      </div>
    </main>
  </div>
);

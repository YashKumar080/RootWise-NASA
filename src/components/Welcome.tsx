// src/components/Welcome.tsx — Premium ROOTWISE Landing Page

import React from "react";
import { Header } from "./Header";

interface WelcomeProps {
  onNext: () => void;
  onAuthClick?: () => void;
  user?: any;
  onSignOut?: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onNext, onAuthClick, user, onSignOut }) => (
  <div className="min-h-screen bg-[var(--color-ivory)] flex flex-col">
    <Header
      onNavigate={() => onNext()}
      onAuthClick={onAuthClick}
      user={user}
      onSignOut={onSignOut}
    />

    {/* ─── Hero ─── */}
    <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left — Copy */}
        <div className="animate-fade-in">
          <span className="badge badge-forest text-xs uppercase tracking-wider mb-4 inline-block">
            Climate-Adaptive Agriculture
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.1] tracking-tight text-[var(--color-text)] mb-6">
            Plan smarter rotations.{" "}
            <span className="text-[var(--color-forest)]">Build healthier soil.</span>
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-8 max-w-lg">
            Make informed crop decisions with soil, water and climate intelligence.
            ROOTWISE evaluates rotation sequences against your field conditions and farming priorities.
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <button onClick={onNext} className="btn-primary text-base !py-3.5 !px-8">
              Start Planning →
            </button>
            <a href="#features" className="btn-secondary text-base !py-3.5 !px-8">
              Explore the Platform
            </a>
          </div>
          <div className="flex flex-wrap gap-3">
            {["Soil-aware planning", "Water intelligence", "Multi-season decisions"].map((t) => (
              <span key={t} className="badge badge-sage text-xs">{t}</span>
            ))}
          </div>
        </div>

        {/* Right — Dashboard Preview */}
        <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="clay-card p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base text-[var(--color-text)]">Rotation Preview</h3>
              <span className="badge badge-earth text-[10px] uppercase">Illustrative Example</span>
            </div>
            <div className="space-y-3">
              {[
                { season: "Season 01", crop: "Wheat", family: "Poaceae", color: "var(--color-forest)" },
                { season: "Season 02", crop: "Soybean", family: "Fabaceae", color: "var(--color-leaf)" },
                { season: "Season 03", crop: "Barley", family: "Poaceae", color: "var(--color-earth)" },
              ].map((item) => (
                <div key={item.season} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)]">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}15` }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 20h10" /><path d="M10 20c5.5-2.5 8-8 8-14a1 1 0 0 0-1.5-.87C14 7 10 8 7 8a1 1 0 0 0-1 1c0 6 3 11.5 4 11" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--color-text)]">{item.season}</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">{item.crop} · {item.family}</div>
                  </div>
                  <svg className="w-5 h-5 text-[var(--color-leaf)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] grid grid-cols-3 gap-3">
              {[
                { label: "Soil Score", value: "8.2", sub: "/10" },
                { label: "Water Eff.", value: "Low", sub: "demand" },
                { label: "Risk Level", value: "Low", sub: "" },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <div className="text-xs text-[var(--color-text-secondary)] mb-1">{m.label}</div>
                  <div className="text-lg font-bold text-[var(--color-forest)]">
                    {m.value}<span className="text-xs font-normal text-[var(--color-text-secondary)]">{m.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ─── Features ─── */}
    <section id="features" className="border-t border-[var(--color-border)] bg-white py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14">
          <span className="badge badge-forest text-xs uppercase tracking-wider mb-3 inline-block">Capabilities</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
            Everything you need for rotation planning
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
            ROOTWISE combines agronomic logic with environmental awareness to help you make data-informed decisions.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "🔄", title: "Multi-Season Planning", desc: "Evaluate three-season rotation sequences that balance soil recovery, income and water use." },
            { icon: "🌱", title: "Soil Compatibility", desc: "Match crops to your soil type, pH and organic matter for better yield outcomes." },
            { icon: "🌧️", title: "Climate Awareness", desc: "Consider precipitation and temperature patterns when evaluating crop suitability." },
            { icon: "💧", title: "Water-Budget Analysis", desc: "Compare water demands across rotation candidates and identify conservation opportunities." },
            { icon: "📊", title: "Explainable Scores", desc: "Understand exactly why each rotation plan scored the way it did — no black boxes." },
            { icon: "⚠️", title: "Risk Analysis", desc: "Identify family-repetition risks, seasonal gaps and compatibility concerns before planting." },
          ].map((f) => (
            <div key={f.title} className="clay-card p-6 flex flex-col">
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ─── How It Works ─── */}
    <section id="how-it-works" className="py-20 border-t border-[var(--color-border)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14">
          <span className="badge badge-forest text-xs uppercase tracking-wider mb-3 inline-block">Process</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
            Three steps to a better rotation
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Understand your field", desc: "Enter soil characteristics, coordinates and environmental conditions for your farm." },
            { step: "02", title: "Evaluate crop options", desc: "Select candidate crops and set priorities for water, soil health and income." },
            { step: "03", title: "Plan your seasons", desc: "Compare three agronomically-grounded rotation plans with full score breakdowns." },
          ].map((s) => (
            <div key={s.step} className="clay-card-flat p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-forest)] text-white flex items-center justify-center text-lg font-bold mx-auto mb-5">
                {s.step}
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">{s.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ─── Product Preview ─── */}
    <section id="product" className="py-20 bg-white border-t border-[var(--color-border)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14">
          <span className="badge badge-forest text-xs uppercase tracking-wider mb-3 inline-block">Platform Preview</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
            Designed for clarity and confidence
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
            Every recommendation comes with transparent scoring and actionable insights.
          </p>
        </div>

        <div className="clay-card p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-5">Rotation Timeline</h3>
              <div className="space-y-4">
                {[
                  { season: "Kharif 2025", crop: "Soybean", status: "Completed", statusColor: "badge-forest" },
                  { season: "Rabi 2025-26", crop: "Wheat", status: "Active", statusColor: "badge-lime" },
                  { season: "Kharif 2026", crop: "Cotton", status: "Planned", statusColor: "badge-earth" },
                ].map((item) => (
                  <div key={item.season} className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-ivory)]">
                    <div className="w-1 h-12 rounded-full bg-[var(--color-forest)]" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--color-text)]">{item.season}</span>
                        <span className={`badge ${item.statusColor} text-[10px]`}>{item.status}</span>
                      </div>
                      <span className="text-xs text-[var(--color-text-secondary)]">{item.crop}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-3 italic">Illustrative preview — not live data</p>
            </div>

            {/* Risk Overview */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-5">Risk Overview</h3>
              <div className="space-y-4">
                {[
                  { label: "Soil Compatibility", value: 85, color: "var(--color-forest)" },
                  { label: "Water Risk", value: 30, color: "var(--color-leaf)" },
                  { label: "Family Repetition", value: 15, color: "var(--color-lime)" },
                  { label: "Seasonal Fit", value: 92, color: "var(--color-forest)" },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-[var(--color-text)]">{r.label}</span>
                      <span className="text-sm font-semibold text-[var(--color-text)]">{r.value}%</span>
                    </div>
                    <div className="metric-bar">
                      <div className="metric-bar-fill" style={{ width: `${r.value}%`, background: r.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-3 italic">Illustrative preview — not live data</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ─── Final CTA ─── */}
    <section className="py-20 border-t border-[var(--color-border)]">
      <div className="max-w-[600px] mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
          Ready to plan your next rotation?
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-8">
          Don't just choose your next crop. Choose what your soil needs next.
        </p>
        <button onClick={onNext} className="btn-primary text-base !py-3.5 !px-10">
          Start Planning →
        </button>
      </div>
    </section>

    {/* ─── Footer ─── */}
    <footer className="border-t border-[var(--color-border)] bg-white py-10">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[var(--color-forest)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 20h10" /><path d="M10 20c5.5-2.5 8-8 8-14a1 1 0 0 0-1.5-.87C14 7 10 8 7 8a1 1 0 0 0-1 1c0 6 3 11.5 4 11" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[var(--color-text)]">ROOTWISE</span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Climate-adaptive crop rotation intelligence. Demo application.
          </p>
          <div className="flex gap-4 text-sm text-[var(--color-text-secondary)]">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
);

// src/components/screens/HelpScreen.tsx

import React, { useState } from "react";

const faqs = [
  {
    q: "How does ROOTWISE score crop rotation suitability?",
    a: "ROOTWISE evaluates crop candidate combinations using a multi-factor agronomic engine. It weighs soil compatibility, water consumption, economic stability, and family repetition penalties against your customized farmer priority weights.",
  },
  {
    q: "Why is crop-family diversity critical in rotation design?",
    a: "Planting crops from the same family (e.g. Poaceae such as Wheat and Corn) consecutively depletes identical soil nutrient layers and creates persistent reservoirs for specialized soil-borne pests and pathogenic fungi.",
  },
  {
    q: "What do the DEMO tags signify across environmental cards?",
    a: "DEMO tags indicate modeled or synthetic baseline estimates (precipitation, satellite topsoil moisture, temperature ranges) used to demonstrate decision support prior to linking on-site IoT probes.",
  },
  {
    q: "Can I adjust individual priority weightings dynamically?",
    a: "Yes. In the Rotation Planner tab, you can redistribute priorities among Water Conservation, Soil Health, and Income Potential. The engine dynamically normalizes the sum to 100%.",
  },
];

export const HelpScreen: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="max-w-[850px] mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Agronomic Knowledge & Help Center</h2>
        <p className="text-[var(--color-text-secondary)]">
          Guidelines on climate-adaptive rotations, scoring methodology, and system operations.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="clay-card p-5">
          <div className="text-2xl mb-2">🌿</div>
          <h4 className="text-sm font-semibold text-[var(--color-text)] mb-1">Rotational Principles</h4>
          <p className="text-xs text-[var(--color-text-secondary)]">Nitrogen fixation, mycorrhizal health, and disease break crops.</p>
        </div>
        <div className="clay-card p-5">
          <div className="text-2xl mb-2">💧</div>
          <h4 className="text-sm font-semibold text-[var(--color-text)] mb-1">Water Budgeting</h4>
          <p className="text-xs text-[var(--color-text-secondary)]">Matching crop water demand with monsoon replenishment windows.</p>
        </div>
        <div className="clay-card p-5">
          <div className="text-2xl mb-2">📊</div>
          <h4 className="text-sm font-semibold text-[var(--color-text)] mb-1">Scoring Methodology</h4>
          <p className="text-xs text-[var(--color-text-secondary)]">Understanding total scoring metrics and penalty allocations.</p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="clay-card p-6 mb-8">
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-[var(--color-border)] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center p-4 bg-[var(--color-ivory)] hover:bg-[var(--color-sage)]/30 transition-colors text-left"
              >
                <span className="text-sm font-semibold text-[var(--color-text)]">{faq.q}</span>
                <span className="text-lg text-[var(--color-text-secondary)] ml-3">
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <div className="p-4 bg-white text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Agronomic Support Note */}
      <div className="p-5 rounded-xl bg-[var(--color-forest)] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold mb-1">Require personalized agronomic advice?</div>
          <div className="text-xs text-[var(--color-sage)]">Connect your soil test reports with our agronomist advisory panel.</div>
        </div>
        <button className="btn-secondary !py-2 !px-4 text-xs whitespace-nowrap">
          Contact Advisory Desk
        </button>
      </div>
    </div>
  );
};

// src/components/Header.tsx — Premium ROOTWISE navigation with Supabase Auth

import React from "react";
import type { User } from "@supabase/supabase-js";

interface Props {
  onNavigate?: (screen: string) => void;
  onAuthClick?: () => void;
  onSignOut?: () => void;
  user?: User | null;
  isApp?: boolean;
}

export const Header: React.FC<Props> = ({ onNavigate, onAuthClick, onSignOut, user, isApp }) => {
  if (isApp) return null; // App shell has its own top bar

  return (
    <header className="w-full border-b border-[var(--color-border)] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate?.("landing")}>
          <div className="w-8 h-8 rounded-lg bg-[var(--color-forest)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 20h10" /><path d="M10 20c5.5-2.5 8-8 8-14a1 1 0 0 0-1.5-.87C14 7 10 8 7 8a1 1 0 0 0-1 1c0 6 3 11.5 4 11" />
            </svg>
          </div>
          <span className="text-lg font-bold text-[var(--color-text)]" style={{ letterSpacing: '-0.3px' }}>
            ROOTWISE
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {["Product", "How it works", "Features", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-forest)] transition-colors rounded-lg hover:bg-[var(--color-sage)]/50"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--color-text-secondary)] hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={() => onNavigate?.("app")}
                className="btn-primary text-sm !py-2 !px-4"
              >
                Go to Dashboard
              </button>
              <button
                onClick={onSignOut}
                className="btn-ghost text-xs text-[var(--color-text-secondary)] hover:text-red-600"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onAuthClick}
                className="btn-ghost text-sm font-semibold text-[var(--color-forest)] hover:bg-[var(--color-sage)]/40 px-3 py-1.5 rounded-lg"
              >
                Sign in
              </button>
              <button
                onClick={() => {
                  if (onAuthClick) onAuthClick();
                  else onNavigate?.("app");
                }}
                className="btn-primary text-sm !py-2 !px-5"
              >
                Start Planning
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

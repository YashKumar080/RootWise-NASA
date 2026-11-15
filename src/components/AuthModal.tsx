// src/components/AuthModal.tsx — Supabase Authentication Dialog

import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim() || "Farmer",
              preferred_unit_system: "metric",
              preferred_language: "en",
            },
          },
        });

        if (error) throw error;
        setSuccessMessage("Account created successfully! Signing you in...");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
        setSuccessMessage("Signed in successfully!");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick demo login helper for hackathon judges / testing
  const handleDemoSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Try to sign in with demo credentials
      const demoEmail = "demo.farmer@rootwise.app";
      const demoPass = "RootwiseFarmer2026!";
      
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPass,
      });

      if (signInErr) {
        // If demo user does not exist yet, create it
        const { error: signUpErr } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPass,
          options: {
            data: {
              full_name: "Demo Farmer",
              preferred_unit_system: "metric",
              preferred_language: "en",
            },
          },
        });
        if (signUpErr) throw signUpErr;
      }

      setSuccessMessage("Signed in as Demo Farmer!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Demo sign in failed";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="clay-card p-6 md:p-8 max-w-md w-full bg-white relative shadow-2xl border border-[var(--color-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] p-1 rounded-lg"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-forest)] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 20h10" /><path d="M10 20c5.5-2.5 8-8 8-14a1 1 0 0 0-1.5-.87C14 7 10 8 7 8a1 1 0 0 0-1 1c0 6 3 11.5 4 11" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--color-text)]">
              {isSignUp ? "Create ROOTWISE Account" : "Sign In to ROOTWISE"}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {isSignUp ? "Join the ecological rotation platform" : "Access your farms, plans & telemetry"}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maya Patel"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-ivory)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-forest)]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-ivory)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-forest)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-ivory)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-forest)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-center justify-center py-2.5 text-sm font-semibold !rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Please wait..." : isSignUp ? "Create Free Account" : "Sign In"}
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-[var(--color-leaf)] text-[var(--color-forest)] font-semibold text-xs hover:bg-[var(--color-sage)]/30 transition-colors flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>One-Click Hackathon Demo Login</span>
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
            }}
            className="text-xs text-[var(--color-forest)] hover:underline font-medium"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account yet? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};

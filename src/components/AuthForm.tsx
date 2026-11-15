// src/components/AuthForm.tsx – Minimal email/password auth UI
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface AuthFormProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

type Mode = "login" | "signup" | "forgot";

export const AuthForm: React.FC<AuthFormProps> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.session?.user) onSuccess(data.session.user);
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // signUp may require email confirmation; treat successful response as logged‑in
        if (data.session?.user) onSuccess(data.session.user);
        else onSuccess(data.user!);
      } else if (mode === "forgot") {
        // Request password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          // Redirect back to the app after user follows the link
          redirectTo: `${window.location.origin}`,
        });
        if (error) throw error;
        setInfoMessage("Password reset email sent. Check your inbox.");
      }
    } catch (e: any) {
      setError(e.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
      // On success Supabase redirects; no further handling needed here.
    } catch (e: any) {
      setError(e.message ?? "Google sign‑in failed");
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {mode === "login"
            ? "Sign In"
            : mode === "signup"
            ? "Create Account"
            : "Forgot Password"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="input w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {mode !== "forgot" && (
            <input
              type="password"
              placeholder="Password"
              className="input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {infoMessage && <p className="text-sm text-green-600">{infoMessage}</p>}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || oauthLoading}
          >
            {loading
              ? "Processing…"
              : mode === "login"
              ? "Sign In"
              : mode === "signup"
              ? "Sign Up"
              : "Send Reset Email"}
          </button>
        </form>
        {/* Google OAuth button – shown for login and signup modes */}
        {(mode === "login" || mode === "signup") && (
          <div className="mt-4 text-center">
            <button
              type="button"
              className="btn-outline w-full flex items-center justify-center space-x-2"
              onClick={handleGoogleSignIn}
              disabled={oauthLoading || loading}
            >
              {oauthLoading ? (
                <span>Redirecting…</span>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-5 w-5"
                  >
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.68 1.22 9.16 3.21l6.84-6.84C37.02 2.57 30.87 0 24 0 14.62 0 6.51 5.13 2.45 12.77l7.96 6.19C12.81 13.24 18.02 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.1 24.5c0-1.51-.13-2.96-.36-4.37H24v8.28h12.45c-.54 2.94-2.13 5.44-4.55 7.13l7.04 5.48c4.1-3.79 6.46-9.38 6.46-16.52z" />
                    <path fill="#FBBC05" d="M14.41 28.96c-.58-1.71-.91-3.53-.91-5.46s.33-3.75.91-5.46L6.45 11.85C4.56 15.28 3.5 19.06 3.5 24c0 4.94 1.06 8.72 2.95 12.15l7.96-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.92-2.15 15.9-5.85l-7.04-5.48c-2 1.36-4.55 2.16-8.86 2.16-6.68 0-12.34-4.5-14.37-10.54l-7.96 6.19C6.51 42.87 14.62 48 24 48z" />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        )}
        <div className="mt-4 text-center text-sm">
          {mode === "login" ? (
            <span>
              No account?{' '}
              <button
                type="button"
                className="text-forest underline"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </span>
          ) : mode === "signup" ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                className="text-forest underline"
                onClick={() => setMode("login")}
              >
                Sign in
              </button>
            </span>
          ) : (
            <span>
              Remembered your password?{' '}
              <button
                type="button"
                className="text-forest underline"
                onClick={() => setMode("login")}
              >
                Sign in
              </button>
            </span>
          )}
        </div>
        {mode === "login" && (
          <div className="mt-2 text-center text-sm">
            <button
              type="button"
              className="text-forest underline"
              onClick={() => setMode("forgot")}
            >
              Forgot Password?
            </button>
          </div>
        )}
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >✕</button>
      </div>
    </div>
  );
};

// src/components/screens/PasswordRecoveryScreen.tsx – Password reset UI
import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Props {
  // Called when password reset completes – can show login modal or navigate.
  onSuccess: () => void;
  onCancel: () => void;
}

export const PasswordRecoveryScreen: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // Supabase requires a valid session; the PASSWORD_RECOVERY event provides it via auth client.
      const { error } = await supabase.auth.updateUser({ password: newPassword } as any);
      if (error) throw error;
      setInfo("Password updated successfully. You may now sign in.");
      // Notify parent to show login flow.
      onSuccess();
    } catch (e: any) {
      setError(e.message ?? "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4 text-center">Set New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            className="input w-full"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            className="input w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-green-600">{info}</p>}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
        <div className="mt-4 flex justify-between text-sm">
          <button
            type="button"
            className="text-forest underline"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-500"
          onClick={onCancel}
        >✕</button>
      </div>
    </div>
  );
};
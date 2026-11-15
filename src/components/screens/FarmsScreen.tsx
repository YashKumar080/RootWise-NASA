// src/components/screens/FarmsScreen.tsx – Connected with Supabase farm service

import React, { useState, useEffect } from "react";
import type { FarmLocation } from "../../types/models";
import {
  getFarms,
  createFarm,
  updateFarm,
  deleteFarm,
  type FarmRow as Farm,
} from "../../services/farmService";

interface Props {
  location: FarmLocation;
  onUpdate: (loc: FarmLocation) => void;
}

export const FarmsScreen: React.FC<Props> = ({ location, onUpdate }) => {
  // UI state for editing the active farm location (preserved behavior)
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(location);

  // State for managing list of farms from Supabase
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state for creating a new farm
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", country_code: "IN" });

  // UI state for editing an existing farm record
  const [editFarmId, setEditFarmId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", country_code: "" });

  // Load farms on component mount and after any mutation
  const loadFarms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFarms();
      setFarms(data);
    } catch (e: any) {
      setError(e.message ?? "Failed to load farms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  // Handlers for CRUD actions
  const handleCreate = async () => {
    try {
      await createFarm({
        name: createForm.name,
        country_code: createForm.country_code,
        admin_area_level_1: null,
        admin_area_level_2: null,
        locality: null,
        postal_code: null,
        total_area_hectares: null,
        is_active: true,
      });
      setCreating(false);
      setCreateForm({ name: "", country_code: "IN" });
      await loadFarms();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateFarm(id, { name: editForm.name, country_code: editForm.country_code });
      setEditFarmId(null);
      await loadFarms();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this farm?")) return;
    try {
      await deleteFarm(id);
      await loadFarms();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveLocation = () => {
    onUpdate(form);
    setEditing(false);
  };

  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">My Farms</h2>
          <p className="text-[var(--color-text-secondary)]">Manage your farm locations and field information.</p>
        </div>
        <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm">
          {editing ? "Cancel" : "Edit Farm"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active farm (application‑level location) */}
        <div className="clay-card p-6 md:col-span-2 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="badge badge-lime text-[10px] mb-2 inline-block">Active Farm</span>
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                {location.fieldName || "Unnamed Farm"}
              </h3>
            </div>
            <div className="text-2xl">🌾</div>
          </div>
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Field Name
                </label>
                <input
                  value={form.fieldName}
                  onChange={(e) => setForm({ ...form, fieldName: e.target.value })}
                  className="input-field"
                  placeholder="e.g. North Plot"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    State
                  </label>
                  <input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="input-field"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    District
                  </label>
                  <input
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="input-field"
                    placeholder="District"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    Latitude
                  </label>
                  <input
                    value={form.latitude}
                    onChange={(e) =>
                      setForm({ ...form, latitude: e.target.value ? Number(e.target.value) : "" })
                    }
                    className="input-field"
                    placeholder="e.g. 21.15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    Longitude
                  </label>
                  <input
                    value={form.longitude}
                    onChange={(e) =>
                      setForm({ ...form, longitude: e.target.value ? Number(e.target.value) : "" })
                    }
                    className="input-field"
                    placeholder="e.g. 79.09"
                  />
                </div>
              </div>
              <button onClick={handleSaveLocation} className="btn-primary text-sm">
                Save Changes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "State", value: location.state || "—" },
                { label: "District", value: location.district || "—" },
                { label: "Latitude", value: location.latitude || "—" },
                { label: "Longitude", value: location.longitude || "—" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="p-3 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-border)]"
                >
                  <div className="text-xs text-[var(--color-text-secondary)] mb-0.5">{f.label}</div>
                  <div className="text-sm font-medium text-[var(--color-text)]">{String(f.value)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* List of farms from Supabase */}
        {loading ? (
          <div className="col-span-3 text-center">Loading farms…</div>
        ) : error ? (
          <div className="col-span-3 text-center text-red-500">{error}</div>
        ) : farms.length === 0 ? (
          <div className="col-span-3 text-center">No farms saved. Add one below.</div>
        ) : (
          farms.map((farm) => (
            <div key={farm.id} className="clay-card p-4">
              {editFarmId === farm.id ? (
                <div className="space-y-2">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="input-field"
                    placeholder="Farm name"
                  />
                  <input
                    value={editForm.country_code}
                    onChange={(e) => setEditForm({ ...editForm, country_code: e.target.value })}
                    className="input-field"
                    placeholder="Country code"
                  />
                  <button
                    onClick={() => handleUpdate(farm.id)}
                    className="btn-primary text-sm mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditFarmId(null)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold">{farm.name}</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">{farm.country_code}</p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => {
                        setEditFarmId(farm.id);
                        setEditForm({ name: farm.name, country_code: farm.country_code });
                      }}
                      className="btn-secondary text-xs"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(farm.id)} className="btn-danger text-xs">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Card for creating a new farm */}
        <div className="clay-card-flat p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-[var(--color-border)] cursor-pointer hover:border-[var(--color-leaf)] transition-colors min-h-[200px]">
          {creating ? (
            <div className="space-y-2 w-full">
              <input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="input-field"
                placeholder="Farm name"
              />
              <input
                value={createForm.country_code}
                onChange={(e) => setCreateForm({ ...createForm, country_code: e.target.value })}
                className="input-field"
                placeholder="Country code (2‑letter)"
              />
              <button onClick={handleCreate} className="btn-primary text-sm mr-2">
                Create
              </button>
              <button onClick={() => setCreating(false)} className="btn-secondary text-sm">
                Cancel
              </button>
            </div>
          ) : (
            <div onClick={() => setCreating(true)} className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-sage)] flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </div>
              <div className="text-sm font-semibold text-[var(--color-text)] mb-1">Add Another Farm</div>
              <div className="text-xs text-[var(--color-text-secondary)]">Create a new farm record</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

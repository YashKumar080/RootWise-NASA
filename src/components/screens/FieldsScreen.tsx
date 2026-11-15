// src/components/screens/FieldsScreen.tsx – Connected to Supabase field & soil services

import React, { useState, useEffect } from "react";
import type { FarmLocation, SoilCharacteristics } from "../../types/models";
import {
  getFarms,
} from "../../services/farmService";
import {
  getFields,
  createField,
  updateField,
  deleteField,
  type FieldRow as Field,
} from "../../services/fieldService";
import {
  getSoilSamples,
  createSoilSample,
  updateSoilSample,
  type SoilSampleRow as SoilSample,
} from "../../services/soilSampleService";

interface Props {
  location: FarmLocation;
  soil: SoilCharacteristics;
  onUpdateSoil: (soil: SoilCharacteristics) => void;
  // Callback to inform parent which field is selected (by its full record)
  onSelectField?: (field: Field) => void;
}



export const FieldsScreen: React.FC<Props> = ({ location, soil, onUpdateSoil, onSelectField }) => {
  // UI state for editing soil profile (unchanged from original)
  const [editingSoil, setEditingSoil] = useState(false);
  const [soilForm, setSoilForm] = useState(soil);

  // ---------- Farm / Field handling ----------
  const [farmId, setFarmId] = useState<string | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [fieldsError, setFieldsError] = useState<string | null>(null);

  // UI for creating a field
  const [creatingField, setCreatingField] = useState(false);
  // New field area input state
  const [newFieldArea, setNewFieldArea] = useState('');
  // Validation/error state for field creation
  const [fieldCreationError, setFieldCreationError] = useState<string | null>(null);

  const [newFieldName, setNewFieldName] = useState("");

  // Editing a specific field
  const [editFieldId, setEditFieldId] = useState<string | null>(null);
  const [editFieldName, setEditFieldName] = useState("");

  // Soil sample handling per field (latest sample only)
  const [soilSamples, setSoilSamples] = useState<Record<string, SoilSample | null>>({}); // key: fieldId
  const [samplesLoading, setSamplesLoading] = useState(false);
  const [_samplesError, setSamplesError] = useState<string | null>(null);

  // ---------- Load farm id based on current location ----------
  const loadFarmId = async () => {
    try {
      const farms = await getFarms();
      // Find farm matching the location's fieldName (used as farm name) – fallback to first
      const matched = farms.find((f) => f.name === location.fieldName) || farms[0];
      if (matched) setFarmId(matched.id);
      else setFarmId(null);
    } catch (e: any) {
      console.error(e);
      setFarmId(null);
    }
  };

  // ---------- Load fields for current farm ----------
  const loadFields = async (fid: string) => {
    setFieldsLoading(true);
    setFieldsError(null);
    try {
      const data = await getFields(fid);
      setFields(data);
    } catch (e: any) {
      setFieldsError(e.message ?? "Failed to load fields");
    } finally {
      setFieldsLoading(false);
    }
  };

  // ---------- Load latest soil sample for each field ----------
  const loadSoilSamples = async (fieldList: Field[]) => {
    if (fieldList.length === 0) return;
    setSamplesLoading(true);
    setSamplesError(null);
    const newMap: Record<string, SoilSample | null> = {};
    try {
      for (const f of fieldList) {
        const samples = await getSoilSamples(f.id);
        // Assuming the API returns them ordered by sample_date desc (index does), pick first
        newMap[f.id] = samples[0] ?? null;
      }
      setSoilSamples(newMap);
    } catch (e: any) {
      setSamplesError(e.message ?? "Failed to load soil samples");
    } finally {
      setSamplesLoading(false);
    }
  };

  // ---------- Effect chain ----------
  useEffect(() => {
    // First load farm id whenever location changes
    loadFarmId();
  }, [location]);

  useEffect(() => {
    if (farmId) {
      loadFields(farmId);
    }
  }, [farmId]);

  useEffect(() => {
    // After fields are loaded, fetch their latest soil samples
    if (fields.length) {
      loadSoilSamples(fields);
    } else {
      setSoilSamples({});
    }
  }, [fields]);

  // ---------- CRUD Handlers for fields ----------
  const handleCreateField = async () => {
    if (!farmId) return;
    // Validate inputs
    if (!newFieldName.trim()) {
      setFieldCreationError('Field name is required');
      return;
    }
    const areaNum = Number(newFieldArea);
    if (!newFieldArea || isNaN(areaNum) || areaNum <= 0) {
      setFieldCreationError('Area must be a positive number');
      return;
    }
    try {
      await createField(farmId, {
        name: newFieldName,
        latitude: null,
        longitude: null,
        area_hectares: areaNum,
        soil_texture_class: null,
        soil_classification_group: null,
        soil_classification_system: null,
        soil_classification_source: null,
        irrigation_infrastructure: null,
      });
      setCreatingField(false);
      setNewFieldName("");
      setNewFieldArea("");
      setFieldCreationError(null);
      await loadFields(farmId);
    } catch (e: any) {
      setFieldCreationError(e.message ?? 'Failed to create field');
    }
  };


  const handleUpdateField = async (id: string) => {
    try {
      await updateField(id, { name: editFieldName });
      setEditFieldId(null);
      if (farmId) await loadFields(farmId);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteField = async (id: string) => {
    if (!window.confirm("Delete this field?")) return;
    try {
      await deleteField(id);
      if (farmId) await loadFields(farmId);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // ---------- Soil sample handlers (create/update) ----------
  const handleCreateSample = async (fieldId: string) => {
    try {
      await createSoilSample(fieldId, {
        sample_date: new Date().toISOString().split("T")[0], // today
        depth_top_cm: 0.0,
        depth_bottom_cm: 15.0,
        sample_origin: "lab_certified",
      });
      // reload samples for that field
      const samples = await getSoilSamples(fieldId);
      setSoilSamples((prev) => ({ ...prev, [fieldId]: samples[0] ?? null }));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdateSample = async (fieldId: string, sampleId: string) => {
    try {
      await updateSoilSample(sampleId, { notes: "Updated via UI" });
      const samples = await getSoilSamples(fieldId);
      setSoilSamples((prev) => ({ ...prev, [fieldId]: samples[0] ?? null }));
    } catch (e: any) {
      alert(e.message);
    }
  };

  // ---------- Soil profile (original UI) ----------
  const handleSaveSoil = () => {
    onUpdateSoil(soilForm);
    setEditingSoil(false);
  };

  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Fields</h2>
          <p className="text-[var(--color-text-secondary)]">
            Soil profile and field details for <strong>{location.fieldName || "your farm"}</strong>.
          </p>
        </div>
        <button onClick={() => setEditingSoil(!editingSoil)} className="btn-secondary text-sm">
          {editingSoil ? "Cancel" : "Edit Soil Profile"}
        </button>
      </div>

      {/* Soil profile (unchanged) */}
      <div className="clay-card p-6 mb-6">
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-5">Soil Profile</h3>
        {editingSoil ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Soil Type */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Soil Type</label>
              <select
                value={soilForm.soilType}
                onChange={(e) => setSoilForm({ ...soilForm, soilType: e.target.value as any })}
                className="select-field"
              >
                <option value="">Select soil type</option>
                {(["red", "black", "sandy", "loamy", "clay"] as const).map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {/* pH */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">pH</label>
              <input
                value={soilForm.pH}
                onChange={(e) => setSoilForm({ ...soilForm, pH: e.target.value ? Number(e.target.value) : "" })}
                className="input-field"
                placeholder="e.g. 7.2"
              />
            </div>
            {/* Organic Carbon */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Organic Carbon (%)</label>
              <input
                value={soilForm.organicCarbon}
                onChange={(e) =>
                  setSoilForm({ ...soilForm, organicCarbon: e.target.value ? Number(e.target.value) : "" })
                }
                className="input-field"
                placeholder="e.g. 0.68"
              />
            </div>
            {/* Nitrogen */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Nitrogen (kg/ha)</label>
              <input
                value={soilForm.nitrogen}
                onChange={(e) => setSoilForm({ ...soilForm, nitrogen: e.target.value ? Number(e.target.value) : "" })}
                className="input-field"
                placeholder="Optional"
              />
            </div>
            {/* Phosphorus */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Phosphorus (kg/ha)</label>
              <input
                value={soilForm.phosphorus}
                onChange={(e) => setSoilForm({ ...soilForm, phosphorus: e.target.value ? Number(e.target.value) : "" })}
                className="input-field"
                placeholder="Optional"
              />
            </div>
            {/* Potassium */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Potassium (kg/ha)</label>
              <input
                value={soilForm.potassium}
                onChange={(e) => setSoilForm({ ...soilForm, potassium: e.target.value ? Number(e.target.value) : "" })}
                className="input-field"
                placeholder="Optional"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <button onClick={handleSaveSoil} className="btn-primary text-sm">
                Save Soil Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Soil Type", value: soil.soilType || "—" },
              { label: "pH", value: soil.pH || "—" },
              { label: "Organic C", value: soil.organicCarbon ? `${soil.organicCarbon}%` : "—" },
              { label: "Nitrogen", value: soil.nitrogen ? `${soil.nitrogen}` : "—" },
              { label: "Phosphorus", value: soil.phosphorus ? `${soil.phosphorus}` : "—" },
              { label: "Potassium", value: soil.potassium ? `${soil.potassium}` : "—" },
            ].map((f) => (
              <div
                key={f.label}
                className="p-4 rounded-xl bg-[var(--color-ivary)] border border-[var(--color-border)] text-center"
              >
                <div className="text-xs text-[var(--color-text-secondary)] mb-1">{f.label}</div>
                <div className="text-lg font-bold text-[var(--color-text)] capitalize">{String(f.value)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Fields List ---------- */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-[var(--color-text)]">Fields for this Farm</h3>
        {fieldsLoading ? (
          <div className="text-center">Loading fields…</div>
        ) : fieldsError ? (
          <div className="text-center text-red-500">{fieldsError}</div>
        ) : fields.length === 0 ? (
          <div className="text-center">No fields found. Add one below.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fields.map((fld) => (
              <div key={fld.id} className="clay-card p-4" onClick={() => onSelectField?.(fld)}>
                {editFieldId === fld.id ? (
                  <div className="space-y-2">
                    <input
                      value={editFieldName}
                      onChange={(e) => setEditFieldName(e.target.value)}
                      className="input-field"
                      placeholder="Field name"
                    />
                    <button
                      onClick={() => handleUpdateField(fld.id)}
                      className="btn-primary text-sm mr-2"
                    >
                      Save
                    </button>
                    <button onClick={() => setEditFieldId(null)} className="btn-secondary text-sm">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold">{fld.name}</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">Area: {fld.area_hectares ?? "—"} ha</p>
                    {/* Latest soil sample */}
                    {samplesLoading ? (
                      <p className="text-xs text-[var(--color-text-secondary)]">Loading sample…</p>
                    ) : (
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Latest Sample: {soilSamples[fld.id]?.sample_date ?? "None"}
                      </p>
                    )}
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => {
                          setEditFieldId(fld.id);
                          setEditFieldName(fld.name);
                        }}
                        className="btn-secondary text-xs"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteField(fld.id)} className="btn-danger text-xs">
                        Delete
                      </button>
                      {/* Soil sample actions */}
                      <button
                        onClick={() => {
                          const existing = soilSamples[fld.id];
                          if (existing) {
                            handleUpdateSample(fld.id, existing.id);
                          } else {
                            handleCreateSample(fld.id);
                          }
                        }}
                        className="btn-primary text-xs"
                      >
                        {soilSamples[fld.id] ? "Update Sample" : "Add Sample"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Add Field Card ---------- */}
      <div className="clay-card-flat p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-[var(--color-border)] cursor-pointer hover:border-[var(--color-leaf)] transition-colors min-h-[150px]">
        {creatingField ? (
          <div className="space-y-2 w-full">
            <input
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              className="input-field"
              placeholder="Field name"
            />
            <input
              value={newFieldArea}
              onChange={(e) => setNewFieldArea(e.target.value)}
              className="input-field"
              placeholder="Area (ha)"
              type="number"
              min="0.01"
              step="0.01"
            />
            {fieldCreationError && (
              <p className="text-sm text-red-600">{fieldCreationError}</p>
            )}
            <button onClick={handleCreateField} className="btn-primary text-sm mr-2">
              Create
            </button>
            <button
              onClick={() => {
                setCreatingField(false);
                setFieldCreationError(null);
                setNewFieldName("");
                setNewFieldArea("");
              }}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div onClick={() => setCreatingField(true)} className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[var(--color-sage)] flex items-center justify-center mb-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-forest)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-[var(--color-text)] mb-1">Add New Field</div>
            <div className="text-xs text-[var(--color-text-secondary)]">Create a field record</div>
          </div>
        )}
      </div>

      {/* ---------- Crop history (unchanged demo) ---------- */}
      <div className="clay-card-flat p-6 mb-6">
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Crop History</h3>
        <div className="space-y-3">
          {[
            { season: "Kharif 2025", crop: "Soybean", family: "Fabaceae", result: "Good yield" },
            { season: "Rabi 2024-25", crop: "Wheat", family: "Poaceae", result: "Average yield" },
            { season: "Kharif 2024", crop: "Cotton", family: "Malvaceae", result: "Below average" },
          ].map((h) => (
            <div key={h.season} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-ivary)] border border-[var(--color-border)]">
              <div className="w-1 h-10 rounded-full bg-[var(--color-leaf)]" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--color-text)]">
                  {h.crop} <span className="text-[var(--color-text-secondary)]">({h.family})</span>
                </div>
                <div className="text-xs text-[var(--color-text-secondary)]">{h.season}</div>
              </div>
              <span className="badge badge-sage text-[10px]">{h.result}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[var(--color-text-secondary)] mt-3 italic">Demo crop history</p>
      </div>

      {/* ---------- Water information (unchanged demo) ---------- */}
      <div className="clay-card-flat p-6">
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Water Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Irrigation", value: "Canal + Well" },
            { label: "Water Table", value: "~12m" },
            { label: "Annual Rain", value: "~950mm" },
            { label: "Drainage", value: "Moderate" },
          ].map((w) => (
            <div key={w.label} className="p-4 rounded-xl bg-[var(--color-ivary)] border border-[var(--color-border)] text-center">
              <div className="text-xs text-[var(--color-text-secondary)] mb-1">{w.label}</div>
              <div className="text-sm font-semibold text-[var(--color-text)]">{w.value}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[var(--color-text-secondary)] mt-3 italic">Demo water data</p>
      </div>
    </div>
  );
};

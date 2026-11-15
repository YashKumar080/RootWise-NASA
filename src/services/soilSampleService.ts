// src/services/soilSampleService.ts – Supabase CRUD for soil samples

import { supabase } from "../lib/supabaseClient";

/**
 * Type representing a soil sample record as stored in the database.
 */
export interface SoilSample {
  id: string; // UUID primary key
  field_id: string; // FK to fields (set by caller)
  sample_date: string; // ISO date (YYYY-MM-DD)
  depth_top_cm: number;
  depth_bottom_cm: number;
  sample_origin: string;
  soil_texture_class?: string | null;
  ph?: number | null;
  organic_carbon_pct?: number | null;
  organic_matter_method?: string | null;
  nitrogen_value?: number | null;
  nitrogen_unit?: string | null;
  phosphorus_value?: number | null;
  phosphorus_unit?: string | null;
  extraction_method_p?: string | null;
  potassium_value?: number | null;
  potassium_unit?: string | null;
  extraction_method_k?: string | null;
  electrical_conductivity_ds_m?: number | null;
  laboratory_name?: string | null;
  laboratory_sample_id?: string | null;
  notes?: string | null;
  created_at: string; // timestamp with tz
  updated_at: string; // timestamp with tz
}

export type SoilSampleRow = SoilSample;
export type SoilSampleInsert = Omit<
  SoilSample,
  "id" | "field_id" | "created_at" | "updated_at"
>;

/** Retrieve all soil samples belonging to the specified field. */
export async function getSoilSamples(fieldId: string): Promise<SoilSampleRow[]> {
  const { data, error } = await supabase
    .from("soil_samples")
    .select("*")
    .eq("field_id", fieldId);
  if (error) {
    throw new Error(`Failed to fetch soil samples for field ${fieldId}: ${error.message}`);
  }
  return data as unknown as SoilSampleRow[];
}

/** Create a new soil sample under an existing field. */
export async function createSoilSample(
  fieldId: string,
  sampleData: SoilSampleInsert
): Promise<SoilSampleRow> {
  const payload: SoilSampleInsert & { field_id: string } = {
    ...sampleData,
    field_id: fieldId,
  };
  const { data, error } = await supabase
    .from("soil_samples")
    .insert([payload])
    .select();
  if (error) {
    throw new Error(`Failed to create soil sample: ${error.message}`);
  }
  return (data as SoilSampleRow[])[0];
}

/** Update an existing soil sample. */
export async function updateSoilSample(
  sampleId: string,
  updates: Partial<SoilSampleInsert>
): Promise<SoilSampleRow> {
  const { data, error } = await supabase
    .from("soil_samples")
    .update(updates)
    .eq("id", sampleId)
    .select();
  if (error) {
    throw new Error(`Failed to update soil sample ${sampleId}: ${error.message}`);
  }
  return (data as SoilSampleRow[])[0];
}

/** Delete a soil sample by its UUID. RLS will enforce owner permissions. */
export async function deleteSoilSample(sampleId: string): Promise<void> {
  const { error } = await supabase.from("soil_samples").delete().eq("id", sampleId);
  if (error) {
    throw new Error(`Failed to delete soil sample ${sampleId}: ${error.message}`);
  }
}

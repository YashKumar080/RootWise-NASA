// src/services/fieldService.ts – Supabase CRUD for fields

import { supabase } from "../lib/supabaseClient";

/**
 * Type representing a field record as stored in the database.
 */
export interface Field {
  id: string; // UUID primary key
  farm_id: string; // FK to farms (set by caller)
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  area_hectares: number;
  soil_texture_class?: string | null;
  soil_classification_group?: string | null;
  soil_classification_system?: string | null;
  soil_classification_source?: string | null;
  irrigation_infrastructure?: string | null;
  created_at: string; // timestamp with tz
  updated_at: string; // timestamp with tz
}

// Types for Supabase query builder – we keep them simple, matching the table shape.
export type FieldRow = Field;
export type FieldInsert = Omit<Field, "id" | "farm_id" | "created_at" | "updated_at">;

/** Retrieve all fields belonging to the specified farm. */
export async function getFields(farmId: string): Promise<FieldRow[]> {
  const { data, error } = await supabase
    .from("fields")
    .select("*")
    .eq("farm_id", farmId);
  if (error) {
    throw new Error(`Failed to fetch fields for farm ${farmId}: ${error.message}`);
  }
  return data as unknown as FieldRow[];
}

/** Create a new field under an existing farm. */
export async function createField(
  farmId: string,
  fieldData: FieldInsert
): Promise<FieldRow> {
  const payload: FieldInsert & { farm_id: string } = { ...fieldData, farm_id: farmId };
  const { data, error } = await supabase
    .from("fields")
    .insert([payload])
    .select();
  if (error) {
    throw new Error(`Failed to create field: ${error.message}`);
  }
  // The insert returns an array with a single record.
  return (data as FieldRow[])[0];
}

/** Update an existing field. */
export async function updateField(
  fieldId: string,
  updates: Partial<FieldInsert>
): Promise<FieldRow> {
  const { data, error } = await supabase
    .from("fields")
    .update(updates)
    .eq("id", fieldId)
    .select();
  if (error) {
    throw new Error(`Failed to update field ${fieldId}: ${error.message}`);
  }
  return (data as FieldRow[])[0];
}

/** Delete a field by its UUID. RLS will enforce owner permissions. */
export async function deleteField(fieldId: string): Promise<void> {
  const { error } = await supabase.from("fields").delete().eq("id", fieldId);
  if (error) {
    throw new Error(`Failed to delete field ${fieldId}: ${error.message}`);
  }
}

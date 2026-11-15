// src/services/cropHistoryService.ts – Supabase CRUD for crop_history

import { supabase } from "../lib/supabaseClient";

/**
 * Type representing a crop history record as stored in the database.
 */
export interface CropHistory {
  id: string; // UUID primary key
  field_id: string; // FK to fields.id
  crop_species_id: string | null; // optional reference to crop_species table
  crop_name_override: string | null;
  crop_family: string;
  season_identifier: string;
  planting_date: string | null; // ISO date string
  harvest_date: string | null; // ISO date string
  yield_metric_tons_ha: number | null;
  notes: string | null;
  created_at: string; // timestamp with tz
}

// Types for Supabase query builder – match the table shape.
export type CropHistoryRow = CropHistory;
export type CropHistoryInsert = Omit<CropHistory, "id" | "created_at" | "field_id">;

/** Retrieve all crop‑history records belonging to a specific field. */
export async function getCropHistory(fieldId: string): Promise<CropHistoryRow[]> {
  const { data, error } = await supabase
    .from("crop_history")
    .select("*")
    .eq("field_id", fieldId);
  if (error) {
    throw new Error(`Failed to fetch crop history for field ${fieldId}: ${error.message}`);
  }
  return data as unknown as CropHistoryRow[];
}

/** Create a new crop‑history entry for a field. */
export async function createCropHistory(
  fieldId: string,
  historyData: CropHistoryInsert,
): Promise<CropHistoryRow> {
  const payload = { ...historyData, field_id: fieldId } as CropHistoryInsert & { field_id: string };
  const { data, error } = await supabase
    .from("crop_history")
    .insert([payload])
    .select();
  if (error) {
    throw new Error(`Failed to create crop history: ${error.message}`);
  }
  // Insert returns an array with a single record.
  return (data as CropHistoryRow[])[0];
}

/** Update an existing crop‑history record. */
export async function updateCropHistory(
  historyId: string,
  updates: Partial<CropHistoryInsert>,
): Promise<CropHistoryRow> {
  const { data, error } = await supabase
    .from("crop_history")
    .update(updates)
    .eq("id", historyId)
    .select();
  if (error) {
    throw new Error(`Failed to update crop history ${historyId}: ${error.message}`);
  }
  return (data as CropHistoryRow[])[0];
}

/** Delete a crop‑history record by its UUID. */
export async function deleteCropHistory(historyId: string): Promise<void> {
  const { error } = await supabase.from("crop_history").delete().eq("id", historyId);
  if (error) {
    throw new Error(`Failed to delete crop history ${historyId}: ${error.message}`);
  }
}

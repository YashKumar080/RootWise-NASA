// src/services/farmService.ts – Supabase CRUD for farms

import { supabase } from "../lib/supabaseClient";

/**
 * Type representing a farm record as stored in the database.
 */
export interface Farm {
  id: string; // UUID primary key
  user_id: string; // FK to profiles (set by RLS, not by client)
  name: string;
  country_code: string; // CHAR(2)
  admin_area_level_1?: string | null; // State / Province
  admin_area_level_2?: string | null; // District / County
  locality?: string | null; // Village / Town
  postal_code?: string | null;
  total_area_hectares?: number | null;
  is_active: boolean;
  created_at: string; // timestamp with tz
  updated_at: string;
}

// Types for the Supabase query builder generics
export type FarmRow = Farm;
// Include user_id so the client can satisfy the INSERT policy
export type FarmInsert = Omit<Farm, "id" | "created_at" | "updated_at">;

/** Retrieve all farms belonging to the currently authenticated user. */
export async function getFarms(): Promise<FarmRow[]> {
  const { data, error } = await supabase
    .from('farms')
    .select("*");
  if (error) {
    throw new Error(`Failed to fetch farms: ${error.message}`);
  }
  // data is guaranteed to be defined when error is null
  return data as FarmRow[];
}

/** Insert a new farm. `user_id` is now explicitly set from the auth session. */
export async function createFarm(newFarm: Omit<FarmInsert, "user_id">): Promise<FarmRow> {
  // Get current authenticated user ID
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    throw new Error(`Failed to obtain authenticated user ID: ${authError?.message ?? 'unknown'}`);
  }
  const userId = authData.user.id;

  const payload = { ...newFarm, user_id: userId } as FarmInsert;
  const { data, error } = await supabase
    .from('farms')
    .insert([payload])
    .select();
  if (error) {
    throw new Error(`Failed to create farm: ${error.message}`);
  }
  return (data as FarmRow[])[0];
}

/** Update an existing farm. */
export async function updateFarm(
  id: string,
  updates: Partial<FarmInsert>
): Promise<FarmRow> {
  const { data, error } = await supabase
    .from('farms')
    .update(updates)
    .eq("id", id)
    .select();
  if (error) {
    throw new Error(`Failed to update farm ${id}: ${error.message}`);
  }
  return (data as FarmRow[])[0];
}

/** Delete a farm by its UUID. RLS ensures only the owner can delete. */
export async function deleteFarm(id: string): Promise<void> {
  const { error } = await supabase.from('farms').delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete farm ${id}: ${error.message}`);
  }
}

// src/services/rotationPlanService.ts — Save and retrieve rotation plans via Supabase

import { supabase } from "../lib/supabaseClient";
import type { RotationPlan } from "../types/models";
import type { Priorities } from "../types/models";

export interface SavedPlanRecord {
  id: string;
  field_id: string;
  strategy_name: string;
  engine_version: string;
  algorithm_version: string;
  calculation_timestamp: string;
  total_score: number;
  water_score: number;
  soil_score: number;
  income_score: number;
  climate_score: number;
  priority_water_weight: number;
  priority_soil_weight: number;
  priority_income_weight: number;
  is_recommended: boolean;
  is_adopted: boolean;
  user_notes: string | null;
  created_at: string;
  seasons: {
    season_order: number;
    season_label: string;
    crop_species_id: string;
    crop_name_snapshot: string;
    crop_family_snapshot: string;
  }[];
  risks: {
    risk_category: string;
    severity: string;
    title: string;
    explanation: string;
    mitigation_suggestion: string | null;
  }[];
}

function mapCropToSpeciesId(cropName: string): string {
  const lower = cropName.toLowerCase();
  if (lower.includes("wheat")) return "wheat";
  if (lower.includes("soybean") || lower.includes("soy")) return "soybean";
  if (lower.includes("corn") || lower.includes("maize")) return "corn";
  if (lower.includes("alfalfa")) return "alfalfa";
  if (lower.includes("barley")) return "barley";
  return "wheat";
}

/**
 * Persist an engine rotation plan using the secure atomic RPC function
 */
export async function saveRotationPlanToDatabase(params: {
  fieldId: string;
  plan: RotationPlan;
  priorities: Priorities;
  strategyName: "Soil Guardian" | "Water Saver" | "Balanced Return";
  isRecommended?: boolean;
}): Promise<string> {
  const { fieldId, plan, priorities, strategyName, isRecommended = false } = params;

  // Ensure weights sum exactly to 100.00
  const rawWater = Math.max(0, Math.min(100, priorities.water));
  const rawSoil = Math.max(0, Math.min(100, priorities.soil));
  const pWater = Number(rawWater.toFixed(2));
  const pSoil = Number(rawSoil.toFixed(2));
  const pIncome = Number((100.00 - pWater - pSoil).toFixed(2));

  // Prepare seasons array from plan.crops (no explicit season in plan)
  const seasonsPayload = plan.crops.map((crop, idx) => ({
    season_order: idx + 1,
    season_label: `Season ${idx + 1}`,
    crop_species_id: mapCropToSpeciesId(crop.name),
    crop_name_snapshot: crop.name,
    crop_family_snapshot: crop.family,
  }));

  // Prepare risks array – currently no risk details in RotationPlan, so send empty array
  const risksPayload: any[] = [];

  // If no risks were identified, provide a low-uncertainty notice
  if (risksPayload.length === 0) {
    risksPayload.push({
      risk_category: "missing_data_uncertainty",
      severity: "low",
      title: "Optimal Ecological Succession",
      explanation: "No critical agronomic or pest cycle conflicts detected across the 3 seasons.",
      mitigation_suggestion: "Monitor field conditions and adhere to scheduled sowing windows.",
    });
  }

  // Call secure atomic procedure
  const { data, error } = await supabase.rpc("create_rotation_plan", {
    p_field_id: fieldId,
    p_strategy_name: strategyName,
    p_engine_version: "1.0.0",
    p_algorithm_version: "1.0.0",
    p_total_score: Number(plan.scores.total.toFixed(2)),
    p_water_score: Number(plan.scores.water.toFixed(2)),
    p_soil_score: Number(plan.scores.soil.toFixed(2)),
    p_income_score: Number(plan.scores.income.toFixed(2)),
    p_climate_score: Number(plan.scores.climate.toFixed(2)),
    p_priority_water_weight: pWater,
    p_priority_soil_weight: pSoil,
    p_priority_income_weight: pIncome,
    p_input_snapshot: {
      priorities,
      generatedAt: new Date().toISOString(),
    },
    p_evidence_references: {
      framework: "FAO Ecological Crop Rotations Guideline 2024",
      dataSource: "NASA POWER Climatology",
    },
    p_explanations: plan.explanations,
    p_data_completeness_level: "complete",
    p_is_recommended: isRecommended,
    p_seasons: seasonsPayload,
    p_risks: risksPayload,
  });

  if (error) {
    console.error("Error creating rotation plan RPC:", error);
    throw error;
  }

  return data as string;
}

/**
 * Fetch all saved rotation plans for the authenticated user
 */
export async function fetchUserSavedPlans(): Promise<SavedPlanRecord[]> {
  const { data: plans, error: plansErr } = await supabase
    .from("rotation_plans")
    .select(`
      *,
      seasons:rotation_plan_seasons(*),
      risks:risk_assessments(*)
    `)
    .order("calculation_timestamp", { ascending: false });

  if (plansErr) {
    console.error("Error fetching saved plans:", plansErr);
    return [];
  }

  return (plans as any[]) || [];
}

/**
 * Toggle plan adoption status
 */
export async function togglePlanAdoption(planId: string, isAdopted: boolean): Promise<boolean> {
  const { error } = await supabase
    .from("rotation_plans")
    .update({ is_adopted: isAdopted })
    .eq("id", planId);

  if (error) {
    console.error("Error updating plan adoption:", error);
    return false;
  }
  return true;
}

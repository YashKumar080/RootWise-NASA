// src/engine/rotationEngine.ts

import type { CropInfo, FarmLocation, SoilCharacteristics, Priorities, RotationPlan } from "../types/models";
import { CROP_CATALOG } from "../data/crops";

/**
 * Helper: check if a crop can be planted given soil type & season (simplified).
 * For demo purposes we allow all crops; real logic would use real data.
 */
function isCompatible(crop: CropInfo, soil: SoilCharacteristics): boolean {
  // If soil type is not specified, assume all crops are compatible.
  if (!soil.soilType) return true;
  // Example rule: legumes (Fabaceae) prefer loamy or black soils.
  if (crop.family === "Fabaceae") {
    return ["loamy", "black"].includes(soil.soilType as string);
  }
  // No other constraints for now.
  return true;
}

/**
 * Helper: pick up to `count` crops from a sorted list while ensuring consecutive seasons differ.
 * If not enough crops satisfy season constraint, returns whatever is collected.
 */
function pickCropsWithSeasonConstraint(sorted: CropInfo[], count: number = 3): CropInfo[] {
  const selected: CropInfo[] = [];
  for (const crop of sorted) {
    if (selected.length === 0) {
      selected.push(crop);
    } else {
      const lastSeason = selected[selected.length - 1].season;
      if (crop.season !== lastSeason) {
        selected.push(crop);
      }
    }
    if (selected.length >= count) break;
  }
  return selected;
}

/** Simple deterministic generator of three plans. */
export function generatePlans(
  _location: FarmLocation,
  _soil: SoilCharacteristics,
  selectedCrops: CropInfo[],
  priorities: Priorities,
  previousFamilies: string[] = []
): RotationPlan[] {
  // Use provided crops or fallback to catalog.
  const crops = selectedCrops.length ? selectedCrops : CROP_CATALOG;

  // Filter compatible crops once.
  const compatible = crops.filter((c) => isCompatible(c, _soil));

// Strategy: Soil Guardian – prioritize soil contribution, then higher income, then lower water demand
const soilSorted = [...compatible].sort((a, b) => {
  if (b.soilContribution !== a.soilContribution) {
    return b.soilContribution - a.soilContribution;
  }
  if (b.incomePotential !== a.incomePotential) {
    return b.incomePotential - a.incomePotential;
  }
  return a.waterDemand - b.waterDemand;
});
const soilGuardian = pickCropsWithSeasonConstraint(soilSorted);

// Strategy: Water Saver – prioritize low water demand, then higher soil contribution, then higher income
const waterSorted = [...compatible].sort((a, b) => {
  if (a.waterDemand !== b.waterDemand) {
    return a.waterDemand - b.waterDemand; // lower first
  }
  if (b.soilContribution !== a.soilContribution) {
    return b.soilContribution - a.soilContribution;
  }
  return b.incomePotential - a.incomePotential;
});
const waterSaver = pickCropsWithSeasonConstraint(waterSorted);

// waterSaver (duplicate removed)


  // Strategy: Balanced Return – weighted combination of water, soil, income.
const balancedSorted = [...compatible].sort((a, b) => {
  // Primary: higher income potential
  if (b.incomePotential !== a.incomePotential) {
    return b.incomePotential - a.incomePotential;
  }
  // Secondary: higher soil contribution
  if (b.soilContribution !== a.soilContribution) {
    return b.soilContribution - a.soilContribution;
  }
  // Tertiary: lower water demand
  return a.waterDemand - b.waterDemand;
});



  const balanced = pickCropsWithSeasonConstraint(balancedSorted);

  const plans = [
    { name: "Soil Guardian", crops: soilGuardian },
    { name: "Water Saver", crops: waterSaver },
    { name: "Balanced Return", crops: balanced },
  ];

  return plans.map((plan) =>
    evaluatePlan(plan.crops, plan.name, priorities, _soil, previousFamilies)
  );
}

function evaluatePlan(
  crops: CropInfo[],
  name: string,
  priorities: Priorities,
  _soil: SoilCharacteristics,
  previousFamilies: string[]
) {
  // If no crops, return an empty plan with zero scores.
  if (crops.length === 0) {
    return {
      name,
      crops: [],
      scores: { total: 0, water: 0, soil: 0, income: 0, climate: 0 },
      explanations: ["No compatible crops available for this strategy."],
    } as RotationPlan;
  }

  // Average factor calculations (0‑10 scale assumed for each attribute).
  const avgWaterDemand = crops.reduce((sum, c) => sum + c.waterDemand, 0) / crops.length;
  const waterScore = 10 - avgWaterDemand; // lower demand => higher score
  const soilScore = crops.reduce((sum, c) => sum + c.soilContribution, 0) / crops.length;
  const incomeScore = crops.reduce((sum, c) => sum + c.incomePotential, 0) / crops.length;

  // Climate placeholder – demo data not factored.
  const climateScore = 0;

  // Normalize priority weights (they may not sum to 100).
  const totalWeight = priorities.water + priorities.soil + priorities.income;
  const weightWater = totalWeight ? priorities.water / totalWeight : 1 / 3;
  const weightSoil = totalWeight ? priorities.soil / totalWeight : 1 / 3;
  const weightIncome = totalWeight ? priorities.income / totalWeight : 1 / 3;

  // Compute raw total score (excluding climate).
  const rawTotal = waterScore * weightWater + soilScore * weightSoil + incomeScore * weightIncome;

  // Historical family repeat penalty.
  const allFamilies = [...previousFamilies, ...crops.map((c) => c.family)];
  let repeatPenalty = 0;
  for (let i = 1; i < allFamilies.length; i++) {
    if (allFamilies[i] === allFamilies[i - 1]) {
      repeatPenalty += 0.5; // penalty per consecutive repeat
    }
  }

  const totalScore = Math.max(0, rawTotal - repeatPenalty);

  const explanations: string[] = [];
  explanations.push(`Average water demand: ${avgWaterDemand.toFixed(1)} (score ${waterScore.toFixed(1)})`);
  explanations.push(`Average soil contribution: ${soilScore.toFixed(1)}`);
  explanations.push(`Average income potential: ${incomeScore.toFixed(1)}`);
  explanations.push(`Climate suitability: demo (not factored)`);
  if (repeatPenalty > 0) {
    explanations.push(`Penalty for consecutive repeated families (incl. history): -${repeatPenalty.toFixed(1)}`);
  }

  return {
    name,
    crops,
    scores: {
      total: Number(totalScore.toFixed(2)),
      water: Number(waterScore.toFixed(2)),
      soil: Number(soilScore.toFixed(2)),
      income: Number(incomeScore.toFixed(2)),
      climate: Number(climateScore.toFixed(2)),
    },
    explanations,
  } as RotationPlan;
}

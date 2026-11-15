// src/types/models.ts

export interface FarmLocation {
  fieldName: string;
  state: string;
  district: string;
  latitude: number | "";
  longitude: number | "";
}

export interface SoilCharacteristics {
  soilType: "red" | "black" | "sandy" | "loamy" | "clay" | "";
  pH: number | "";
  organicCarbon: number | "";
  nitrogen?: number | "";
  phosphorus?: number | "";
  potassium?: number | "";
}

export interface CropInfo {
  id: string;
  name: string;
  family: string;
  season: "spring" | "summer" | "autumn" | "winter";
  durationMonths: number;
  waterDemand: number; // arbitrary unit 1‑10
  soilContribution: number; // 1‑10 positive impact on soil health
  incomePotential: number; // 1‑10
}

export interface Priorities {
  water: number; // sum 100
  soil: number;
  income: number;
}

export interface RotationPlan {
  name: string;
  crops: CropInfo[];
  scores: {
    total: number;
    water: number;
    soil: number;
    income: number;
    climate: number;
  };
  explanations: string[];
}

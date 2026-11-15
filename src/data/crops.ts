// src/data/crops.ts

import type { CropInfo } from "../types/models";

export const CROP_CATALOG: CropInfo[] = [
  {
    id: "c1",
    name: "Wheat",
    family: "Poaceae",
    season: "winter",
    durationMonths: 7,
    waterDemand: 6,
    soilContribution: 4,
    incomePotential: 7,
  },
  {
    id: "c2",
    name: "Soybean",
    family: "Fabaceae",
    season: "summer",
    durationMonths: 5,
    waterDemand: 5,
    soilContribution: 8,
    incomePotential: 6,
  },
  {
    id: "c3",
    name: "Corn",
    family: "Poaceae",
    season: "summer",
    durationMonths: 6,
    waterDemand: 7,
    soilContribution: 3,
    incomePotential: 8,
  },
  {
    id: "c4",
    name: "Alfalfa",
    family: "Fabaceae",
    season: "spring",
    durationMonths: 4,
    waterDemand: 4,
    soilContribution: 9,
    incomePotential: 5,
  },
  {
    id: "c5",
    name: "Barley",
    family: "Poaceae",
    season: "autumn",
    durationMonths: 5,
    waterDemand: 5,
    soilContribution: 5,
    incomePotential: 6,
  },
];

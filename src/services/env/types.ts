// src/services/env/types.ts

/**
 * Base metadata shared by all environmental observations.
 */
export interface EnvMeta {
  /** Human‑readable name of the dataset/product */
  dataset: string;
  /** Platform that provided the data (NASA POWER, Meteomatics…) */
  platform: string;
  /** Parameter identifier used in the provider API */
  parameter: string;
  /** Units of the measured value */
  unit: string;
  /** Spatial resolution (e.g. "0.1° (~10 km)") */
  spatialResolution: string;
  /** Temporal resolution (e.g. "daily", "monthly") */
  temporalResolution: string;
  /** Observation datetime (UTC) of the value */
  observationDate: string;
  /** Timestamp when we retrieved the value */
  retrievalTimestamp: string;
  /** Date range covered when the value is an aggregate */
  dateRange: { start: string; end: string };
}

/** Single time‑series point or aggregated value */
export interface EnvValue {
  /** Numeric value; `null` indicates missing data */
  value: number | null;
  /** Associated metadata */
  meta: EnvMeta;
}

/** Collection of the three required environmental metrics */
export interface EnvData {
  source: "NASA POWER" | "Meteomatics";
  rainfall: EnvValue; // precipitation
  temperature: EnvValue; // air temperature
  soilMoisture: EnvValue; // SMAP surface/ root‑zone moisture
}

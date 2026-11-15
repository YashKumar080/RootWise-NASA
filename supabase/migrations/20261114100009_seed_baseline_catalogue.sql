-- supabase/migrations/20261114300009_seed_baseline_catalogue.sql
-- Migration 09: Seed initial baseline crop species, regional profiles, and environmental data sources

-- 1. Seed Data Sources
INSERT INTO public.data_sources (
    id, provider_name, dataset_name, platform_code, default_spatial_resolution, default_temporal_resolution, documentation_url
) VALUES 
(
    'nasa_power_ag',
    'NASA POWER',
    'Agroclimatology Daily Methodology',
    'MERRA-2 / CERES',
    '0.5x0.625 deg',
    'daily',
    'https://power.larc.nasa.gov/docs/methodology/communities/'
),
(
    'nasa_power_hy',
    'NASA POWER',
    'Hydrology Land Surface & SMAP L4',
    'MERRA-2 / SMAP L4',
    '9km EASE-Grid / 0.5x0.625 deg',
    'daily',
    'https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/'
),
(
    'meteomatics',
    'Meteomatics',
    'Numerical Weather Prediction API',
    'ECMWF / Mix NWP',
    '0.08 deg (~9km)',
    'hourly',
    'https://www.meteomatics.com/en/api/overview/'
),
(
    'synthetic_demo',
    'ROOTWISE Synthetic Feeds',
    'Modeled Demo Telemetry',
    'Heuristic Generator',
    'Point-based synthetic',
    'daily',
    'https://rootwise.io/docs/demo-telemetry'
)
ON CONFLICT (id) DO UPDATE SET
    provider_name = EXCLUDED.provider_name,
    dataset_name = EXCLUDED.dataset_name;

-- 2. Seed Baseline Biological Crop Species
INSERT INTO public.crop_species (
    id, common_name, botanical_name, family, genus, 
    is_nitrogen_fixing, nitrogen_fixation_type, rooting_depth_category, nitrogen_fixation_notes, biological_source_reference
) VALUES
(
    'wheat',
    'Wheat',
    'Triticum aestivum',
    'Poaceae',
    'Triticum',
    false,
    'none',
    'medium',
    'Non-leguminous cereal with extensive fibrous root network.',
    'USDA PLANTS Database: TRAE'
),
(
    'soybean',
    'Soybean',
    'Glycine max',
    'Fabaceae',
    'Glycine',
    true,
    'rhizobial_symbiosis',
    'medium',
    'Forms symbiotic nodules with Bradyrhizobium japonicum fixing atmospheric nitrogen.',
    'FAO Agronomic Crop Compendium'
),
(
    'corn',
    'Corn (Maize)',
    'Zea mays',
    'Poaceae',
    'Zea',
    false,
    'none',
    'deep',
    'Heavy nutrient-demanding C4 graminaceous crop.',
    'USDA PLANTS Database: ZEMA'
),
(
    'alfalfa',
    'Alfalfa (Lucerne)',
    'Medicago sativa',
    'Fabaceae',
    'Medicago',
    true,
    'rhizobial_symbiosis',
    'deep',
    'Perennial forage legume symbiotic with Sinorhizobium meliloti; superior nitrogen credit contribution.',
    'FAO Legume Factsheets'
),
(
    'barley',
    'Barley',
    'Hordeum vulgare',
    'Poaceae',
    'Hordeum',
    false,
    'none',
    'shallow',
    'Moderate salinity-tolerant cool season cereal.',
    'USDA PLANTS Database: HOVU'
)
ON CONFLICT (id) DO UPDATE SET
    common_name = EXCLUDED.common_name,
    botanical_name = EXCLUDED.botanical_name,
    is_nitrogen_fixing = EXCLUDED.is_nitrogen_fixing,
    nitrogen_fixation_type = EXCLUDED.nitrogen_fixation_type;

-- 3. Seed Provisional Regional Profiles
INSERT INTO public.crop_regional_profiles (
    crop_species_id, country_code, region_name, agroecological_zone, seasonal_cycle_name,
    typical_sowing_month_start, typical_sowing_month_end, duration_days_min, duration_days_max,
    water_demand_rating, soil_contribution_rating, income_potential_rating,
    compatible_soil_textures, data_source_reference, validation_status
) VALUES
(
    'wheat',
    'US',
    'Northern Great Plains',
    'Temperate Continental',
    'Winter',
    9, 11, 210, 240,
    6, 4, 7,
    ARRAY['clay_loam', 'loam', 'silt_loam'],
    'State Extension Agronomy Guidelines',
    'provisional'
),
(
    'soybean',
    'US',
    'Corn Belt / Midwest',
    'Humid Continental',
    'Summer',
    4, 6, 120, 150,
    5, 8, 6,
    ARRAY['clay_loam', 'sandy_clay_loam', 'loam', 'silt_loam'],
    'University Extension Recommendations',
    'provisional'
),
(
    'corn',
    'US',
    'Corn Belt / Midwest',
    'Humid Continental',
    'Summer',
    4, 5, 130, 160,
    7, 3, 8,
    ARRAY['clay_loam', 'silt_loam', 'loam'],
    'State Extension Agronomy Guidelines',
    'provisional'
),
(
    'alfalfa',
    'US',
    'Intermountain West',
    'Semi-Arid',
    'Spring',
    3, 5, 120, 150,
    4, 9, 5,
    ARRAY['loam', 'sandy_loam', 'clay_loam'],
    'USDA NRCS Conservation Practice Standard',
    'provisional'
),
(
    'barley',
    'US',
    'Northern Plains',
    'Semi-Arid Steppe',
    'Autumn',
    8, 10, 140, 170,
    5, 5, 6,
    ARRAY['loam', 'sandy_loam', 'clay_loam', 'silt_loam'],
    'State Extension Agronomy Guidelines',
    'provisional'
);

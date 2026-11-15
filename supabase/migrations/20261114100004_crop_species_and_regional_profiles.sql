-- supabase/migrations/20261114300004_crop_species_and_regional_profiles.sql
-- Migration 04: Base botanical crop species and decoupled regional profiles

-- 1. Base Crop Species (Biological Taxonomy)
CREATE TABLE public.crop_species (
    id TEXT PRIMARY KEY, -- e.g., 'triticum_aestivum', 'glycine_max'
    common_name TEXT NOT NULL,
    botanical_name TEXT NOT NULL,
    family TEXT NOT NULL,
    genus TEXT NOT NULL,
    
    -- Curated Biological Nitrogen Fixation (Nullable ternary: NULL = unknown, true = fixing, false = non-fixing)
    is_nitrogen_fixing BOOLEAN,
    nitrogen_fixation_type TEXT NOT NULL DEFAULT 'unknown' CHECK (nitrogen_fixation_type IN (
        'rhizobial_symbiosis', 'actinorhizal', 'associative', 'none', 'unknown'
    )),
    rooting_depth_category TEXT CHECK (rooting_depth_category IS NULL OR rooting_depth_category IN ('shallow', 'medium', 'deep')),
    nitrogen_fixation_notes TEXT,
    biological_source_reference TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    
    -- Biological Consistency Check
    CONSTRAINT chk_nitrogen_fixation_consistency CHECK (
        (is_nitrogen_fixing IS NULL AND nitrogen_fixation_type = 'unknown') OR
        (is_nitrogen_fixing = false AND nitrogen_fixation_type = 'none') OR
        (is_nitrogen_fixing = true AND nitrogen_fixation_type IN ('rhizobial_symbiosis', 'actinorhizal', 'associative'))
    )
);

-- 2. Crop Regional Profiles (Location-Specific Agronomic Attributes)
CREATE TABLE public.crop_regional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_species_id TEXT NOT NULL REFERENCES public.crop_species(id) ON DELETE RESTRICT,
    country_code CHAR(2) NOT NULL REFERENCES public.iso_countries(code),
    region_name TEXT,
    agroecological_zone TEXT,
    seasonal_cycle_name TEXT NOT NULL,
    typical_sowing_month_start INT NOT NULL CHECK (typical_sowing_month_start BETWEEN 1 AND 12),
    typical_sowing_month_end INT NOT NULL CHECK (typical_sowing_month_end BETWEEN 1 AND 12),
    duration_days_min INT NOT NULL CHECK (duration_days_min > 0),
    duration_days_max INT NOT NULL CHECK (duration_days_max >= duration_days_min),
    water_demand_rating INT NOT NULL CHECK (water_demand_rating BETWEEN 1 AND 10),
    soil_contribution_rating INT NOT NULL CHECK (soil_contribution_rating BETWEEN 1 AND 10),
    income_potential_rating INT NOT NULL CHECK (income_potential_rating BETWEEN 1 AND 10),
    compatible_soil_textures TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    data_source_reference TEXT,
    
    -- Strict default of PROVISIONAL
    validation_status TEXT NOT NULL DEFAULT 'provisional' 
        CHECK (validation_status IN ('verified', 'provisional', 'community')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now()
);

CREATE INDEX idx_crop_reg_species_country ON public.crop_regional_profiles(crop_species_id, country_code);

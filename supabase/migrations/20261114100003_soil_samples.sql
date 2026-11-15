-- supabase/migrations/20261114300003_soil_samples.sql
-- Migration 03: Soil samples with explicit depths, partial report support, and strict analyte-unit integrity

CREATE TABLE public.soil_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    sample_date DATE NOT NULL,
    depth_top_cm NUMERIC(5, 1) NOT NULL DEFAULT 0.0 CHECK (depth_top_cm >= 0.0),
    depth_bottom_cm NUMERIC(5, 1) NOT NULL DEFAULT 15.0 CHECK (depth_bottom_cm > depth_top_cm),
    sample_origin TEXT NOT NULL CHECK (sample_origin IN (
        'lab_certified', 'field_test_kit', 'in_situ_sensor', 'farmer_estimate'
    )),
    soil_texture_class TEXT CHECK (soil_texture_class IS NULL OR soil_texture_class IN (
        'clay', 'sandy_clay', 'silty_clay', 'clay_loam', 'sandy_clay_loam', 
        'silty_clay_loam', 'loam', 'sandy_loam', 'silt_loam', 'silt', 'loamy_sand', 'sand'
    )),
    ph NUMERIC(4, 2) CHECK (ph IS NULL OR (ph BETWEEN 0.0 AND 14.0)),
    organic_carbon_pct NUMERIC(5, 3) CHECK (organic_carbon_pct IS NULL OR (organic_carbon_pct >= 0.0)),
    organic_matter_method TEXT CHECK (organic_matter_method IS NULL OR organic_matter_method IN (
        'walkley_black', 'loss_on_ignition', 'elemental_analyser'
    )),
    
    -- Nitrogen
    nitrogen_value NUMERIC(8, 2) CHECK (nitrogen_value IS NULL OR nitrogen_value >= 0.0),
    nitrogen_unit TEXT CHECK (nitrogen_unit IS NULL OR nitrogen_unit IN ('kg_ha', 'ppm_mg_kg')),
    
    -- Phosphorus
    phosphorus_value NUMERIC(8, 2) CHECK (phosphorus_value IS NULL OR phosphorus_value >= 0.0),
    phosphorus_unit TEXT CHECK (phosphorus_unit IS NULL OR phosphorus_unit IN ('kg_ha', 'ppm_mg_kg')),
    extraction_method_p TEXT CHECK (extraction_method_p IS NULL OR extraction_method_p IN (
        'olsen', 'bray_1', 'bray_2', 'mehlich_3', 'resin', 'water'
    )),
    
    -- Potassium
    potassium_value NUMERIC(8, 2) CHECK (potassium_value IS NULL OR potassium_value >= 0.0),
    potassium_unit TEXT CHECK (potassium_unit IS NULL OR potassium_unit IN ('kg_ha', 'ppm_mg_kg', 'meq_100g')),
    extraction_method_k TEXT CHECK (extraction_method_k IS NULL OR extraction_method_k IN (
        'ammonium_acetate', 'mehlich_3'
    )),
    
    electrical_conductivity_ds_m NUMERIC(6, 3) CHECK (electrical_conductivity_ds_m IS NULL OR electrical_conductivity_ds_m >= 0.0),
    laboratory_name TEXT,
    laboratory_sample_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    
    -- Analyte Integrity: value requires unit, unit requires value
    CONSTRAINT chk_nitrogen_pair CHECK (
        (nitrogen_value IS NULL AND nitrogen_unit IS NULL) OR
        (nitrogen_value IS NOT NULL AND nitrogen_unit IS NOT NULL)
    ),
    CONSTRAINT chk_phosphorus_pair CHECK (
        (phosphorus_value IS NULL AND phosphorus_unit IS NULL AND extraction_method_p IS NULL) OR
        (phosphorus_value IS NOT NULL AND phosphorus_unit IS NOT NULL)
    ),
    CONSTRAINT chk_potassium_pair CHECK (
        (potassium_value IS NULL AND potassium_unit IS NULL AND extraction_method_k IS NULL) OR
        (potassium_value IS NOT NULL AND potassium_unit IS NOT NULL)
    )
);

CREATE INDEX idx_soil_samples_field_date ON public.soil_samples(field_id, sample_date DESC);

CREATE TRIGGER trg_soil_samples_updated_at
    BEFORE UPDATE ON public.soil_samples
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

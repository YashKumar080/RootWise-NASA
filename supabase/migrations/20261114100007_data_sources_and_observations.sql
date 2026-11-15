-- supabase/migrations/20261114300007_data_sources_and_observations.sql
-- Migration 07: Environmental data sources and forecast-compatible observation registry

-- 1. Data Sources Table
CREATE TABLE public.data_sources (
    id TEXT PRIMARY KEY, -- 'nasa_power_ag', 'nasa_power_hy', 'meteomatics', 'synthetic_demo'
    provider_name TEXT NOT NULL,
    dataset_name TEXT NOT NULL,
    platform_code TEXT NOT NULL,
    default_spatial_resolution TEXT NOT NULL,
    default_temporal_resolution TEXT NOT NULL,
    documentation_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now()
);

-- 2. Environmental Observations Table
CREATE TABLE public.environmental_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    data_source_id TEXT NOT NULL REFERENCES public.data_sources(id),
    
    -- Target Valid Timestamp and Bounded Period
    valid_timestamp TIMESTAMPTZ NOT NULL,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    retrieval_timestamp TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    forecast_reference_timestamp TIMESTAMPTZ, -- Model issue/run time (mandatory for forecasts, null for historical)
    
    observation_type TEXT NOT NULL CHECK (observation_type IN (
        'historical_reanalysis', 'in_situ_station', 'nowcast_analysis', 'forecast', 'climatology_normal'
    )),
    
    provider_code TEXT NOT NULL,
    model_or_product TEXT NOT NULL,   -- e.g., 'merra2', 'smap_l4', 'ifs_0.1', 'mix'
    spatial_resolution TEXT NOT NULL, -- e.g., '9km EASE-Grid', '0.5x0.625 deg'
    temporal_resolution TEXT NOT NULL CHECK (temporal_resolution IN ('hourly', 'daily', 'monthly', 'climatological_normal')),
    
    canonical_parameter TEXT NOT NULL CHECK (canonical_parameter IN (
        'precipitation', 'temperature_avg', 'temperature_min', 'temperature_max',
        'soil_wetness_surface', 'soil_wetness_rootzone',
        'soil_moisture_vol_sfc', 'soil_moisture_vol_rz',
        'solar_radiation', 'relative_humidity'
    )),
    native_parameter_code TEXT NOT NULL,
    value NUMERIC(12, 5), -- NULL indicates missing reading
    native_unit TEXT NOT NULL,
    
    missing_data_flag BOOLEAN NOT NULL DEFAULT false,
    quality_status TEXT NOT NULL DEFAULT 'passed_qc' CHECK (quality_status IN (
        'passed_qc', 'interpolated', 'sensor_fault', 'synthetic_modeled'
    )),
    is_demo BOOLEAN NOT NULL DEFAULT false,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    
    -- Period Consistency: both NULL or both present, with period_end >= period_start
    CONSTRAINT chk_period_consistency CHECK (
        (period_start IS NULL AND period_end IS NULL) OR
        (period_start IS NOT NULL AND period_end IS NOT NULL AND period_end >= period_start)
    ),
    
    -- Forecast Consistency: Forecast observations REQUIRE run reference; Non-forecasts must NOT have run reference
    CONSTRAINT chk_forecast_reference_consistency CHECK (
        (observation_type = 'forecast' AND forecast_reference_timestamp IS NOT NULL) OR
        (observation_type <> 'forecast' AND forecast_reference_timestamp IS NULL)
    ),
    
    -- Missing Data Flag Consistency
    CONSTRAINT chk_missing_data_consistency CHECK (
        (value IS NULL AND missing_data_flag = true) OR
        (value IS NOT NULL AND missing_data_flag = false)
    ),
    
    -- PostgreSQL 15 NULLS NOT DISTINCT:
    -- Distinct forecast runs for identical valid target timestamps are preserved
    CONSTRAINT uq_env_obs_series UNIQUE NULLS NOT DISTINCT (
        field_id,
        canonical_parameter,
        valid_timestamp,
        data_source_id,
        model_or_product,
        forecast_reference_timestamp
    )
);

CREATE INDEX idx_env_obs_lookup ON public.environmental_observations(field_id, canonical_parameter, valid_timestamp DESC);
CREATE INDEX idx_env_obs_forecast_run ON public.environmental_observations(field_id, forecast_reference_timestamp) 
    WHERE forecast_reference_timestamp IS NOT NULL;

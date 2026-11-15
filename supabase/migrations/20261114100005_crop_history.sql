-- supabase/migrations/20261114300005_crop_history.sql
-- Migration 05: Historical field crop records

CREATE TABLE public.crop_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    crop_species_id TEXT REFERENCES public.crop_species(id) ON DELETE SET NULL,
    crop_name_override TEXT,
    crop_family TEXT NOT NULL,
    season_identifier TEXT NOT NULL,
    planting_date DATE,
    harvest_date DATE CHECK (harvest_date IS NULL OR planting_date IS NULL OR harvest_date >= planting_date),
    yield_metric_tons_ha NUMERIC(7, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now()
);

CREATE INDEX idx_crop_history_field_dates ON public.crop_history(field_id, harvest_date DESC NULLS LAST);

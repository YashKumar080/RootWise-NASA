-- supabase/migrations/20261114300006_rotation_planning_engine.sql
-- Migration 06: Rotation plan snapshot storage and atomic plan creation function

-- 1. Rotation Plans Table
CREATE TABLE public.rotation_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    strategy_name TEXT NOT NULL CHECK (strategy_name IN ('Soil Guardian', 'Water Saver', 'Balanced Return')),
    engine_version TEXT NOT NULL,
    algorithm_version TEXT NOT NULL,
    calculation_timestamp TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    
    -- Calculated Factor Scores
    total_score NUMERIC(5, 2) NOT NULL,
    water_score NUMERIC(5, 2) NOT NULL,
    soil_score NUMERIC(5, 2) NOT NULL,
    income_score NUMERIC(5, 2) NOT NULL,
    climate_score NUMERIC(5, 2) NOT NULL,
    
    -- Priority Weights: 0-100 with EXACT sum of 100.00 (No ROUND masking)
    priority_water_weight NUMERIC(5, 2) NOT NULL CHECK (priority_water_weight BETWEEN 0.00 AND 100.00),
    priority_soil_weight NUMERIC(5, 2) NOT NULL CHECK (priority_soil_weight BETWEEN 0.00 AND 100.00),
    priority_income_weight NUMERIC(5, 2) NOT NULL CHECK (priority_income_weight BETWEEN 0.00 AND 100.00),
    
    input_snapshot JSONB NOT NULL,
    evidence_references JSONB NOT NULL,
    explanations JSONB NOT NULL DEFAULT '[]'::jsonb,
    data_completeness_level TEXT NOT NULL CHECK (data_completeness_level IN ('complete', 'partial', 'minimal_demo')),
    is_recommended BOOLEAN NOT NULL DEFAULT false,
    
    -- Mutable User Adoption Status
    is_adopted BOOLEAN NOT NULL DEFAULT false,
    user_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    
    CONSTRAINT chk_rotation_weights_exact_100 CHECK (
        priority_water_weight + priority_soil_weight + priority_income_weight = 100.00
    )
);

CREATE INDEX idx_rotation_plans_field_id ON public.rotation_plans(field_id);
CREATE INDEX idx_rotation_plans_user_id ON public.rotation_plans(user_id);

CREATE TRIGGER trg_rotation_plans_updated_at
    BEFORE UPDATE ON public.rotation_plans
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 2. Rotation Plan Seasons Table (Immutable Child Snapshot)
CREATE TABLE public.rotation_plan_seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rotation_plan_id UUID NOT NULL REFERENCES public.rotation_plans(id) ON DELETE CASCADE,
    season_order INT NOT NULL CHECK (season_order BETWEEN 1 AND 12),
    season_label TEXT NOT NULL,
    crop_species_id TEXT NOT NULL REFERENCES public.crop_species(id),
    crop_regional_profile_id UUID REFERENCES public.crop_regional_profiles(id),
    crop_name_snapshot TEXT NOT NULL,
    crop_family_snapshot TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
    UNIQUE(rotation_plan_id, season_order)
);

CREATE INDEX idx_plan_seasons_order ON public.rotation_plan_seasons(rotation_plan_id, season_order);

-- 3. Risk Assessments Table (Immutable Child Snapshot)
CREATE TABLE public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rotation_plan_id UUID NOT NULL REFERENCES public.rotation_plans(id) ON DELETE CASCADE,
    risk_category TEXT NOT NULL CHECK (risk_category IN (
        'water_deficit', 'crop_family_repetition', 'soil_incompatibility',
        'seasonal_timing', 'climate_exposure', 'missing_data_uncertainty'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    explanation TEXT NOT NULL,
    mitigation_suggestion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now()
);

CREATE INDEX idx_risk_assessments_plan_id ON public.risk_assessments(rotation_plan_id);

-- 4. Defensive Trigger: Field Ownership Integrity on Rotation Plans
CREATE OR REPLACE FUNCTION public.validate_rotation_plan_field_ownership()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_field_owner_id UUID;
BEGIN
    SELECT fm.user_id INTO v_field_owner_id
    FROM public.fields f
    JOIN public.farms fm ON fm.id = f.farm_id
    WHERE f.id = NEW.field_id;

    IF v_field_owner_id IS NULL THEN
        RAISE EXCEPTION 'Target field % does not exist.', NEW.field_id
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    IF v_field_owner_id <> NEW.user_id THEN
        RAISE EXCEPTION 'Authorization violation: User % cannot attach a plan to field % owned by user %',
            NEW.user_id, NEW.field_id, v_field_owner_id
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_rotation_plan_field_ownership() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_rotation_plan_field_ownership() TO postgres, service_role;

CREATE TRIGGER trg_validate_rotation_plan_ownership
    BEFORE INSERT OR UPDATE OF field_id, user_id ON public.rotation_plans
    FOR EACH ROW EXECUTE FUNCTION public.validate_rotation_plan_field_ownership();

-- 5. Secure Atomic Operation: create_rotation_plan
-- Authenticated users generate plans via this procedure rather than direct client table inserts.
CREATE OR REPLACE FUNCTION public.create_rotation_plan(
    p_field_id UUID,
    p_strategy_name TEXT,
    p_engine_version TEXT,
    p_algorithm_version TEXT,
    p_total_score NUMERIC(5, 2),
    p_water_score NUMERIC(5, 2),
    p_soil_score NUMERIC(5, 2),
    p_income_score NUMERIC(5, 2),
    p_climate_score NUMERIC(5, 2),
    p_priority_water_weight NUMERIC(5, 2),
    p_priority_soil_weight NUMERIC(5, 2),
    p_priority_income_weight NUMERIC(5, 2),
    p_input_snapshot JSONB,
    p_evidence_references JSONB,
    p_explanations JSONB,
    p_data_completeness_level TEXT,
    p_is_recommended BOOLEAN,
    p_seasons JSONB,
    p_risks JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_field_exists BOOLEAN;
    v_plan_id UUID;
    v_season_elem JSONB;
    v_risk_elem JSONB;
    v_crop_exists BOOLEAN;
BEGIN
    -- 1. Derive authenticated user identity strictly from auth.uid()
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: User must be signed in to create a rotation plan.'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- 2. Validate field ownership strictly against authenticated user
    SELECT EXISTS (
        SELECT 1
        FROM public.fields f
        JOIN public.farms fm ON fm.id = f.farm_id
        WHERE f.id = p_field_id AND fm.user_id = v_user_id
    ) INTO v_field_exists;

    IF NOT v_field_exists THEN
        RAISE EXCEPTION 'Authorization violation: Field % does not exist or does not belong to user %',
            p_field_id, v_user_id
            USING ERRCODE = 'check_violation';
    END IF;

    -- 3. Validate strategy name
    IF p_strategy_name NOT IN ('Soil Guardian', 'Water Saver', 'Balanced Return') THEN
        RAISE EXCEPTION 'Invalid strategy name: %', p_strategy_name
            USING ERRCODE = 'check_violation';
    END IF;

    -- 4. Validate exact weight summation (no round masking, each 0-100, exact sum = 100.00)
    IF (p_priority_water_weight < 0.00 OR p_priority_water_weight > 100.00 OR
        p_priority_soil_weight < 0.00 OR p_priority_soil_weight > 100.00 OR
        p_priority_income_weight < 0.00 OR p_priority_income_weight > 100.00 OR
        (p_priority_water_weight + p_priority_soil_weight + p_priority_income_weight <> 100.00)) THEN
        RAISE EXCEPTION 'Invalid priorities: Weights must each be between 0 and 100 and sum exactly to 100.00'
            USING ERRCODE = 'check_violation';
    END IF;

    -- 5. Validate seasons JSON input structure and crop references
    IF p_seasons IS NULL OR pg_catalog.jsonb_typeof(p_seasons) <> 'array' OR pg_catalog.jsonb_array_length(p_seasons) = 0 THEN
        RAISE EXCEPTION 'Rotation plan must contain a non-empty array of seasons.'
            USING ERRCODE = 'check_violation';
    END IF;

    FOR v_season_elem IN SELECT * FROM pg_catalog.jsonb_array_elements(p_seasons)
    LOOP
        IF v_season_elem->>'season_order' IS NULL OR 
           (v_season_elem->>'season_order')::INT < 1 OR 
           (v_season_elem->>'season_order')::INT > 12 THEN
            RAISE EXCEPTION 'Invalid season_order in submitted season: %', v_season_elem
                USING ERRCODE = 'check_violation';
        END IF;

        IF v_season_elem->>'crop_species_id' IS NULL OR length(v_season_elem->>'crop_species_id') = 0 THEN
            RAISE EXCEPTION 'Missing crop_species_id in submitted season: %', v_season_elem
                USING ERRCODE = 'check_violation';
        END IF;

        -- Check that crop_species_id exists in catalog
        SELECT EXISTS (
            SELECT 1 FROM public.crop_species cs WHERE cs.id = v_season_elem->>'crop_species_id'
        ) INTO v_crop_exists;

        IF NOT v_crop_exists THEN
            RAISE EXCEPTION 'Invalid crop reference: % does not exist in crop_species catalog', v_season_elem->>'crop_species_id'
                USING ERRCODE = 'check_violation';
        END IF;
    END LOOP;

    -- 6. Validate risks JSON input structure if present
    IF p_risks IS NOT NULL AND pg_catalog.jsonb_typeof(p_risks) = 'array' THEN
        FOR v_risk_elem IN SELECT * FROM pg_catalog.jsonb_array_elements(p_risks)
        LOOP
            IF v_risk_elem->>'risk_category' NOT IN (
                'water_deficit', 'crop_family_repetition', 'soil_incompatibility',
                'seasonal_timing', 'climate_exposure', 'missing_data_uncertainty'
            ) THEN
                RAISE EXCEPTION 'Invalid risk_category: %', v_risk_elem->>'risk_category'
                    USING ERRCODE = 'check_violation';
            END IF;

            IF v_risk_elem->>'severity' NOT IN ('low', 'medium', 'high', 'critical') THEN
                RAISE EXCEPTION 'Invalid risk severity: %', v_risk_elem->>'severity'
                    USING ERRCODE = 'check_violation';
            END IF;
        END LOOP;
    END IF;

    -- 7. Insert Parent Plan Record
    INSERT INTO public.rotation_plans (
        field_id,
        user_id,
        strategy_name,
        engine_version,
        algorithm_version,
        total_score,
        water_score,
        soil_score,
        income_score,
        climate_score,
        priority_water_weight,
        priority_soil_weight,
        priority_income_weight,
        input_snapshot,
        evidence_references,
        explanations,
        data_completeness_level,
        is_recommended
    ) VALUES (
        p_field_id,
        v_user_id,
        p_strategy_name,
        p_engine_version,
        p_algorithm_version,
        p_total_score,
        p_water_score,
        p_soil_score,
        p_income_score,
        p_climate_score,
        p_priority_water_weight,
        p_priority_soil_weight,
        p_priority_income_weight,
        COALESCE(p_input_snapshot, '{}'::jsonb),
        COALESCE(p_evidence_references, '{}'::jsonb),
        COALESCE(p_explanations, '[]'::jsonb),
        p_data_completeness_level,
        COALESCE(p_is_recommended, false)
    )
    RETURNING id INTO v_plan_id;

    -- 8. Atomically insert child season sequence
    INSERT INTO public.rotation_plan_seasons (
        rotation_plan_id,
        season_order,
        season_label,
        crop_species_id,
        crop_regional_profile_id,
        crop_name_snapshot,
        crop_family_snapshot
    )
    SELECT
        v_plan_id,
        (s->>'season_order')::INT,
        s->>'season_label',
        s->>'crop_species_id',
        CASE WHEN s->>'crop_regional_profile_id' IS NOT NULL 
             THEN (s->>'crop_regional_profile_id')::UUID ELSE NULL END,
        COALESCE(s->>'crop_name_snapshot', s->>'crop_species_id'),
        COALESCE(s->>'crop_family_snapshot', 'Unknown')
    FROM pg_catalog.jsonb_array_elements(p_seasons) AS s;

    -- 9. Atomically insert associated risk assessments
    IF p_risks IS NOT NULL AND pg_catalog.jsonb_typeof(p_risks) = 'array' AND pg_catalog.jsonb_array_length(p_risks) > 0 THEN
        INSERT INTO public.risk_assessments (
            rotation_plan_id,
            risk_category,
            severity,
            title,
            explanation,
            mitigation_suggestion
        )
        SELECT
            v_plan_id,
            r->>'risk_category',
            r->>'severity',
            r->>'title',
            r->>'explanation',
            r->>'mitigation_suggestion'
        FROM pg_catalog.jsonb_array_elements(p_risks) AS r;
    END IF;

    RETURN v_plan_id;
END;
$$;

-- Restrict execution: Only authenticated users and internal database execution (postgres).
-- service_role privilege is removed because create_rotation_plan derives user identity strictly from auth.uid().
REVOKE ALL ON FUNCTION public.create_rotation_plan FROM public, anon, service_role;
GRANT EXECUTE ON FUNCTION public.create_rotation_plan TO authenticated, postgres;
